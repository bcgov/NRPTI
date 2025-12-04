/**
 * @summary APIs for the Update Issuing Agency page.
 * @description This file contains API endpoints for loading and updating agency names from the database.
 */

const queryActions = require('../utils/query-actions');
const mongodb = require('../utils/mongodb');
const RECORD_TYPE = require('../utils/constants/record-type-enum');
const defaultLog = require('../utils/logger')('record');

/**
 * @async
 * @param {Object} args - Request arguments.
 * @param {Object} res - Response object.
 * @param {Function} next - Next function in the middleware chain.
 * @description Get API for retrieving agency code and names from the database.
 */
exports.publicGet = async function(args, res, next) {
  const db = mongodb.connection.db(process.env.MONGODB_DATABASE || 'nrpti-dev');
  const collectionDB = db.collection('nrpti');

  let agencyList;

  try {
    // Obtain documents with Application Agency Schema
    let agencyDocuments = await collectionDB.find({ _schemaName: RECORD_TYPE.ApplicationAgency._schemaName }).toArray();
    // Using map function to iterate through the original array and creates
    // a new array with objects containing only the _id, agencyCode, and agencyName properties.
    agencyList = agencyDocuments.map(item => ({
      _id: item._id,
      agencyCode: item.agencyCode,
      agencyName: item.agencyName
    }));
  } catch (error) {
    defaultLog.log(error);
    throw error;
  }

  queryActions.sendResponse(res, 200, agencyList);
};

/**
 * @async
 * @param {Object} args - Request arguments.
 * @param {Object} res - Response object.
 * @param {Function} next - Next function in the middleware chain.
 * @description Put API for updating agency names in the database.
 * @param {Object} incomingObj - Incoming object with agency code and the new name to update.
 * @returns {string} - Result message ('Success' or 'Error').
 * @example
 *   // Example of args.swagger.params.data.value
 *   {
 *       "agencies":
 *       [
 *           {
 *               "agencyCode": "AGENCY_ALC",
 *               "agencyName": "Agricultural Land Commission_1"
 *           }
 *       ]
 *   }
 */
exports.protectedPut = async function(args, res, next) {
  const db = mongodb.connection.db(process.env.MONGODB_DATABASE || 'nrpti-dev');
  let promises = [];
  let result = null;
  let incomingObj = args.swagger.params.data.value;
  const agencies = incomingObj['agencies'];
  if (agencies && agencies.length > 0) {
    const agencyCode = agencies[0]['agencyCode'];
    const agencyName = agencies[0]['agencyName'];
    const collectionDB = db.collection('nrpti');
    promises.push(
      collectionDB.findOneAndUpdate(
        { agencyCode: agencyCode },
        {
          $set: {
            agencyName: agencyName
          }
        }
      )
    );
  }
  try {
    await Promise.all(promises);
    result = 'Success';
  } catch (error) {
    defaultLog.info(`protectedPut - agencies controller - error updating record: ${incomingObj}`);
    defaultLog.debug(error);
    result = 'Error';
    return queryActions.sendResponse(res, 400, {});
  }
  queryActions.sendResponse(res, 200, result);
  next();
};

/**
 * gets the intermediate code (agencyCode) for the given agencyName
 * A synchronous version of getAgencyCodeFromName. Instead of using the db to lookup values,
 * this function uses some hardcoded constants.
 * This function was implemented as a temporary fix because the async version proved difficult to implement.
 * This should be replaced
 * @param {*} agencyName
 * @returns {string} agencyCode if matching code is found, else null
 */
exports.getAgencyCodeFromNameBandaid = function(agencyName) {
  const AGENCY_NAME_CODE_MAP = [
    {
      agencyCode: 'AGENCY_ALC',
      agencyName: 'Agricultural Land Commission'
    },
    {
      agencyCode: 'AGENCY_WF',
      agencyName: 'BC Wildfire Service'
    },
    {
      agencyCode: 'AGENCY_ENV_COS',
      agencyName: 'Conservation Officer Service'
    },
    {
      agencyCode: 'AGENCY_EAO',
      agencyName: 'Environmental Assessment Office'
    },
    {
      agencyCode: 'AGENCY_EMLI',
      agencyName: 'Ministry of Energy Mines and Low Carbon Innovation'
    },
    {
      agencyCode: 'AGENCY_ENV',
      agencyName: 'Ministry of Environment and Climate Change Strategy'
    },
    {
      agencyCode: 'AGENCY_ENV_BCPARKS',
      agencyName: 'BC Parks'
    },
    {
      agencyCode: 'AGENCY_OGC',
      agencyName: 'BC Energy Regulator'
    },
    {
      agencyCode: 'AGENCY_LNG',
      agencyName: 'LNG Secretariat'
    },
    {
      agencyCode: 'AGENCY_AGRI',
      agencyName: 'Ministry of Agriculture and Food'
    },
    {
      agencyCode: 'AGENCY_FLNRO',
      agencyName: 'Ministry of Forests'
    },
    {
      agencyCode: 'AGENCY_FLNR_NRO',
      agencyName: 'Natural Resource Officers'
    },
    {
      agencyCode: 'AGENCY_WLRS',
      agencyName: 'Ministry of Water, Land and Resource Stewardship'
    },
    {
      agencyCode: 'AGENCY_CAS',
      agencyName: 'Climate Action Secretariat'
    }
  ];

  const agency = AGENCY_NAME_CODE_MAP.find(agency => agency.agencyName === agencyName);

  return agency ? agency.agencyCode : null; // if no matching code is found, return null
};
