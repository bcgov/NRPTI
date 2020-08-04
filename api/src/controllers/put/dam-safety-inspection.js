const mongoose = require('mongoose');
const ObjectID = require('mongodb').ObjectID;
const PutUtils = require('../../utils/put-utils');
const DamSafetyInspectionPost = require('../post/dam-safety-inspection');

/**
 * Performs all operations necessary to edit a master DamSafetyInspection record and its associated flavour records.
 *
 * Example of incomingObj
 *
 *  DamSafetyInspections: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'DamSafetyInspection',
 *      ...
 *      DamSafetyInspectionBCMI: {
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
    DamSafetyInspectionBCMI: this.editBCMI,
    DamSafetyInspectionNRCED: this.editNRCED
  }
  return await PutUtils.editRecordWithFlavours(args, res, next, incomingObj, this.editMaster, DamSafetyInspectionPost, 'DamSafetyInspection', flavourFunctions, overridePutParams);
};


/**
 * Performs all operations necessary to edit a master DamSafetyInspection record.
 *
 * Example of incomingObj
 *
 *  DamSafetyInspections: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'DamSafetyInspection',
 *      ...
 *      DamSafetyInspectionBCMI: {
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
 * @returns edited master DamSafetyInspection record
 */
exports.editMaster = function (args, res, next, incomingObj, flavourIds) {
  delete incomingObj._id;

  // Reject any changes to master permissions
  delete incomingObj.read;
  delete incomingObj.write;

  const DamSafetyInspection = mongoose.model('DamSafetyInspection');

  const sanitizedObj = PutUtils.validateObjectAgainstModel(DamSafetyInspection, incomingObj);

  if (!sanitizedObj || sanitizedObj === {}) {
    // skip, as there are no changes to master record
    return;
  }

  sanitizedObj.dateUpdated = new Date();
  sanitizedObj.updatedBy = args.swagger.params.auth_payload.displayName;

  const dotNotatedObj = PutUtils.getDotNotation(sanitizedObj);

  const updateObj = { $set: dotNotatedObj };

  if (flavourIds && flavourIds.length) {
    updateObj.$addToSet = { _flavourRecords: flavourIds.map(id => new ObjectID(id)) };
  }

  return updateObj;
};

/**
 * Performs all operations necessary to edit a bcmi DamSafetyInspection record.
 *
 * Example of incomingObj
 *
 *  DamSafetyInspections: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'DamSafetyInspection',
 *      ...
 *      DamSafetyInspectionBCMI: {
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
 * @returns edited bcmi DamSafetyInspection record
 */
exports.editBCMI = function (args, res, next, incomingObj) {
  delete incomingObj._id;

  // Reject any changes to permissions
  // Publishing must be done via addRole or removeRole
  delete incomingObj.read;
  delete incomingObj.write;

  let DamSafetyInspectionBCMI = mongoose.model('DamSafetyInspectionBCMI');

  const sanitizedObj = PutUtils.validateObjectAgainstModel(DamSafetyInspectionBCMI, incomingObj);

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
 * Performs all operations necessary to edit a nrced DamSafetyInspection record.
 *
 * Example of incomingObj
 *
 *  DamSafetyInspections: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'DamSafetyInspection',
 *      ...
 *      DamSafetyInspectionNRCED: {
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
 * @returns edited nrced DamSafetyInspection record
 */
 exports.editNRCED = function (args, res, next, incomingObj) {
  delete incomingObj._id;

  // Reject any changes to permissions
  // Publishing must be done via addRole or removeRole
  delete incomingObj.read;
  delete incomingObj.write;

  let DamSafetyInspectionNRCED = mongoose.model('DamSafetyInspectionNRCED');

  const sanitizedObj = PutUtils.validateObjectAgainstModel(DamSafetyInspectionNRCED, incomingObj);

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
