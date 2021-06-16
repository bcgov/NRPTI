const QueryActions = require('../utils/query-actions');
const defaultLog = require('../utils/logger')('record');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const ConfigConsts = require('../utils/constants/config');
const BcmiConfig = require('./config/bcmi');
const NrcedConfig = require('./config/nrced');
const LngConfig = require('./config/lng');
const NrptiConfig = require('./config/nrpti');
const { featureFlag: FeatureFlag } = require('../models/index');

const CheckRole = function (roles, roleName, includeSysadmin = false) {
  if (includeSysadmin) {
    if (!roles.includes('sysadmin') &&
      !roles.includes(roleName)) {
      throw new Error('Permission Denied. You are not an administrator for' + roleName);
    }
  } else {
    if (!roles.includes(roleName)) {
      throw new Error('Permission Denied. You are not an administrator for' + roleName);
    }
  }
}

exports.protectedOptions = function (args, res, next) {
  res.status(200).send();
};

/**
 * Return the configuration data
 *
 * @returns {object}
 */
exports.publicGetConfig = async function (args, res, next) {
  console.log("Sent configuration data");
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

  // TODO: Put this in each respective application sub-section so we can feature-flag for each app
  // independently.
  const featureFlags = await FeatureFlag.findOne({ _schemaName: 'FeatureFlag' });
  if (featureFlags && featureFlags.data) {
    configurationData['FEATURE_FLAG'] = featureFlags.data;  
  }

  // get project specific confguration
  // fetch the latest business area specific CommunicationPackage
  // attach it to the configuration data under "COMMUNICATIONS"
  const ConfigData = mongoose.model('ConfigData');
  switch (args.swagger.params.app.value) {
    case ConfigConsts.CONFIG_APPS.BCMI:
      configurationData['ENFORCEMENT_ACTION_TEXT'] = await ConfigData.findOne({
        _schemaName: 'ConfigData',
        configApplication: ConfigConsts.CONFIG_APPS.BCMI,
        configType: ConfigConsts.CONFIG_TYPES.enforcementActionText
      });
      configurationData['COMMUNICATIONS'] = await ConfigData.findOne({
        _schemaName: 'ConfigData',
        configApplication: ConfigConsts.CONFIG_APPS.BCMI,
        configType: ConfigConsts.CONFIG_TYPES.communicationPackage
      });
      break;
    case ConfigConsts.CONFIG_APPS.NRCED:
      configurationData['COMMUNICATIONS'] = await ConfigData.findOne({
        _schemaName: 'ConfigData',
        configApplication: ConfigConsts.CONFIG_APPS.NRCED,
        configType: ConfigConsts.CONFIG_TYPES.communicationPackage
      });
      break;
    case ConfigConsts.CONFIG_APPS.LNG:
      configurationData['COMMUNICATIONS'] = await ConfigData.findOne({
        _schemaName: 'ConfigData',
        configApplication: ConfigConsts.CONFIG_APPS.LNG,
        configType: ConfigConsts.CONFIG_TYPES.communicationPackage
      });
      break;
    case ConfigConsts.CONFIG_APPS.NRPTI:
      configurationData['ENFORCEMENT_ACTION_TEXT'] = await ConfigData.findOne({
        _schemaName: 'ConfigData',
        configApplication: ConfigConsts.CONFIG_APPS.BCMI,
        configType: ConfigConsts.CONFIG_TYPES.enforcementActionText
      });
      configurationData['COMMUNICATIONS_BCMI'] = await ConfigData.findOne({
        _schemaName: 'ConfigData',
        configApplication: ConfigConsts.CONFIG_APPS.BCMI,
        configType: ConfigConsts.CONFIG_TYPES.communicationPackage
      });
      configurationData['COMMUNICATIONS_NRCED'] = await ConfigData.findOne({
        _schemaName: 'ConfigData',
        configApplication: ConfigConsts.CONFIG_APPS.NRCED,
        configType: ConfigConsts.CONFIG_TYPES.communicationPackage
      });
      configurationData['COMMUNICATIONS_LNG'] = await ConfigData.findOne({
        _schemaName: 'ConfigData',
        configApplication: ConfigConsts.CONFIG_APPS.LNG,
        configType: ConfigConsts.CONFIG_TYPES.communicationPackage
      });
      break;
    default:
      break;
  }

  QueryActions.sendResponse(res, 200, configurationData);
};

