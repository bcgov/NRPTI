const mongoose = require('mongoose');
const putUtils = require('../../utils/put-utils');
const ManagementPlanPost = require('../post/management-plan');
const RECORD_TYPE = require('../../utils/constants/record-type-enum');

/**
 * Edit Master Management Plan record.
 *
 * Example of incomingObj:
 *
 * managementPlans: [
 *   {
 *      _id: '85ce24e603984b02a0f8edb42a334876',
 *      recordName: 'test abc',
 *      recordType: 'whatever',
 *      ...
 *      ManagementPlanLNG: {
 *        description: 'lng description'
 *        addRole: 'public',
 *      }
 *   },
 *   ...
 * ]
 */
exports.editMaster = async function(args, res, next, incomingObj) {
  if (!incomingObj._id) {
    return {
      status: 'failure',
      object: incomingObj,
      errorMessage: 'No _id provided'
    };
  }

  const _id = incomingObj._id;
  delete incomingObj._id;

  // Reject any changes to master perm
  delete incomingObj.read;
  delete incomingObj.write;

  const ManagementPlan = mongoose.model(RECORD_TYPE.ManagementPlan._schemaName);

  let sanitizedObj;
  try {
    sanitizedObj = putUtils.validateObjectAgainstModel(ManagementPlan, incomingObj);
  } catch (error) {
    return {
      status: 'failure',
      object: incomingObj,
      errorMessage: error
    };
  }

  const finalRes = {
    status: 'success',
    object: sanitizedObj,
    flavours: null
  };
  let savedManagementPlan = null;
  // Skip if there is nothing to update for master
  if (sanitizedObj !== {}) {
    sanitizedObj['dateUpdated'] = new Date();
    sanitizedObj['updatedBy'] = args.swagger.params.auth_payload.displayName;
    try {
      savedManagementPlan = await ManagementPlan.findOneAndUpdate(
        { _schemaName: RECORD_TYPE.ManagementPlan._schemaName, _id: _id },
        { $set: sanitizedObj },
        { new: true }
      );
      finalRes.object = savedManagementPlan;
    } catch (error) {
      finalRes.status = 'failure';
      finalRes['errorMessage'] = error;
    }
  }

  // Flavours:
  // When editing, we might get a request to make a brand new flavour rather than edit.
  const observables = [];
  if (incomingObj.ManagementPlanLNG && incomingObj.ManagementPlanLNG._id) {
    observables.push(this.editLNG(args, res, next, incomingObj.ManagementPlanLNG));
    delete incomingObj.ManagementPlanLNG;
  } else if (incomingObj.ManagementPlanLNG) {
    observables.push(
      ManagementPlanPost.createLNG(args, res, next, incomingObj.ManagementPlanLNG, savedManagementPlan._id)
    );
    delete incomingObj.ManagementPlanLNG;
  }

  // Execute edit flavours
  try {
    observables.length > 0 && (finalRes.flavours = await Promise.all(observables));
  } catch (error) {
    finalRes.flavours = {
      status: 'failure',
      object: observables,
      errorMessage: error
    };
  }

  return finalRes;
};

/**
 * Edit LNG Management Plan Record
 *
 * Example of incomingObj:
 *
 * {
 *   _id: 'cd0b34a4ec1341288b5ea4164daffbf2'
 *   description: 'lng description',
 *   ...
 *   addRole: 'public'
 * }
 */
exports.editLNG = async function(args, res, next, incomingObj) {
  if (!incomingObj._id) {
    return {
      status: 'failure',
      object: incomingObj,
      errorMessage: 'No _id provided'
    };
  }

  const _id = incomingObj._id;
  delete incomingObj._id;

  // Reject any changes to permissions.
  // Publishing must be done via addRole or removeRole
  delete incomingObj.read;
  delete incomingObj.write;

  // You cannot update _master
  delete incomingObj._master;

  const ManagementPlanLNG = mongoose.model(RECORD_TYPE.ManagementPlan.flavours.lng._schemaName);

  let sanitizedObj;
  try {
    sanitizedObj = putUtils.validateObjectAgainstModel(ManagementPlanLNG, incomingObj);
  } catch (error) {
    return {
      status: 'failure',
      object: incomingObj,
      errorMessage: error
    };
  }

  // If incoming object has addRole: 'public' then read will look like ['sysadmin', 'public']
  let updateObj = { $set: sanitizedObj };
  if (incomingObj.addRole && incomingObj.addRole === 'public') {
    updateObj['$addToSet'] = { read: 'public' };
    updateObj.$set['datePublished'] = new Date();
  } else if (incomingObj.removeRole === 'public') {
    updateObj['$pull'] = { read: 'public' };
  }
  updateObj.$set['dateUpdated'] = new Date();

  try {
    const editRes = await ManagementPlanLNG.findOneAndUpdate(
      { _schemaName: RECORD_TYPE.ManagementPlan.flavours.lng._schemaName, _id: _id },
      updateObj,
      {
        new: true
      }
    );
    return {
      status: 'success',
      object: editRes
    };
  } catch (error) {
    return {
      status: 'failure',
      object: ManagementPlanLNG,
      errorMessage: error
    };
  }
};
