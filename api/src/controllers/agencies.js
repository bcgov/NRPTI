const QueryActions = require('../utils/query-actions');
const mongodb = require('../utils/mongodb');
const RECORD_TYPE = require('../utils/constants/record-type-enum');

exports.publicGetConfig = async function (args, res, next) {

const db = mongodb.connection.db(process.env.MONGODB_DATABASE || 'nrpti-dev');
const collectionDB = db.collection('nrpti');

  let agencyList;

  try {
    //Obtain documents with Application Agency Schema
     let agencyDocuments = await collectionDB.find({_schemaName: RECORD_TYPE.ApplicationAgency._schemaName}).toArray();
    //Using map function to iterate through the original array and creates a new array with objects containing only the _id, agencyCode, and agencyName properties. 
     agencyList = agencyDocuments.map(item => ({
      _id: item._id,
      agencyCode: item.agencyCode,
      agencyName: item.agencyName
    }));
  } catch (error) {
    console.log(error)
    throw error;
  }

  QueryActions.sendResponse(res, 200, agencyList);
};
