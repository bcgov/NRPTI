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
 // const db = mongodb.connection.db(process.env.MONGODB_DATABASE || 'nrpti-dev');
//  const collectionDB = db.collection('acts_regulations_mapping');

console.log('publicGet>>>>>>>');

console.log('args>>>>>>>' + args.swagger.params.actCode.value);

  let agencyList;

  // try {
  //   // Obtain documents with Application Agency Schema
  //   let agencyDocuments = await collectionDB.find({ _schemaName: RECORD_TYPE.ApplicationAgency._schemaName }).toArray();
  //   // Using map function to iterate through the original array and creates
  //   // a new array with objects containing only the _id, agencyCode, and agencyName properties.
  //   agencyList = agencyDocuments.map(item => ({
  //     _id: item._id,
  //     agencyCode: item.agencyCode,
  //     agencyName: item.agencyName
  //   }));
  // } catch (error) {
  //   defaultLog.log(error);
  //   throw error;
  // }

  queryActions.sendResponse(res, 200, agencyList);
};
