const mongoose = require('mongoose');
const ObjectID = require('mongodb').ObjectID;
const PutUtils = require('../../utils/put-utils');
const ConstructionPlanPost = require('../post/construction-plan');
const { userInRole } = require('../../utils/auth-utils');
const { ROLES } = require('../../utils/constants/misc');

/**
 * Performs all operations necessary to edit a master Construction Plan record and its associated flavour records.
 *
 * Example of incomingObj
 *
 *  constructionPlans: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'constructionPlan',
 *      ...
 *      ConstructionPlanLNG: {
 *        description: 'lng description'
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
exports.editRecord = async function (args, res, next, incomingObj) {
  const flavourFunctions = {
    ConstructionPlanLNG: this.editLNG
  }
  return await PutUtils.editRecordWithFlavours(args, res, next, incomingObj, this.editMaster, ConstructionPlanPost, 'ConstructionPlan', flavourFunctions);
};


/**
 * Performs all operations necessary to edit a master Construction Plan record.
 *
 * Example of incomingObj
 *
 *  constructionPlans: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'constructionPlan',
 *      ...
 *      ConstructionPlanLNG: {
 *        description: 'lng description'
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
 * @returns edited master constructionPlan record
 */
exports.editMaster = function (args, res, next, incomingObj, flavourIds) {
  // Confirm user has correct role.
  if (!userInRole(ROLES.ADMIN_ROLES, args.swagger.params.auth_payload.realm_access.roles)) {
    throw new Error('Missing valid user role.');
  }  

  delete incomingObj._id;

  // Reject any changes to master permissions
  delete incomingObj.read;
  delete incomingObj.write;

  const ConstructionPlan = mongoose.model('ConstructionPlan');

  const sanitizedObj = PutUtils.validateObjectAgainstModel(ConstructionPlan, incomingObj);

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
 * Performs all operations necessary to edit a lng Construction Plan record.
 *
 * Example of incomingObj
 *
 *  constructionPlans: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'constructionPlan',
 *      ...
 *      ConstructionPlanLNG: {
 *        description: 'lng description'
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
 * @returns edited lng constructionPlan record
 */
exports.editLNG = function (args, res, next, incomingObj) {
  // Confirm user has correct role.
  if (!userInRole([ROLES.SYSADMIN, ROLES.LNGADMIN], args.swagger.params.auth_payload.realm_access.roles)) {
    throw new Error('Missing valid user role.');
  }  
  
  delete incomingObj._id;

  // Reject any changes to permissions
  // Publishing must be done via addRole or removeRole
  delete incomingObj.read;
  delete incomingObj.write;

  let ConstructionPlanLNG = mongoose.model('ConstructionPlanLNG');

  const sanitizedObj = PutUtils.validateObjectAgainstModel(ConstructionPlanLNG, incomingObj);

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
