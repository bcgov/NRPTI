const mongoose = require('mongoose');
const ObjectID = require('mongodb').ObjectID;
const RECORD_TYPE = require('../../utils/constants/record-type-enum');
const mongodb = require('../../utils/mongodb');
const { userHasValidRoles } = require('../../utils/auth-utils');
const utils = require('../../utils/constants/misc');

/**
 * Performs all operations necessary to create a new master Collection record.
 *
 * @param {*} args
 * @param {*} res
 * @param {*} next
 * @param {*} incomingObj Collection record to create
 * @returns object containing the operation's status and created master Collection record
 */
exports.createRecord = async function(args, res, next, incomingObj) {
  // Confirm user has correct role for this type of record.
  if (!userHasValidRoles([utils.ApplicationRoles.ADMIN, utils.ApplicationRoles.ADMIN_BCMI], args.swagger.params.auth_payload.realm_access.roles)) {
    throw new Error('Missing valid user role.');
  }

  const masterRecord = await this.createMaster(args, res, next, incomingObj);

  let result = null;

  try {
    result = await masterRecord.save();
  } catch (error) {
    const db = mongodb.connection.db(process.env.MONGODB_DATABASE || 'nrpti-dev');
    const collection = db.collection('nrpti');

    await collection.deleteOne({ _id: masterRecord._id });

    return {
      status: 'failure',
      object: result,
      errorMessage: error.message
    };
  }

  return {
    status: 'success',
    object: result
  };
};

/**
 * Performs all operations necessary to create a master Collection record.
 *
 * @param {*} args
 * @param {*} res
 * @param {*} next
 * @param {*} incomingObj Collection record to create
 * @returns master Collection record object
 */
exports.createMaster = async function(args, res, next, incomingObj) {
  // Confirm user has correct role for this type of record.
  if (!userHasValidRoles([utils.ApplicationRoles.ADMIN, utils.ApplicationRoles.ADMIN_BCMI], args.swagger.params.auth_payload.realm_access.roles)) {
    throw new Error('Missing valid user role.');
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
    const model = require('mongoose').model(RECORD_TYPE.CollectionBCMI._schemaName);
    for(const record of collection.records) {
      // does this record exit in any other collection?
      const collectionCount = await model.count({ _schemaName: RECORD_TYPE.CollectionBCMI._schemaName,  records: { $elemMatch: { $eq: new ObjectID(record) } } });
      if (collectionCount && collectionCount > 0) {
        throw new Error('Collection contains records that are already associated with another collection');
      } else {
        // ensure the record has the collectionId set
        await mongoose.connection.db.collection('nrpti').updateOne({ _id: new ObjectID(record) }, { $set: { collectionId: new ObjectID(collection._id) }});
      }
    }
  }

  // Add 'public' role and associated meta
  if (incomingObj.addRole && incomingObj.addRole === 'public') {
    collection.read.push('public');
    collection.datePublished = new Date();
    collection.publishedBy = args.swagger.params.auth_payload.displayName;
  }

  // Set auditing meta
  collection.addedBy = (args && args.swagger.params.auth_payload.displayName) || incomingObj.addedBy;
  collection.dateAdded = new Date();

  return collection;
};
