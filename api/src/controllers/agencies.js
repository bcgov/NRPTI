const queryActions = require('../utils/query-actions');
const mongodb = require('../utils/mongodb');
const RECORD_TYPE = require('../utils/constants/record-type-enum');
const defaultLog = require('../utils/logger')('record');

/*
APIs for Update Issuing Agency page
Includes Get and Put apis to load and update agency names from the database
*/

exports.publicGet = async function(args, res, next) {
  const db = mongodb.connection.db(process.env.MONGODB_DATABASE || 'nrpti-dev');
  const collectionDB = db.collection('nrpti');

  let agencyList;

  try {
    //Obtain documents with Application Agency Schema
    let agencyDocuments = await collectionDB.find({ _schemaName: RECORD_TYPE.ApplicationAgency._schemaName }).toArray();
    //Using map function to iterate through the original array and creates a new array with objects containing only the _id, agencyCode, and agencyName properties.
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
* @param {*} args
* @param {*} res
* @param {*} next
* @param {*} incomingObj see example
* @returns edited lng order record
* Example of args.swagger.params.data.value
 {
     "agencies":
     [
         {
         "agencyCode": "AGENCY_ALC",
         "agencyName": "Agricultural Land Commission_1"
         }
     ]
 }
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
