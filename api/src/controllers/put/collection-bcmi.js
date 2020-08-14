const mongoose = require('mongoose');
const ObjectID = require('mongodb').ObjectID;
const PutUtils = require('../../utils/put-utils');
const RECORD_TYPE = require('../../utils/constants/record-type-enum');
const { userHasValidRoles } = require('../../utils/auth-utils');
const utils = require('../../utils/constants/misc');

/**
 * Performs all operations necessary to edit a master Collection record.
 *
 * @param {*} args
 * @param {*} res
 * @param {*} next
 * @param {*} incomingObj
 * @returns object containing the operation's status and edited master Collection record
 */
exports.editRecord = async function(args, res, next, incomingObj) {
  // Confirm user has correct role for this type of record.
  if (!userHasValidRoles([utils.ApplicationRoles.SYSADMIN, utils.ApplicationRoles.ADMIN_BCMI], args.swagger.params.auth_payload.realm_access.roles)) {
    throw new Error('Missing valid user role.');
  }

  const CollectionBCMI = mongoose.model(RECORD_TYPE.CollectionBCMI._schemaName);

  // if any values in the "records" attribute exist on any other collection, throw an error
  if (incomingObj.records && incomingObj.records.length > 0) {
    for(const record of incomingObj.records) {
      // does this record exit in any other collection?
      const collections = await CollectionBCMI.find({ _schemaName: RECORD_TYPE.CollectionBCMI._schemaName,  records: { $elemMatch: { $eq: new ObjectID(record) }}}).exec();
      const otherCollections = collections.find(c => c._id.toString() !== incomingObj._id.toString());
      if (collections && otherCollections && otherCollections.length > 0) {
        throw new Error('Collection contains records that are already associated with another collection');
      }
    }
  }

  const masterRecord = this.editMaster(args, res, next, incomingObj);

  let result = null;

  try {
    result = await CollectionBCMI.findOneAndUpdate(
      {
        _id: incomingObj._id,
        _schemaName: RECORD_TYPE.CollectionBCMI._schemaName,
        write: { $in: args.swagger.params.auth_payload.realm_access.roles }
      },
      masterRecord,
      { new: true }
    );
  } catch (error) {
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
 * Performs all operations necessary to edit a master Collection record.
 *
 * @param {*} args
 * @param {*} res
 * @param {*} next
 * @param {*} incomingObj Collection record to edit
 * @returns master Collection record object
 */
exports.editMaster = function(args, res, next, incomingObj) {
  // Confirm user has correct role for this type of record.
  if (!userHasValidRoles([utils.ApplicationRoles.SYSADMIN, utils.ApplicationRoles.ADMIN_BCMI], args.swagger.params.auth_payload.realm_access.roles)) {
    throw new Error('Missing valid user role.');
  }

  // Reject any changes to permissions
  // Publishing must be done via addRole or removeRole
  delete incomingObj.read;
  delete incomingObj.write;

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

  const updateObj = { $set: dotNotatedObj, $addToSet: {}, $pull: {} };

  // Add or r emove 'public' role and update associated meta
  if (incomingObj.addRole && incomingObj.addRole === 'public') {
    updateObj.$addToSet['read'] = 'public';
    updateObj.$set['datePublished'] = new Date();
    updateObj.$set['publishedBy'] = args.swagger.params.auth_payload.displayName;
  } else if (incomingObj.removeRole && incomingObj.removeRole === 'public') {
    updateObj.$pull['read'] = 'public';
    updateObj.$set['datePublished'] = null;
    updateObj.$set['publishedBy'] = '';
  }

  return updateObj;
};
