const mongoose = require('mongoose');
const PutUtils = require('../../utils/put-utils');
const RECORD_TYPE = require('../../utils/constants/record-type-enum');
const mongodb = require('../../utils/mongodb');

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
  const masterRecord = this.editMaster(args, res, next, incomingObj);

  let result = null;

  try {
    const CollectionBCMI = mongoose.model(RECORD_TYPE.CollectionBCMI._schemaName);

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
    const db = mongodb.connection.db(process.env.MONGODB_DATABASE || 'nrpti-dev');
    const collection = db.collection('nrpti');

    await collection.deleteOne({ _id: incomingObj._id });

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
