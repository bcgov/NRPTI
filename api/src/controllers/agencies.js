const QueryActions = require('../utils/query-actions');
const mongodb = require('../utils/mongodb');
const RECORD_TYPE = require('../utils/constants/record-type-enum');

exports.publicGet = async function (args, res, next) {

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
    console.log('hello from publicGet')
  } catch (error) {
    console.log(error)
    throw error;
  }

  QueryActions.sendResponse(res, 200, agencyList);
};

// exports.protectedPost = async function (args, res, next) {
//   // Confirm user has correct role for this type of record.
//   // if (!userHasValidRoles([utils.ApplicationRoles.ADMIN, utils.ApplicationRoles.ADMIN_BCMI], args.swagger.params.auth_payload.client_roles)) {
//   //   throw new Error('Missing valid user role.');
//   // }

//   // let incomingObj = {};
//   // if (args.swagger.params.collection && args.swagger.params.collection.value) {
//   //   incomingObj = args.swagger.params.collection.value
//   // } else {
//   //   defaultLog.info(`protectedPost - you must provide an id to post`);
//   //   queryActions.sendResponse(res, 400, {});
//   //   next();
//   // }

//   // let obj = null;
//   // try {
//   //   // Need to determine the published state of the mine and make the new collection match.
//   //   const minePublished = await isMinePublished(incomingObj);
//   //   if (minePublished) {
//   //     incomingObj.addRole = 'public';
//   //   }

//   //   obj = await createCollection(incomingObj, args.swagger.params.auth_payload.displayName);
//   // } catch (error) {
//   //   defaultLog.info(`protectedPost - error inserting collection: ${incomingObj}`);
//   //   defaultLog.debug(error);
//   //   return queryActions.sendResponse(res, 400, {});
//   // }
//   let promises = [];
//   const collectionDB = db.collection('nrpti');
//     promises.push(collectionDB.findOneAndUpdate(
//       { agencyCode: args.agencyCode },
//       {
//         $set: {
//           agencyName: args.agencyName
//         },
//         $pull: { read: 'public' }
//       }
//     ));


//   try {
//     await Promise.all(promises);
//   } catch (error) {
//     defaultLog.info(`protectedPut - collection controller - error updating records with: ${collectionId}`);
//     defaultLog.debug(error);
//     throw error;
//   }

//   queryActions.sendResponse(res, 200, obj.ops[0]);
//   next();
// }