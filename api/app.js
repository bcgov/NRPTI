'use strict';

const app = require('express')();
const cron = require('node-cron');
const fs = require('fs');
const swaggerTools = require('swagger-tools');
const YAML = require('yamljs');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const swaggerConfig = YAML.load('./src/swagger/swagger.yaml');

const defaultLog = require('./src/utils/logger')('app');
const authUtils = require('./src/utils/auth-utils');

const { updateAllMaterializedViews } = require('./materialized_views/updateViews')
const { createTask } = require('./src/tasks/import-task');

const UPLOAD_DIR = process.env.UPLOAD_DIRECTORY || './uploads/';
const HOSTNAME = process.env.API_HOSTNAME || 'localhost:3000';
const DB_CONNECTION =
  'mongodb://' +
  (process.env.MONGODB_SERVICE_HOST || process.env.DB_1_PORT_27017_TCP_ADDR || 'localhost') +
  '/' +
  (process.env.MONGODB_DATABASE || 'nrpti-dev');
const DB_USERNAME = process.env.MONGODB_USERNAME || '';
const DB_PASSWORD = process.env.MONGODB_PASSWORD || '';

// Cron pattern - seconds[0-59] minutes[0-59] hours[0-23] day_of_month[1-31] months[0-11] day_of_week[0-6]
const MATERIALIZED_VIEWS_CRON_PATTERN = '*/5 * * * *';
const IMPORT_CRON_PATTERN = '0 0 * * *';

// Increase post body sizing
app.use(bodyParser.json({ limit: '10mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Enable CORS
app.use(function (req, res, next) {
  defaultLog.info(req.method, req.url);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE, HEAD');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type,Authorization,responseType');
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Cache-Control', 'max-age=4');
  next();
});

// Dynamically set the hostname based on what environment we're in.
swaggerConfig.host = HOSTNAME;

// Swagger UI needs to be told that we only serve https in Openshift
if (HOSTNAME !== 'localhost:3000') {
  swaggerConfig.schemes = ['https'];
}

swaggerTools.initializeMiddleware(swaggerConfig, async function (middleware) {
  app.use(middleware.swaggerMetadata());

  // This prevents +/- params, such as sortBy
  // const swaggerValidatorConfig = { validateResponse: false };
  // app.use(middleware.swaggerValidator(swaggerValidatorConfig));

  const swaggerSecurityConfig = {
    Bearer: authUtils.verifyToken
  };

  app.use(middleware.swaggerSecurity(swaggerSecurityConfig));

  const swaggerRouterConfig = {
    controllers: ['./src/controllers', './src/tasks'],
    useStubs: false
  };

  app.use(middleware.swaggerRouter(swaggerRouterConfig));

  const swaggerUIConfig = { apiDocs: '/api/docs', swaggerUi: '/api/docs' };

  app.use(middleware.swaggerUi(swaggerUIConfig));

  // audit call on response end
  app.use(async function (req, res, next) {
    req.on('data', function () {
      // This is a no-op, here to adhere to Node.js Streaming API: https://nodejs.org/api/stream.html#stream_event_end
    });
    req.on('end', async function () {
      if (req.audits) {
        try {
          await Promise.all(req.audits);
        } catch(err) {
          defaultLog.error('Failed to run audit calls: ' + err);
        }
      }
    });
    next();
  });

  // Ensure uploads directory exists, otherwise create it.
  try {
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR);
    }
  } catch (error) {
    defaultLog.info("Couldn't create uploads folder.  Uploads will fail until this is resolved:", error);
  }

  // Load database and models
  const mongooseDBConfig = {
    user: DB_USERNAME,
    pass: DB_PASSWORD,
    reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
    reconnectInterval: 500, // Reconnect every 500ms
    poolSize: 10, // Maintain up to 10 socket connections
    // If not connected, return errors immediately rather than waiting for reconnect
    bufferMaxEntries: 0,
    keepAlive: 1,
    connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false // https://mongoosejs.com/docs/deprecations.html#-findandmodify-
  };

  defaultLog.info('Attempting to connect to mongo database:', DB_CONNECTION);

  mongoose.connect(encodeURI(DB_CONNECTION), mongooseDBConfig).then(
    () => {
      defaultLog.info('Database connected');

      defaultLog.info('Loading database models');

      // Load database models (from directory)
      require('./src/models');

      // Start application
      app.listen(3000, '0.0.0.0', function () {
        defaultLog.info('Started server on port 3000');
      });

      startCron(defaultLog);
    },
    error => {
      defaultLog.info('Mongoose connect error:', error);
      return;
    }
  );
});

async function startCron(defaultLog) {
  // Scheduling material view updates.
  defaultLog.info('Starting cron...');
  cron.schedule(MATERIALIZED_VIEWS_CRON_PATTERN, () => updateAllMaterializedViews(defaultLog));
  defaultLog.info('Materialized Views scheduled for:', MATERIALIZED_VIEWS_CRON_PATTERN);

  // Scheduling imports
  cron.schedule(IMPORT_CRON_PATTERN, () => createTask('epic'));
  cron.schedule(IMPORT_CRON_PATTERN, () => createTask('core'));
  defaultLog.info('Imports scheduled for:', IMPORT_CRON_PATTERN);
}
