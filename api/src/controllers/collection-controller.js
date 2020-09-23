const Get = require('../controllers/get/get');
const Put = require('../controllers/put/put');
const Post = require('../controllers/post/post');
const Delete = require('../controllers/delete/delete');
const queryActions = require('../utils/query-actions');
const defaultLog = require('../utils/logger')('record');
const { userHasValidRoles } = require('../utils/auth-utils');
const utils = require('../utils/constants/misc');
const RECORD_TYPE = require('../utils/constants/record-type-enum');
const mongoose = require('mongoose');
const ObjectID = require('mongodb').ObjectID;
const mongodb = require('../utils/mongodb');
const PutUtils = require('../utils/put-utils');

exports.protectedOptions = function (args, res, next) {
  res.status(200).send();
};

exports.protectedGet = async function (args, res, next) {
  let collectionId = null;
  if (args.swagger.params.collectionId && args.swagger.params.collectionId.value) {
    collectionId = args.swagger.params.collectionId.value
  } else {
    defaultLog.info(`protectedGet - you must provide an id to get`);
    queryActions.sendResponse(res, 400, {});
    next();
  }

  try {
    await Get.getById(collectionId);
  } catch (error) {
    defaultLog.info(`protectedDelete - error getting collection: ${collectionId}`);
    defaultLog.debug(error);
    return queryActions.sendResponse(res, 400, {});
  }

  queryActions.sendResponse(res, 200, {});
  next();
}


exports.protectedPut = async function (args, res, next) {
  // Confirm user has correct role for this type of record.
  if (!userHasValidRoles([utils.ApplicationRoles.ADMIN, utils.ApplicationRoles.ADMIN_BCMI], args.swagger.params.auth_payload.realm_access.roles)) {
    throw new Error('Missing valid user role.');
  }

  const db = mongodb.connection.db(process.env.MONGODB_DATABASE || 'nrpti-dev');
  const collectionDB = db.collection('nrpti');

  let collectionId = null;
  if (args.swagger.params.collectionId && args.swagger.params.collectionId.value) {
    collectionId = args.swagger.params.collectionId.value;
  } else {
    defaultLog.info(`protectedPut - you must provide an id to update`);
    queryActions.sendResponse(res, 400, {});
    next();
  }
  let incomingObj = {};
  if (args.swagger.params.collection && args.swagger.params.collection.value) {
    incomingObj = args.swagger.params.collection.value;
  } else {
    defaultLog.info(`protectedPut - you must provide an object`);
    queryActions.sendResponse(res, 400, {});
    next();
  }

  // if any values in the "records" attribute exist on any other collection, throw an error
  if (incomingObj.records && incomingObj.records.length > 0) {
    // find any records that have this collection in their collectionId, but aren't actually a part of the collection
    // and remove their collectionid
    let recordIds = [];
    try {
      const records = await collectionDB.find({ collectionId: new ObjectID(collectionId) }).toArray();
      recordIds = records.map(({ _id }) => _id.toString())
    } catch (error) {
      defaultLog.info(`protectedPut - collection controller - error finding record with collection id: ${collectionId}`);
      defaultLog.debug(error);
      return queryActions.sendResponse(res, 400, error);
    }

    let promises = [];
    let recordsToAdd = [];
    let arrayOfObjIds = [];

    for (let i = 0; i < incomingObj.records.length; i++) {
      if (!recordIds.includes(incomingObj.records[i])) {
        // These are new records that need to be added to the collection.
        recordsToAdd.push(incomingObj.records[i]);
      }
      arrayOfObjIds.push(new ObjectID(incomingObj.records[i]))
    }

    // Add records
    if (recordsToAdd.length > 0) {
      await checkRecordExistsInCollection(recordsToAdd, collectionId);
    }

    // Remove records
    let recordsToRemove = recordIds.filter(x => incomingObj.records.indexOf(x) === -1);
    for (const record of recordsToRemove) {
      promises.push(collectionDB.findOneAndUpdate(
        { _id: new ObjectID(record) },
        {
          $set: {
            collectionId: null,
            isBcmiPublished: false
          },
          $pull: { read: 'public' }
        }
      ));
    }

    try {
      await Promise.all(promises);
    } catch (error) {
      defaultLog.info(`protectedPut - collection controller - error updating records with: ${collectionId}`);
      defaultLog.debug(error);
      return queryActions.sendResponse(res, 400, error);
    }

    incomingObj.records = arrayOfObjIds;
  }


  // Reject any changes to permissions
  // Publishing must be done via addRole or removeRole
  delete incomingObj.read;
  delete incomingObj.write;
  delete incomingObj._id;

  const CollectionBCMI = mongoose.model(RECORD_TYPE.CollectionBCMI._schemaName);

  const sanitizedObj = PutUtils.validateObjectAgainstModel(CollectionBCMI, incomingObj);
  if (!sanitizedObj || sanitizedObj === {}) {
    // skip, as there are no changes to master record
    return;
  }

  // Set auditing meta
  sanitizedObj.dateUpdated = new Date();
  sanitizedObj.updatedBy = args.swagger.params.auth_payload.displayName;

  const dotNotatedObj = PutUtils.getDotNotation(sanitizedObj);

  const updateObj = { $set: dotNotatedObj };

  let obj = null;
  try {
    obj = await Put.updateById(collectionId, updateObj);
  } catch (error) {
    defaultLog.info(`protectedPut - error updating collection: ${collectionId}`);
    defaultLog.debug(error);
    return queryActions.sendResponse(res, 400, {});
  }

  queryActions.sendResponse(res, 200, obj.value);
  next();
}

