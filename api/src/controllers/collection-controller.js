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
const ObjectId = require('mongodb').ObjectId;
const mongodb = require('../utils/mongodb');
const PutUtils = require('../utils/put-utils');
const { publishS3Document, unpublishS3Document } = require('../controllers/document-controller');

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
  if (!userHasValidRoles([utils.ApplicationRoles.ADMIN, utils.ApplicationRoles.ADMIN_BCMI], args.swagger.params.auth_payload.client_roles)) {
    throw new Error('Missing valid user role.');
  }

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

  let obj = null;
  try {
    obj = await updateCollection(incomingObj, collectionId, args.swagger.params.auth_payload.displayName);
  } catch (error) {
    defaultLog.info(`protectedPut - error updating collection: ${collectionId}`);
    defaultLog.debug(error);
    return queryActions.sendResponse(res, 400, {});
  }

  queryActions.sendResponse(res, 200, obj.value);
  next();
}

const updateCollection = async function(incomingObj, collectionId, displayName) {
  const db = mongodb.connection.db(process.env.MONGODB_DATABASE || 'nrpti-dev');
  const collectionDB = db.collection('nrpti');

  // if any values in the "records" attribute exist on any other collection, throw an error
  //
  // Removed incomingObj.records.length check as of NRPT-501.  Checking for incomingObj.records.length > 0
  // will cause this if block to be skipped when removing all records from a collection
  if (incomingObj.records) {
    // find any records that have this collection in their collectionId, but aren't actually a part of the collection
    // and remove their collectionid
    let recordIds = [];
    try {
      const records = await collectionDB.find({ collectionId: new ObjectId(collectionId) }).toArray();
      recordIds = records.map(({ _id }) => _id.toString())
    } catch (error) {
      defaultLog.info(`protectedPut - collection controller - error finding record with collection id: ${collectionId}`);
      defaultLog.debug(error);
      throw error;
    }

    let promises = [];
    let recordsToAdd = [];
    let arrayOfObjIds = [];

    for (let i = 0; i < incomingObj.records.length; i++) {
      if (!recordIds.includes(incomingObj.records[i])) {
        // These are new records that need to be added to the collection.
        recordsToAdd.push(incomingObj.records[i]);
      }
      arrayOfObjIds.push(new ObjectId(incomingObj.records[i]))
    }

    // Add records
    if (recordsToAdd.length > 0) {
      // Need to know the status of the collection in order to make sure the records match.
      const collection = await collectionDB.findOne({ _id: new ObjectId(collectionId) });
      if (!collection || !collection.read) {
        defaultLog.info(`protectedPut - error locating collection`);
        throw new Error(`protectedPut - error locating collection`)
      }

      await checkRecordExistsInCollection(recordsToAdd, collectionId, collection.read, true);
    }

    // Remove records
    let recordsToRemove = recordIds.filter(x => incomingObj.records.indexOf(x) === -1);
    for (const record of recordsToRemove) {
      promises.push(collectionDB.findOneAndUpdate(
        { _id: new ObjectId(record) },
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
      throw error;
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

  // make sure date type is not a string
  // TODO: move this logic to transition layer
  if (sanitizedObj.date && typeof sanitizedObj.date !== Date) {
    sanitizedObj.date = new Date(sanitizedObj.date)
  }

  // Set auditing meta
  sanitizedObj.dateUpdated = new Date();
  sanitizedObj.updatedBy = displayName;

  const dotNotatedObj = PutUtils.getDotNotation(sanitizedObj);

  const updateObj = { $set: dotNotatedObj };

  try {
    return await Put.updateById(collectionId, updateObj);
  } catch (error) {
    defaultLog.info(`updateCollection - error updating collection: ${updateObj}`);
    defaultLog.debug(error);
    throw new Error('Error updating collection');
  }
}

exports.updateCollection = updateCollection;

// This wrapper allows this controller to work with the record controller.
exports.createItem = async function (args, res, next, collection) {
  return await createCollection(collection, args.swagger.params.auth_payload.displayName);
}

exports.protectedPost = async function (args, res, next) {
  // Confirm user has correct role for this type of record.
  if (!userHasValidRoles([utils.ApplicationRoles.ADMIN, utils.ApplicationRoles.ADMIN_BCMI], args.swagger.params.auth_payload.client_roles)) {
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
    // Need to determine the published state of the mine and make the new collection match.
    const minePublished = await isMinePublished(incomingObj);
    if (minePublished) {
      incomingObj.addRole = 'public';
    }

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
  mineId = new ObjectId(mineId);
  const db = mongodb.connection.db(process.env.MONGODB_DATABASE || 'nrpti-dev');
  const nrpti = db.collection('nrpti');

  const collections = await nrpti.find({ _schemaName: RECORD_TYPE.CollectionBCMI._schemaName, project: mineId, write: { $in: auth_payload.client_roles } }).toArray();

  try {
    for (const collection of collections) {
      if (collection.records && collection.records.length) {
        defaultLog.debug('collection : ', JSON.stringify(collection._id));
        const recordAggregate = [
          {
            $match: {
              _id: {
                $in: collection.records
              },
              write: {
                $in: auth_payload.client_roles
              }
            }
          },
          {
            $lookup: {
              from: 'nrpti',
              localField: "documents",
              foreignField: "_id",
              as: "documents",
            }
          }
        ];

        const records = await nrpti.aggregate(recordAggregate).toArray();

        let error = null;
        // runs each function, last arg is callback, others are results from previous step
        // any error in a step should cause the rest of the steps to be skipped and log that error
        for (const record of records) {
          defaultLog.debug('publishing record docs, recordId: ', JSON.stringify(record._id) );
          if (record.documents && record.documents.length) {

            for (const document of record.documents) {
              if (document.key) {
                try {
                  await unpublishS3Document(document.key);
                } catch (err) {
                  error = `failed to unpublish record document in S3, recordId: ${record.recordName}`
                  // log s3 sdk error
                  defaultLog.error(err.message)
                  throw new Error(error)
                }
              }
            }

            defaultLog.debug('unpulishing record doc objs, recordId: ', JSON.stringify(record._id))
            try {
              await nrpti.updateMany({ _id: { $in: record.documents.map(doc => doc._id) }, write: { $in: auth_payload.client_roles } }, { $pull: { read: 'public' } })
            } catch (err) {
              error = `Could not unpublish record document obj: ${record.recordName},  err: ${err}`;
              defaultLog.error(error)
              throw new Error(error)
            }
          }

          defaultLog.debug('unpublishing record master, recordId: ', JSON.stringify(record._id))
          try {
            await nrpti.updateOne({ _id: record._id, write: { $in: auth_payload.client_roles } }, { $pull: { read: 'public' } })
          } catch (err) {
            error = `Could not unpublish master record: ${record.recordName},  err: ${err}`;
            defaultLog.error(error)
            throw new Error(error)
          }

          defaultLog.debug('unpublishing record flavour, recordId: ', JSON.stringify(record._id))
          try {
            await nrpti.updateOne({ _flavourRecords: record._id, write: { $in: auth_payload.client_roles } }, { $set: { isBcmiPublished: false } })
          } catch (err) {
            error = `Could not unpublish flavour record: ${record.recordName},  err: ${err}`;
            defaultLog.error(error)
            throw new Error(error)
          }
        }

        // unpublish collection
        try {
          await nrpti.updateOne({ _id: collection._id, write: { $in: auth_payload.client_roles } }, { $pull: { read: 'public' } });
        } catch (err) {
          error = `Could not unpublish collection:  ${collection.name}, ${err}`
          defaultLog.info(error);
          throw new Error(error)
        }
      }
    }
  } catch (error) {
    defaultLog.info(`unpublishCollections - error unpublishing mine collections: ${mineId}`);
    defaultLog.debug(error);
    const msg = `Error unpublishing mine collections: ${error.message}`
    throw new Error(msg);
  }
}

/**
 * Publishes all collections, their records and their documents for a mine.
 *
 * @param {*} mineId
 * @param {*} auth_payload
 */
exports.publishCollections = async function (mineId, auth_payload) {
  mineId = new ObjectId(mineId);
  const db = mongodb.connection.db(process.env.MONGODB_DATABASE || 'nrpti-dev');
  const nrpti = db.collection('nrpti');

  const collections = await nrpti.find({ _schemaName: RECORD_TYPE.CollectionBCMI._schemaName, project: mineId, write: { $in: auth_payload.client_roles } }).toArray();

  // Publish every collection, their records, and their documents.
  try {
    for (const collection of collections) {
      if (collection.records && collection.records.length) {
        defaultLog.debug('collection : ', JSON.stringify(collection._id));
        const recordAggregate = [
          {
            $match: {
              _id: {
                $in: collection.records
              },
              write: {
                $in: auth_payload.client_roles
              }
            }
          },
          {
            $lookup: {
              from: 'nrpti',
              localField: "documents",
              foreignField: "_id",
              as: "documents",
            }
          }
        ];

        const records = await nrpti.aggregate(recordAggregate).toArray();

        let error = null;
        // Publish all documents of all records.
        for (const record of records) {
        // Update the S3 object properties for each document.
          if (record.documents && record.documents.length) {
            defaultLog.debug('publishing record s3 docs, recordId: ', JSON.stringify(record._id))
            for (const document of record.documents) {
              if (document.key) {
                try {
                  await publishS3Document(document.key);
                } catch (err) {
                  error = `failed to unpublish record document in S3, recordId: ${record.recordName}`
                  defaultLog.error(err.message)
                  throw new Error(error)
                }
              }
            }

            // Publish all record documents
            defaultLog.debug('pulishing record doc objs, recordId: ', JSON.stringify(record._id))
            try {
              await nrpti.updateMany({ _id: { $in: record.documents.map(doc => doc._id) }, write: { $in: auth_payload.client_roles } }, { $addToSet: { read: 'public' } })
            } catch (err) {
              error = `Could not publish record document obj: ${record.recordName},  err: ${err}`;
              defaultLog.error(error)
            }
          }

          // Set the flag on the master record.
          defaultLog.debug('publishing record master, recordId: ', JSON.stringify(record._id))
          try {
            await nrpti.updateOne({ _flavourRecords: record._id, write: { $in: auth_payload.client_roles } }, { $set: { isBcmiPublished: true } })
          } catch (err) {
            error = `Could not publish master record: ${record.recordName},  err: ${err}`;
            defaultLog.error(error)
          }

        // Publish the flavour record
          defaultLog.debug('publishing record flavour, recordId: ', JSON.stringify(record._id))
          try {
            await nrpti.updateOne({ _id: record._id, write: { $in: auth_payload.client_roles } }, { $addToSet: { read: 'public' } })
          } catch (err) {
            error = `Could not publish flavour record: ${record.recordName},  err: ${err}`;
            defaultLog.error(error)
          }
        }

        // Publish the collection
        try {
          await nrpti.updateOne({ _id: collection._id, write: { $in: auth_payload.client_roles } }, { $addToSet: { read: 'public' } });
        } catch (err) {
          const msg = `Could not publish mine collections: ${JSON.stringify(err.message)}`
          defaultLog.info(msg);
        }
      }
    }
  } catch (error) {
    defaultLog.info(`publishCollections - error unpublishing mine collections: ${mineId}`);
    defaultLog.debug(error.message);
    const msg = `Error unpublishing mine collections: ${error.message}`
    throw new Error(msg);
  }
}

const checkRecordExistsInCollection = async function (records, collectionId, collectionRead, editing = false) {
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
        records: { $elemMatch: { $eq: new ObjectId(record) } }
      }
    ).toArray().length;

    if (collectionCount && collectionCount > 0 && !editing) {
      throw new Error('Collection contains records that are already associated with another collection');
    }

    let permissionAction = {
      $pull: {
        read: 'public'
      }
    };

    if (collectionRead.includes('public')) {
      permissionAction = {
        $addToSet: {
          read: 'public'
        }
      };
    }
    // Ensure the record has the collectionId set
    // Also, if we are associating a record
    promises.push(collectionDB.findOneAndUpdate(
      { _id: new ObjectId(record) },
      {
        $set: {
          collectionId: new ObjectId(collectionId),
        },
        ...permissionAction
      }
    ));
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
  collectionObj.project && (collection.project = collectionObj.project);
  collectionObj._sourceRefCoreCollectionId &&
    (collection._sourceRefCoreCollectionId = collectionObj._sourceRefCoreCollectionId);

  // Set permissions
  collection.read = [utils.ApplicationRoles.ADMIN, utils.ApplicationRoles.ADMIN_BCMI];
  collection.write = [utils.ApplicationRoles.ADMIN, utils.ApplicationRoles.ADMIN_BCMI];

  // Set data
  collectionObj.name && (collection.name = collectionObj.name);
  collectionObj.date && (collection.date = collectionObj.date);
  collectionObj.type && (collection.type = collectionObj.type);
  collectionObj.agency && (collection.agency = collectionObj.agency);
  collectionObj.records && collectionObj.records.length && (collection.records = collectionObj.records);

  // If incoming object has addRole: 'public' then read will look like ['sysadmin', 'public']
  if (collectionObj.addRole && collectionObj.addRole === 'public') {
    collection.read.push('public');
    collection.datePublished = new Date();
    collection.publishedBy = user;
  }

  // if any values in the "records" attribute exist on any other collection, throw an error
  if (collection.records && collection.records.length > 0) {
    try {
      // Use the collection status to determine published status of the record.
      await checkRecordExistsInCollection(collection.records, collection._id, collection.read);
    } catch (error) {

      defaultLog.info(`createCollection - error inserting collection: ${collection}`);
      defaultLog.debug(error);
      throw error;
    }
  }

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

exports.createCollection = createCollection;

const isMinePublished = async function (incomingObj) {
  const db = mongodb.connection.db(process.env.MONGODB_DATABASE || 'nrpti-dev');
  const nrpti = db.collection('nrpti');

  const mine = await nrpti.findOne({ _id: new ObjectId(incomingObj.project) });

  return mine.read.includes('public');
};
