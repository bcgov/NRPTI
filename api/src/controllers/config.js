let QueryActions = require('../utils/query-actions');

exports.protectedOptions = function (args, res, next) {
  res.status(200).send();
};

/**
 * Return the configuration data
 *
 * @returns {object}
 */
exports.protectedGetConfig = function (args, res, next) {
  console.log("Got configuration data");
  let configurationData = {};

  configurationData['ADMIN_HOSTNAME'] = process.env.ADMIN_HOSTNAME;
  configurationData['PUBLIC_HOSTNAME'] = process.env.PUBLIC_HOSTNAME;
  configurationData['API_LOCATION'] = process.env.API_LOCATION;
  configurationData['API_PATH'] = process.env.API_PATH;
  configurationData['API_PUBLIC_PATH'] = process.env.API_PUBLIC_PATH;
  configurationData['KEYCLOAK_CLIENT_ID'] = process.env.KEYCLOAK_CLIENT_ID;
  configurationData['ENVIRONMENT'] = process.env.ENVIRONMENT;

  QueryActions.sendResponse(res, 200, configurationData);
};