exports.protectedPostConfig = async function (args, res, next) {
  defaultLog.debug(' >> protectedPostConfig');
  let newObj = {};

  try {
    if (!args.swagger.params.data.value.configType) {
      throw new Error('You must specify a configType in data.');
    }
    switch (args.swagger.params.app.value) {
      case ConfigConsts.CONFIG_APPS.BCMI:
        CheckRole(args.swagger.params.auth_payload.realm_access.roles, 'admin:bcmi', true);
        newObj = await BcmiConfig.CreateBCMIConfig(args.swagger.params.data.value, args.swagger.params.auth_payload.displayName);
        break;
      case ConfigConsts.CONFIG_APPS.NRCED:
        CheckRole(args.swagger.params.auth_payload.realm_access.roles, 'admin:nrced', true);
        newObj = await NrcedConfig.CreateNRCEDConfig(args.swagger.params.data.value, args.swagger.params.auth_payload.displayName);
        break;
      case ConfigConsts.CONFIG_APPS.LNG:
        CheckRole(args.swagger.params.auth_payload.realm_access.roles, 'admin:lng', true);
        newObj = await LngConfig.CreateLNGConfig(args.swagger.params.data.value, args.swagger.params.auth_payload.displayName);
        break;
      case ConfigConsts.CONFIG_APPS.NRPTI:
        CheckRole(args.swagger.params.auth_payload.realm_access.roles, 'admin:nrpti', true);
        newObj = await NrptiConfig.CreateLNGConfig(args.swagger.params.data.value, args.swagger.params.auth_payload.displayName);
        break;
      default:
        throw new Error('You did not provide a valid app.')
    }
  } catch (error) {
    defaultLog.info(`Error creating Config Package: ${error}`);
    defaultLog.debug(error);
    return QueryActions.sendResponse(res, 400, {});
  }

  QueryActions.sendResponse(res, 201, newObj);
  next();
  defaultLog.debug(' << protectedPostConfig');
}

exports.protectedPutConfig = async function (args, res, next) {
  defaultLog.debug(' >> protectedPutConfig');
  let editedObj = {};

  try {
    if (!args.swagger.params.data.value.configType) {
      throw new Error('You must specify a configType in data.');
    }
    const _id = new ObjectId(args.swagger.params.configId.value);
    switch (args.swagger.params.app.value) {
      case ConfigConsts.CONFIG_APPS.BCMI:
        CheckRole(args.swagger.params.auth_payload.realm_access.roles, 'admin:bcmi', true);
        editedObj = await BcmiConfig.EditBCMIConfig(_id, args.swagger.params.data.value, args.swagger.params.auth_payload.displayName);
        break;
      case ConfigConsts.CONFIG_APPS.NRCED:
        CheckRole(args.swagger.params.auth_payload.realm_access.roles, 'admin:nrced', true);
        break;
      case ConfigConsts.CONFIG_APPS.LNG:
        CheckRole(args.swagger.params.auth_payload.realm_access.roles, 'admin:lng', true);
        break;
      case ConfigConsts.CONFIG_APPS.NRPTI:
        CheckRole(args.swagger.params.auth_payload.realm_access.roles, 'admin:nrpti', true);
        break;
      default:
        throw new Error('You did not provide a valid app.')
    }
  } catch (error) {
    defaultLog.info(`Error editing Config Package: ${error}`);
    defaultLog.debug(error);
    return QueryActions.sendResponse(res, 400, {});
  }

  QueryActions.sendResponse(res, 200, editedObj);
  next();
  defaultLog.debug(' << protectedPutConfig');
}
