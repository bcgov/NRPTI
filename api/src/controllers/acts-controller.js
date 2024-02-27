/**
 * @summary APIs for the Update Issuing Agency page.
 * @description This file contains API endpoints for loading and updating agency names from the database.
 */

const queryActions = require('../utils/query-actions');
const mongodb = require('../utils/mongodb');
const RECORD_TYPE = require('../utils/constants/record-type-enum');
const defaultLog = require('../utils/logger')('record');

exports.protectedOptions = function (args, res, next) {
  console.log('protectedOptions>>>>>>>');
  res.status(200).send();
};


/**
 * @async
 * @param {Object} args - Request arguments.
 * @param {Object} res - Response object.
 * @param {Function} next - Next function in the middleware chain.
 * @description Get API for retrieving agency code and names from the database.
 */
exports.publicGet = async function(args, res, next) {
 const db = mongodb.connection.db(process.env.MONGODB_DATABASE || 'nrpti-dev');
 const actsRegulationsCollection = db.collection('acts_regulations_mapping');

console.log('publicGet>>>>>>>');

console.log('args>>>>>>>' + args.swagger.params.actCode.value);

const actCode = args.swagger.params.actCode.value;

  let actInfo;

  try {
    // Obtain documents with Application Agency Schema
    let act = await actsRegulationsCollection.find({ _schemaName: RECORD_TYPE.ActsRegulations._schemaName, actCode: actCode}).toArray();
    // Using map function to iterate through the original array and creates
    // a new array with objects containing only the _id, agencyCode, and agencyName properties.
    actInfo = act.map(item => ({
      _id: item._id,
      actName: item.act['name'],
      regulations: item.act['regulations'],
    }));
    console.log('actinfo>>>' + JSON.stringify(actInfo));
  } catch (error) {
    defaultLog.log(error);
    throw error;
  }

  queryActions.sendResponse(res, 200, actInfo);
};
