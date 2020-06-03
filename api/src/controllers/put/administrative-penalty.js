const mongoose = require('mongoose');
const ObjectID = require('mongodb').ObjectID;
const PutUtils = require('../../utils/put-utils');
const PostUtils = require('../../utils/post-utils');
const BusinessLogicManager = require('../../utils/business-logic-manager');
const AdministrativePenaltyPost = require('../post/administrative-penalty');

/**
 * Performs all operations necessary to edit a master Administrative Penalty record and its associated flavour records.
 *
 * Example of incomingObj
 *
 *  administrativePenalties: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'administrativePenalty',
 *      ...
 *      AdministrativePenaltyLNG: {
 *        description: 'lng description'
 *        addRole: 'public',
 *        ...
 *      },
 *      AdministrativePenaltyNRCED: {
 *        summary: 'nrced summary',
 *        addRole: 'public'
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
exports.editRecord = async function (args, res, next, incomingObj) {
  const flavourFunctions = {
    AdministrativePenaltyLNG: this.editLNG,
    AdministrativePenaltyNRCED: this.editNRCED
  }
  return await PutUtils.editRecordWithFlavours(args, res, next, incomingObj, this.editMaster, AdministrativePenaltyPost, 'AdministrativePenalty', flavourFunctions);
};

/**
 * Performs all operations necessary to edit a master Administrative Penalty record.
 *
 * Example of incomingObj
 *
 *  administrativePenalties: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'administrativePenalty',
 *      ...
 *      AdministrativePenaltyLNG: {
 *        description: 'lng description'
 *        addRole: 'public',
 *        ...
 *      },
 *      AdministrativePenaltyNRCED: {
 *        summary: 'nrced summary',
 *        addRole: 'public'
 *        ...
 *      }
 *    }
 *  ]
 *
 * @param {*} args
 * @param {*} res
 * @param {*} next
 * @param {*} incomingObj see example
 * @returns edited master administrativePenalty record
 */
exports.editMaster = function (args, res, next, incomingObj, flavourIds) {
  delete incomingObj._id;
  
  // Reject any changes to master permissions
  delete incomingObj.read;
  delete incomingObj.write;

  const AdministrativePenalty = mongoose.model('AdministrativePenalty');

  const sanitizedObj = PutUtils.validateObjectAgainstModel(AdministrativePenalty, incomingObj);

  if (!sanitizedObj || sanitizedObj === {}) {
    // skip, as there are no changes to master record
    return;
  }

  sanitizedObj.issuedTo && (sanitizedObj.issuedTo.fullName = PostUtils.getIssuedToFullNameValue(incomingObj.issuedTo));

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
 * Performs all operations necessary to edit a lng Administrative Penalty record.
 *
 * Example of incomingObj
 *
 *  administrativePenalties: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'administrativePenalty',
 *      ...
 *      AdministrativePenaltyLNG: {
 *        description: 'lng description'
 *        addRole: 'public',
 *        ...
 *      },
 *      AdministrativePenaltyNRCED: {
 *        summary: 'nrced summary',
 *        addRole: 'public'
 *        ...
 *      }
 *    }
 *  ]
 *
 * @param {*} args
 * @param {*} res
 * @param {*} next
 * @param {*} incomingObj see example
 * @returns edited lng administrativePenalty record
 */
exports.editLNG = function (args, res, next, incomingObj) {
  delete incomingObj._id;

  // Reject any changes to permissions
  // Publishing must be done via addRole or removeRole
  delete incomingObj.read;
  delete incomingObj.write;

  let AdministrativePenaltyLNG = mongoose.model('AdministrativePenaltyLNG');

  const sanitizedObj = PutUtils.validateObjectAgainstModel(AdministrativePenaltyLNG, incomingObj);

  sanitizedObj.issuedTo && (sanitizedObj.issuedTo.fullName = PostUtils.getIssuedToFullNameValue(incomingObj.issuedTo));

  sanitizedObj.dateUpdated = new Date();

  const dotNotatedObj = PutUtils.getDotNotation(sanitizedObj);

  // If incoming object has addRole: 'public' then read will look like ['sysadmin', 'public']
  let updateObj = { $set: dotNotatedObj, $addToSet: {}, $pull: {} };

  if (incomingObj.addRole && incomingObj.addRole === 'public') {
    updateObj.$addToSet['read'] = 'public';
    updateObj.$set['datePublished'] = new Date();
    updateObj.$set['publishedBy'] = args.swagger.params.auth_payload.displayName;
  } else if (incomingObj.removeRole && incomingObj.removeRole === 'public') {
    updateObj.$pull['read'] = 'public';
    updateObj.$set['datePublished'] = null;
    updateObj.$set['publishedBy'] = '';
  }

  updateObj = BusinessLogicManager.applyBusinessLogicOnPut(updateObj, sanitizedObj);

  return updateObj;
};

/**
 * Performs all operations necessary to edit a nrced Administrative Penalty record.
 *
 * Example of incomingObj
 *
 *  administrativePenalties: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'administrativePenalty',
 *      ...
 *      AdministrativePenaltyLNG: {
 *        description: 'lng description'
 *        addRole: 'public',
 *        ...
 *      },
 *      AdministrativePenaltyNRCED: {
 *        summary: 'nrced summary',
 *        addRole: 'public'
 *        ...
 *      }
 *    }
 *  ]
 *
 * @param {*} args
 * @param {*} res
 * @param {*} next
 * @param {*} incomingObj see example
 * @returns edited nrced administrativePenalty record
 */
exports.editNRCED = function (args, res, next, incomingObj) {
  delete incomingObj._id;
  
  // Reject any changes to permissions
  // Publishing must be done via addRole or removeRole
  delete incomingObj.read;
  delete incomingObj.write;

  let AdministrativePenaltyNRCED = mongoose.model('AdministrativePenaltyNRCED');

  const sanitizedObj = PutUtils.validateObjectAgainstModel(AdministrativePenaltyNRCED, incomingObj);

  sanitizedObj.issuedTo && (sanitizedObj.issuedTo.fullName = PostUtils.getIssuedToFullNameValue(incomingObj.issuedTo));

  sanitizedObj.dateUpdated = new Date();

  const dotNotatedObj = PutUtils.getDotNotation(sanitizedObj);

  // If incoming object has addRole: 'public' then read will look like ['sysadmin', 'public']
  let updateObj = { $set: dotNotatedObj, $addToSet: {}, $pull: {} };

  if (incomingObj.addRole && incomingObj.addRole === 'public') {
    updateObj.$addToSet['read'] = 'public';
    updateObj.$set['datePublished'] = new Date();
    updateObj.$set['publishedBy'] = args.swagger.params.auth_payload.displayName;
  } else if (incomingObj.removeRole && incomingObj.removeRole === 'public') {
    updateObj.$pull['read'] = 'public';
    updateObj.$set['datePublished'] = null;
    updateObj.$set['publishedBy'] = '';
  }

  updateObj = BusinessLogicManager.applyBusinessLogicOnPut(updateObj, sanitizedObj);

  return updateObj;
};
