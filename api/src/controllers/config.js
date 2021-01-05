const QueryActions = require('../utils/query-actions');
const defaultLog   = require('../utils/logger')('record');
const utils        = require('../utils/constants/misc');
const { communicationPackage: CommunicationPackage }  = require('../models/index');

exports.protectedOptions = function (args, res, next) {
  res.status(200).send();
};

/**
 * Return the configuration data
 *
 * @returns {object}
 */
exports.protectedGetConfig = async function (args, res, next) {
  console.log("Got configuration data");
  let configurationData = {};

  configurationData['API_LOCATION'] = process.env.API_LOCATION;
  configurationData['API_PATH'] = process.env.API_PATH;
  configurationData['API_PUBLIC_PATH'] = process.env.API_PUBLIC_PATH;
  configurationData['KEYCLOAK_CLIENT_ID'] = process.env.KEYCLOAK_CLIENT_ID;
  configurationData['KEYCLOAK_URL'] = process.env.KEYCLOAK_URL;
  configurationData['KEYCLOAK_REALM'] = process.env.KEYCLOAK_REALM;
  configurationData['KEYCLOAK_ENABLED'] = process.env.KEYCLOAK_ENABLED;
  configurationData['GEOCODER_API'] = process.env.GEOCODER_API;
  configurationData['ENVIRONMENT'] = process.env.ENVIRONMENT;
  configurationData['debugMode'] = process.env.DEBUG_MODE;

  configurationData['IMPORT_TABLE_INTERVAL'] = process.env.IMPORT_TABLE_INTERVAL;
  configurationData['DEFAULT_IMPORT_TABLE_QUERY_PARAMS'] = process.env.DEFAULT_IMPORT_TABLE_QUERY_PARAMS;
  
  // get project specific confguration
  if (args.swagger.params.app && args.swagger.params.app.value) {
    // fetch the latest business area specific CommunicationPackage
    // attach it to the configuration data under "COMMUNICATIONS"
    const commPackage = await CommunicationPackage.findOne({ _schemaName: 'CommunicationPackage', application: args.swagger.params.app.value.toUpperCase() });
    configurationData['COMMUNICATIONS'] = commPackage;
  }

  QueryActions.sendResponse(res, 200, configurationData);
};

exports.communicationPackageCreate = async function (args, res, next) {
  defaultLog.debug(' >> communicationPackageCreate');
  let communicationPackage = null;

  try {
    if (args.swagger.params.communicationPackage && args.swagger.params.communicationPackage.value) {
      communicationPackage = args.swagger.params.communicationPackage.value
    } else {
      throw new Error('Invalid body');
    }

    // check roles. User must have the admin role for the application
    if (!args.swagger.params.auth_payload.realm_access.roles.includes('sysadmin') &&
        args.swagger.params.app.value === 'BCMI' &&
        !args.swagger.params.auth_payload.realm_access.roles.includes('admin:bcmi')) {
      throw new Error('Permission Denied. You are not an administrator for BCMI');
    } else if (!args.swagger.params.auth_payload.realm_access.roles.includes('sysadmin') &&
                args.swagger.params.app.value === 'NRCED' &&
                !args.swagger.params.auth_payload.realm_access.roles.includes('admin:nrced')) {
      throw new Error('Permission Denied. You are not an administrator for NRCED');
    } else if (!args.swagger.params.auth_payload.realm_access.roles.includes('sysadmin') &&
                args.swagger.params.app.value === 'LNG' &&
                !args.swagger.params.auth_payload.realm_access.roles.includes('admin:lng')) {
      throw new Error('Permission Denied. You are not an administrator for LNG');
    }

    let newCommPackage = new CommunicationPackage(communicationPackage);

    newCommPackage._schemaName = 'CommunicationPackage';
    newCommPackage.application = args.swagger.params.app.value.toUpperCase();
    newCommPackage.addedBy = args.swagger.params.auth_payload.displayName;
    newCommPackage.dateAdded = new Date();
    newCommPackage.write = utils.ApplicationAdminRoles;
    newCommPackage.read = utils.ApplicationAdminRoles;
    newCommPackage.read.push('public');

    // remove any existing communication pacakges for this business area
    // Future Enhancement: Don't do this. Allow users to create multiples so they can
    // queue up a series of messages. Support for multiple messages, etc.
    await CommunicationPackage.deleteMany({ _schemaName: 'CommunicationPackage', application: args.swagger.params.app.value });

    // write the communication package to the DB
    communicationPackage = await newCommPackage.save();
  } catch (error) {
    defaultLog.info(`error creating Communication Package: ${communicationPackage}`);
    defaultLog.debug(error);
    return QueryActions.sendResponse(res, 400, {});
  }

  QueryActions.sendResponse(res, 201, communicationPackage);
  next();

  defaultLog.debug(' << communicationPackageCreate');
}

