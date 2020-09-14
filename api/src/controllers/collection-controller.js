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
      promises.push(collectionDB.updateOne({ _id: new ObjectID(record) }, { $set: { collectionId: null } }));
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

  // Add or remove 'public' role and update associated meta
  if (incomingObj.addRole && incomingObj.addRole === 'public') {
    updateObj['$addToSet'] = { read: 'public' };
    updateObj.$set['datePublished'] = new Date();
    updateObj.$set['publishedBy'] = args.swagger.params.auth_payload.displayName;
    updateObj.$set['isBcmiPublished'] = true;
  } else if (incomingObj.removeRole && incomingObj.removeRole === 'public') {
    updateObj['$pull'] = { read: 'public' };
    updateObj.$set['datePublished'] = null;
    updateObj.$set['publishedBy'] = '';
    updateObj.$set['isBcmiPublished'] = false;
  }

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

  let CollectionBCMI = mongoose.model(RECORD_TYPE.CollectionBCMI._schemaName);
  let collection = new CollectionBCMI();

  // Set schema
  collection._schemaName = RECORD_TYPE.CollectionBCMI._schemaName;

  // Set parent/mine ids
  incomingObj._master && (collection._master = incomingObj._master);
  incomingObj.project && (collection.project = incomingObj.project);

  // Set permissions
  collection.read = [utils.ApplicationRoles.ADMIN, utils.ApplicationRoles.ADMIN_BCMI];
  collection.write = [utils.ApplicationRoles.ADMIN, utils.ApplicationRoles.ADMIN_BCMI];

  // Set data
  incomingObj.name && (collection.name = incomingObj.name);
  incomingObj.date && (collection.date = incomingObj.date);
  incomingObj.type && (collection.type = incomingObj.type);
  incomingObj.agency && (collection.agency = incomingObj.agency);
  incomingObj.records && incomingObj.records.length && (collection.records = incomingObj.records);

  // if any values in the "records" attribute exist on any other collection, throw an error
  if (collection.records && collection.records.length > 0) {
    try {
      await checkRecordExistsInCollection(collection.records, collection._id);
    } catch (error) {
      defaultLog.info(`protectedPost - error inserting collection: ${collection}`);
      defaultLog.debug(error);
      return queryActions.sendResponse(res, 400, error);
    }
  }

  // Add 'public' role and associated meta
  if (incomingObj.addRole && incomingObj.addRole === 'public') {
    collection.read.push('public');
    collection.datePublished = new Date();
    collection.publishedBy = args.swagger.params.auth_payload.displayName;
    collection.isBcmiPublished = true;
  } else {
    collection.isBcmiPublished = false;
  }

  // Set auditing meta
  collection.addedBy = (args && args.swagger.params.auth_payload.displayName) || incomingObj.addedBy;
  collection.dateAdded = new Date();

  let obj = null;
  try {
    obj = await Post.insert(collection);
  } catch (error) {
    defaultLog.info(`protectedPost - error inserting collection: ${collection}`);
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

const checkRecordExistsInCollection = async function (records, collectionId, editing = false) {
  const db = mongodb.connection.db(process.env.MONGODB_DATABASE || 'nrpti-dev');
  const collectionDB = db.collection('nrpti');
  let promises = [];
  for (const record of records) {
    // does this record exit in any other collection?
    const collectionCount = await collectionDB.count({ _schemaName: RECORD_TYPE.CollectionBCMI._schemaName, records: { $elemMatch: { $eq: new ObjectID(record) } } });
    if (collectionCount && collectionCount > 0) {
      if (!editing) {
        throw new Error('Collection contains records that are already associated with another collection');
      } else {
        continue;
      }
    } else {
      // ensure the record has the collectionId set
      promises.push(collectionDB.updateOne({ _id: new ObjectID(record) }, { $set: { collectionId: new ObjectID(collectionId) } }));
    }
  }
  try {
    return await Promise.all(promises);
  } catch (error) {
    throw new Error('Error updating records with collection.')
  }
}