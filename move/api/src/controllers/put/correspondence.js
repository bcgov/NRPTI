const mongoose = require('mongoose');
const ObjectID = require('mongodb').ObjectID;
const PutUtils = require('../../utils/put-utils');
const CorrespondencePost = require('../post/correspondence');

/**
 * Performs all operations necessary to edit a master Correspondence record and its associated flavour records.
 *
 * Example of incomingObj
 *
 *  Correspondences: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'Correspondence',
 *      ...
 *      CorrespondenceBCMI: {
 *        description: 'bcmi description'
 *        addRole: 'public',
 *        ...
 *      }
 *    }
 *  ]
 *
 * @param {*} args
 * @param {*} res
 * @param {*} next
 * @param {*} incomingObj see example
 * @returns object containing the operation's status and created records
 */
exports.editRecord = async function (args, res, next, incomingObj, overridePutParams = null) {
  const flavourFunctions = {
    CorrespondenceBCMI: this.editBCMI,
    CorrespondenceNRCED: this.editNRCED
  }
  return await PutUtils.editRecordWithFlavours(args, res, next, incomingObj, this.editMaster, CorrespondencePost, 'Correspondence', flavourFunctions, overridePutParams);
};


/**
 * Performs all operations necessary to edit a master Correspondence record.
 *
 * Example of incomingObj
 *
 *  Correspondences: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'Correspondence',
 *      ...
 *      CorrespondenceBCMI: {
 *        description: 'bcmi description'
 *        addRole: 'public',
 *        ...
 *      }
 *    }
 *  ]
 *
 * @param {*} args
 * @param {*} res
 * @param {*} next
 * @param {*} incomingObj see example
 * @returns edited master AnnualReport record
 */
exports.editMaster = function (args, res, next, incomingObj, flavourIds) {
  delete incomingObj._id;

  // Reject any changes to master permissions
  delete incomingObj.read;
  delete incomingObj.write;

  const Correspondence = mongoose.model('Correspondence');

  const sanitizedObj = PutUtils.validateObjectAgainstModel(Correspondence, incomingObj);

  if (!sanitizedObj || sanitizedObj === {}) {
    // skip, as there are no changes to master record
    return;
  }

  sanitizedObj.dateUpdated = new Date();
  sanitizedObj.updatedBy = args.swagger.params.auth_payload.displayName;

  const dotNotatedObj = PutUtils.getDotNotation(sanitizedObj);

  const updateObj = { $set: dotNotatedObj };

  if (flavourIds && flavourIds.length) {
    updateObj.$set = {...updateObj.$set };
    updateObj.$addToSet = { _flavourRecords: flavourIds.map(id => new ObjectID(id)) };
  }

  return updateObj;
};

/**
 * Performs all operations necessary to edit a bcmi Correspondence record.
 *
 * Example of incomingObj
 *
 *  Correspondence: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'Correspondence',
 *      ...
 *      CorrespondenceBCMI: {
 *        description: 'bcmi description'
 *        addRole: 'public',
 *        ...
 *      }
 *    }
 *  ]
 *
 * @param {*} args
 * @param {*} res
 * @param {*} next
 * @param {*} incomingObj see example
 * @returns edited bcmi Correspondence record
 */
exports.editBCMI = function (args, res, next, incomingObj) {
  delete incomingObj._id;

  // Reject any changes to permissions
  // Publishing must be done via addRole or removeRole
  delete incomingObj.read;
  delete incomingObj.write;

  let CorrespondenceBCMI = mongoose.model('CorrespondenceBCMI');

  const sanitizedObj = PutUtils.validateObjectAgainstModel(CorrespondenceBCMI, incomingObj);

  sanitizedObj.dateUpdated = new Date();

  const dotNotatedObj = PutUtils.getDotNotation(sanitizedObj);

  // If incoming object has addRole: 'public' then read will look like ['sysadmin', 'public']
  const updateObj = { $set: dotNotatedObj, $addToSet: {}, $pull: {} };

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

/**
 * Performs all operations necessary to edit a nrced Correspondence record.
 *
 * Example of incomingObj
 *
 *  Correspondence: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'Correspondence',
 *      ...
 *      CorrespondenceNRCED: {
 *        description: 'nrced description'
 *        addRole: 'public',
 *        ...
 *      }
 *    }
 *  ]
 *
 * @param {*} args
 * @param {*} res
 * @param {*} next
 * @param {*} incomingObj see example
 * @returns edited nrced Correspondence record
 */
 exports.editNRCED = function (args, res, next, incomingObj) {
  delete incomingObj._id;

  // Reject any changes to permissions
  // Publishing must be done via addRole or removeRole
  delete incomingObj.read;
  delete incomingObj.write;

  let CorrespondenceNRCED = mongoose.model('CorrespondenceNRCED');

  const sanitizedObj = PutUtils.validateObjectAgainstModel(CorrespondenceNRCED, incomingObj);

  sanitizedObj.dateUpdated = new Date();

  const dotNotatedObj = PutUtils.getDotNotation(sanitizedObj);

  // If incoming object has addRole: 'public' then read will look like ['sysadmin', 'public']
  const updateObj = { $set: dotNotatedObj, $addToSet: {}, $pull: {} };

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