// This wrapper allows this controller to work with the record controller.
exports.createItem = async function (args, res, next, collection) {
  return await createCollection(collection, args.swagger.params.auth_payload.displayName);
}

exports.protectedPost = async function (args, res, next) {
  // Confirm user has correct role for this type of record.
  if (!userHasValidRoles([utils.ApplicationRoles.ADMIN, utils.ApplicationRoles.ADMIN_BCMI], args.swagger.params.auth_payload.realm_access.roles)) {
    throw new Error('Missing valid user role.');
  }

  let incomingObj = {};
  if (args.swagger.params.collection && args.swagger.params.collection.value) {
    incomingObj = args.swagger.params.collection.value
  } else {
    defaultLog.info(`protectedPost - you must provide an id to post`);
    queryActions.sendResponse(res, 400, {});
    next();
  }

  let obj = null;
  try {
    obj = await createCollection(incomingObj, args.swagger.params.auth_payload.displayName);
  } catch (error) {
    defaultLog.info(`protectedPost - error inserting collection: ${incomingObj}`);
    defaultLog.debug(error);
    return queryActions.sendResponse(res, 400, {});
  }

  queryActions.sendResponse(res, 200, obj.ops[0]);
  next();
}

exports.protectedDelete = async function (args, res, next) {
  let collectionId = null;
  if (args.swagger.params.collectionId && args.swagger.params.collectionId.value) {
    collectionId = args.swagger.params.collectionId.value
  } else {
    defaultLog.info(`protectedDelete - you must provide an id to delete`);
    queryActions.sendResponse(res, 400, {});
    next();
  }

  try {
    await Delete.deleteById(collectionId);
  } catch (error) {
    defaultLog.info(`protectedDelete - error deleting collection: ${collectionId}`);
    defaultLog.debug(error);
    return queryActions.sendResponse(res, 400, {});
  }

  queryActions.sendResponse(res, 200, {});
  next();
}

/**
 * Unpublishes all collections, their records and their documents for a mine.
 * 
 * @param {*} mineId - Mine to update
 * @param {*} auth_payload - User authorization
 */
exports.unpublishCollections = async function (mineId, auth_payload) {
  const db = mongodb.connection.db(process.env.MONGODB_DATABASE || 'nrpti-dev');
  const nrpti = db.collection('nrpti');

  const collections = await nrpti.find({ _schemaName: RECORD_TYPE.CollectionBCMI._schemaName, project: mineId, write: { $in: auth_payload.realm_access.roles } }).toArray();
  const promises = [];

  try {
    // Unpublish every collection, their records, and their documents.
    for (const collection of collections) {
      if (collection.records && collection.records.length) {
        const records = await nrpti.find({ _id: { $in: collection.records }, write: { $in: auth_payload.realm_access.roles } }).toArray();

        // Unpublish all documents of all records.
        for (const record of records) {
          if (record.documents && record.documents.length) {
            promises.push(nrpti.updateMany({ _id: { $in: record.documents }, write: { $in: auth_payload.realm_access.roles } }, { $pull: { read: 'public' } }));
          }

          // Unpublish the flavour record.
          promises.push(nrpti.update({ _id: record._id, write: { $in: auth_payload.realm_access.roles } }, { $pull: { read: 'public'} }));
          
          // Set the flag on the master record.
          promises.push(nrpti.update({ _flavourRecords: record._id, write: { $in: auth_payload.realm_access.roles } }, { $set: { isBcmiPublished: false } }));
        }
      }

      // Unpublish the collection.
      promises.push(nrpti.update({ _id: collection._id, write: { $in: auth_payload.realm_access.roles } }, { $pull: { read: 'public'} }));
    }

    await Promise.all(promises);
  } catch (error) {
    defaultLog.info(`unpublishCollections - error unpublishing mine collections: ${mineId}`);
    defaultLog.debug(error);
    throw new Error('Error unpublishing collections');
  }
}

/**
 * Publishes all collections, their records and their documents for a mine.
 * 
 * @param {*} mineId 
 * @param {*} auth_payload 
 */
