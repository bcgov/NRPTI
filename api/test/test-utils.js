const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const mongooseOpts = require('./config/mongoose-options').mongooseOptions;

const app = express();
let mongoUri;

mongoose.Promise = global.Promise;
setupAppServer();

jest.setTimeout(100000);

beforeAll(async () => {
  mongoUri = process.env.MONGO_URI
  await mongoose.connect(mongoUri, mongooseOpts, err => {
    if (err) {
      throw Error(err);
    }
  });

});

afterAll(async () => {
  await mongoose.disconnect();
});

beforeEach(async () => {
  await mongoose.connect(mongoUri, mongooseOpts, err => {
    if (err) {
      throw Error(err);
    }
  });
});

afterEach(async () => {
  // clean up routes between tests to prevent roles persisting between tests
  let routes = app._router.stack;
  routes.forEach((route) => {
    if (route.path) {
      routes.pop()
    }
  })
  await mongoose.disconnect();
})


function setupAppServer() {
  app.disable("x-powered-by");
  app.use(
    bodyParser.urlencoded({
      extended: true
    })
  );
  app.use(bodyParser.json());
}

function createSwaggerParams(additionalValues = {}, roles = [], username = null) {
  let defaultParams = defaultProtectedParams(username, roles);
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

function defaultProtectedParams(username = null, roles = []) {
  const defaultRoles = [
    'public',
    'offline_access',
    'uma_authorization',
  ];
  let userroles = defaultRoles.concat(roles);
  return {
    auth_payload: {
      scopes: ['public'],
      // This value in the real world is pulled from the keycloak user. It will look something like
      // idir/arwhilla
      preferred_username: username,
      client_roles: userroles
    },
    dataset: {},
    _id: {},
    keywords: {},
    project: {},
    pageNum: {},
    pageSize: {},
    sortBy: {}
  };
}

function defaultPublicParams(fieldNames) {
  return {
    fields: {
      value: JSON.stringify(fieldNames)
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

function createSwaggerBodyObj(paramName, bodyObj) {
  return {
    [paramName]: {
      value: bodyObj
    }
  };
}

exports.createSwaggerParams = createSwaggerParams;
exports.createPublicSwaggerParams = createPublicSwaggerParams;
exports.buildParams = buildParams;
exports.createSwaggerBodyObj = createSwaggerBodyObj;
exports.app = app;
