const mongoose = require('mongoose');
const ObjectID = require('mongodb').ObjectID;
const PutUtils = require('../../utils/put-utils');
const PostUtils = require('../../utils/post-utils');
const BusinessLogicManager = require('../../utils/business-logic-manager');
const RestorativeJusticePost = require('../post/restorative-justice');

/**
 * Performs all operations necessary to edit a master Restorative Justice record and its associated flavour records.
 *
 * Example of incomingObj
 *
 *  restorativeJustices: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'restorativeJustice',
 *      ...
 *      RestorativeJusticeLNG: {
 *        description: 'lng description'
 *        addRole: 'public',
 *        ...
 *      },
 *      RestorativeJusticeNRCED: {
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
exports.editRecord = async function(args, res, next, incomingObj, overridePutParams = null) {
  const flavourFunctions = {
    RestorativeJusticeLNG: this.editLNG,
    RestorativeJusticeNRCED: this.editNRCED
  };
  return await PutUtils.editRecordWithFlavours(
    args,
    res,
    next,
    incomingObj,
    this.editMaster,
    RestorativeJusticePost,
    'RestorativeJustice',
    flavourFunctions,
    overridePutParams
  );
};

/**
 * Performs all operations necessary to edit a master Restorative Justice record.
 *
 * Example of incomingObj
 *
 *  restorativeJustices: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'restorativeJustice',
 *      ...
 *      RestorativeJusticeLNG: {
 *        description: 'lng description'
 *        addRole: 'public',
 *        ...
 *      },
 *      RestorativeJusticeNRCED: {
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
 * @returns edited master restorativeJustice record
 */
exports.editMaster = function(args, res, next, incomingObj, flavourIds) {
  delete incomingObj._id;

  // Reject any changes to master permissions
  delete incomingObj.read;
  delete incomingObj.write;

  const RestorativeJustice = mongoose.model('RestorativeJustice');

  const sanitizedObj = PutUtils.validateObjectAgainstModel(RestorativeJustice, incomingObj);

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
    updateObj.$set = { ...updateObj.$set };
    updateObj.$addToSet = { _flavourRecords: flavourIds.map(id => new ObjectID(id)) };
  }

  return updateObj;
};

/**
 * Performs all operations necessary to edit a lng Restorative Justice record.
 *
 * Example of incomingObj
 *
 *  restorativeJustices: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'restorativeJustice',
 *      ...
 *      RestorativeJusticeLNG: {
 *        description: 'lng description'
 *        addRole: 'public',
 *        ...
 *      },
 *      RestorativeJusticeNRCED: {
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
 * @returns edited lng restorativeJustice record
 */
exports.editLNG = function(args, res, next, incomingObj) {
  delete incomingObj._id;

  // Reject any changes to permissions
  // Publishing must be done via addRole or removeRole
  delete incomingObj.read;
  delete incomingObj.write;

  let RestorativeJusticeLNG = mongoose.model('RestorativeJusticeLNG');

  const sanitizedObj = PutUtils.validateObjectAgainstModel(RestorativeJusticeLNG, incomingObj);

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
 * Performs all operations necessary to edit a nrced Restorative Justice record.
 *
 * Example of incomingObj
 *
 *  restorativeJustices: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'restorativeJustice',
 *      ...
 *      RestorativeJusticeLNG: {
 *        description: 'lng description'
 *        addRole: 'public',
 *        ...
 *      },
 *      RestorativeJusticeNRCED: {
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
 * @returns edited nrced restorativeJustice record
 */
exports.editNRCED = function(args, res, next, incomingObj) {
  delete incomingObj._id;

  // Reject any changes to permissions
  // Publishing must be done via addRole or removeRole
  delete incomingObj.read;
  delete incomingObj.write;

  let RestorativeJusticeNRCED = mongoose.model('RestorativeJusticeNRCED');

  const sanitizedObj = PutUtils.validateObjectAgainstModel(RestorativeJusticeNRCED, incomingObj);

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