exports.publishCollections = async function (mineId, auth_payload) {
  const db = mongodb.connection.db(process.env.MONGODB_DATABASE || 'nrpti-dev');
  const nrpti = db.collection('nrpti');

  const collections = await nrpti.find({ _schemaName: RECORD_TYPE.CollectionBCMI._schemaName, project: mineId, write: { $in: auth_payload.realm_access.roles } }).toArray();
  const promises = [];

  try {
    // Publish every collection, their records, and their documents.
    for (const collection of collections) {
      if (collection.records && collection.records.length) {
        const records = await nrpti.find({ _id: { $in: collection.records }, write: { $in: auth_payload.realm_access.roles } }).toArray();

        // Publish all documents of all records.
        for (const record of records) {
          if (record.documents && record.documents.length) {
            promises.push(nrpti.updateMany({ _id: { $in: record.documents }, write: { $in: auth_payload.realm_access.roles } }, { $addToSet: { read: 'public' } }));
          }

          // Publish the flavour record.
          promises.push(nrpti.update({ _id: record._id, write: { $in: auth_payload.realm_access.roles } }, { $addToSet: { read: 'public'} }));
          
          // Set the flag on the master record.
          promises.push(nrpti.update({ _flavourRecords: record._id, write: { $in: auth_payload.realm_access.roles } }, { $set: { isBcmiPublished: true } }));
        }
      }

      // Publish the collection.
      promises.push(nrpti.update({ _id: collection._id, write: { $in: auth_payload.realm_access.roles } }, { $addToSet: { read: 'public'} }));
    }

    await Promise.all(promises);
  } catch (error) {
    defaultLog.info(`publishCollections - error publishing mine collections: ${mineId}`);
    defaultLog.debug(error);
    throw new Error('Error publishing collections');
  }
}

const checkRecordExistsInCollection = async function (records, collectionId, editing = false) {
  const db = mongodb.connection.db(process.env.MONGODB_DATABASE || 'nrpti-dev');
  const collectionDB = db.collection('nrpti');
  let promises = [];
  for (const record of records) {
    // does this record exit in any other collection?
    // TODO: once we upgrade to mongo 4 we should replace this with a .countDocuments()
    // There seems to be an issue with .count() and mongodb 3.6
    const collectionCount = await collectionDB.find(
      {
        _schemaName: RECORD_TYPE.CollectionBCMI._schemaName,
        records: { $elemMatch: { $eq: new ObjectID(record) } }
      }
    ).toArray().length;

    if (collectionCount && collectionCount > 0) {
      if (!editing) {
        throw new Error('Collection contains records that are already associated with another collection');
      } else {
        continue;
      }
    } else {
      // Ensure the record has the collectionId set
      // Also, if we are associating a record, we auto-publish that record
      promises.push(collectionDB.findOneAndUpdate(
        { _id: new ObjectID(record) },
        {
          $set: {
            collectionId: new ObjectID(collectionId),
            isBcmiPublished: true
          },
          $addToSet: { read: 'public' }
        }
      ));
    }
  }
  try {
    return await Promise.all(promises);
  } catch (error) {
    throw new Error('Error updating records with collection.')
  }
}

const createCollection = async function (collectionObj, user) {

  let CollectionBCMI = mongoose.model(RECORD_TYPE.CollectionBCMI._schemaName);
  let collection = new CollectionBCMI();

  // Set schema
  collection._schemaName = RECORD_TYPE.CollectionBCMI._schemaName;

  // Set parent/mine ids
  collectionObj._master && (collection._master = collectionObj._master);
  collectionObj.project && (collection.project = collectionObj.project);

  // Set permissions
  collection.read = [utils.ApplicationRoles.ADMIN, utils.ApplicationRoles.ADMIN_BCMI];
  collection.write = [utils.ApplicationRoles.ADMIN, utils.ApplicationRoles.ADMIN_BCMI];

  // Set data
  collectionObj.name && (collection.name = collectionObj.name);
  collectionObj.date && (collection.date = collectionObj.date);
  collectionObj.type && (collection.type = collectionObj.type);
  collectionObj.agency && (collection.agency = collectionObj.agency);
  collectionObj.records && collectionObj.records.length && (collection.records = collectionObj.records);

  // if any values in the "records" attribute exist on any other collection, throw an error
  if (collection.records && collection.records.length > 0) {
    try {
      await checkRecordExistsInCollection(collection.records, collection._id);
    } catch (error) {
      defaultLog.info(`protectedPost - error inserting collection: ${collection}`);
      defaultLog.debug(error);
      throw error;
    }
  }

  // Add 'public' role and associated meta
  collection.read.push('public');
  collection.datePublished = new Date();
  collection.publishedBy = user;

  // Set auditing meta
  collection.addedBy = user || collectionObj.addedBy;
  collection.dateAdded = new Date();

  try {
    const newCollection = await Post.insert(collection);
    return newCollection;
  } catch (error) {
    defaultLog.info(`createCollection - error inserting collection: ${collection}`);
    defaultLog.debug(error);
    throw new Error('Error creating collection');
  }
}