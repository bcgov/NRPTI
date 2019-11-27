const express = require('express');
const bodyParser = require('body-parser');
const DatabaseCleaner = require('database-cleaner');
const dbCleaner = new DatabaseCleaner('mongodb');
const mongoose = require('mongoose');
const mongooseOpts = require('./config/mongoose-options').mongooseOptions;
const mongoDbMemoryServer = require('mongodb-memory-server');

const app = express();
let mongoServer;
mongoose.Promise = global.Promise;
setupAppServer();

jest.setTimeout(10000);

beforeAll(async () => {
  mongoServer = new mongoDbMemoryServer.default({
    instance: {},
    binary: {
      version: '3.2.21' // Mongo Version
    }
  });
  const mongoUri = await mongoServer.getConnectionString();
  await mongoose.connect(mongoUri, mongooseOpts, err => {
    if (err) {
      throw Error(err);
    }
  });
});

afterEach(done => {
  if (mongoose.connection && mongoose.connection.db) {
    dbCleaner.clean(mongoose.connection.db, () => {
      done();
    });
  } else {
    done();
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

function setupAppServer() {
  app.use(
    bodyParser.urlencoded({
      extended: true
    })
  );
  app.use(bodyParser.json());
}

function createSwaggerParams(fieldNames, additionalValues = {}, username = null) {
  let defaultParams = defaultProtectedParams(fieldNames, username);
  let swaggerObject = {
    swagger: {
      params: { ...defaultParams, ...additionalValues },
      operation: {
        'x-security-scopes': ['sysadmin', 'public']
      }
    }
  };
  return swaggerObject;
}

function createPublicSwaggerParams(fieldNames, additionalValues = {}) {
  let defaultParams = defaultPublicParams(fieldNames);
  let swaggerObject = {
    swagger: {
      params: { ...defaultParams, ...additionalValues }
    }
  };
  return swaggerObject;
}

function defaultProtectedParams(fieldNames, username = null) {
  return {
    auth_payload: {
      scopes: ['sysadmin', 'public'],
      // This value in the real world is pulled from the keycloak user. It will look something like
      // idir/arwhilla
      preferred_username: username
    },
    fields: {
      value: JSON.parse(JSON.stringify(fieldNames))
    }
  };
}
function defaultPublicParams(fieldNames) {
  return {
    fields: {
      value: JSON.parse(JSON.stringify(fieldNames))
    }
  };
}

function buildParams(nameValueMapping) {
  let paramObj = {};
  for (let [key, value] of Object.entries(nameValueMapping)) {
    paramObj[key] = { value: value };
  }
  return paramObj;
}

exports.createSwaggerParams = createSwaggerParams;
exports.createPublicSwaggerParams = createPublicSwaggerParams;
exports.buildParams = buildParams;
exports.app = app;
