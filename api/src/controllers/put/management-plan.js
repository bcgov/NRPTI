const mongoose = require('mongoose');
const ObjectID = require('mongodb').ObjectID;
const PutUtils = require('../../utils/put-utils');
const ManagementPlanPost = require('../post/management-plan');

/**
 * Performs all operations necessary to edit a master Management Plan record and its associated flavour records.
 *
 * Example of incomingObj
 *
 *  managementPlans: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'managementPlan',
 *      ...
 *      ManagementPlanLNG: {
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
exports.editRecord = async function(args, res, next, incomingObj) {
  // save flavour records
  let observables = [];
  let savedFlavourManagementPlans = [];
  let flavourIds = [];

  try {
    // make a copy of the incoming object for use by the flavours only
    const flavourIncomingObj = { ...incomingObj };
    // Remove fields that should not be inherited from the master record
    delete flavourIncomingObj._id;
    delete flavourIncomingObj._schemaName;
    delete flavourIncomingObj._flavourRecords;
    delete flavourIncomingObj.read;
    delete flavourIncomingObj.write;

    if (incomingObj.ManagementPlanLNG) {
      if (incomingObj.ManagementPlanLNG._id) {
        observables.push(this.editLNG(args, res, next, { ...flavourIncomingObj, ...incomingObj.ManagementPlanLNG }));
      } else {
        observables.push(
          ManagementPlanPost.createLNG(args, res, next, {
            ...flavourIncomingObj,
            ...incomingObj.ManagementPlanLNG
          })
        );
      }

      delete incomingObj.ManagementPlanLNG;
    }

    if (observables.length > 0) {
      savedFlavourManagementPlans = await Promise.all(observables);

      flavourIds = savedFlavourManagementPlans.map(flavourManagementPlan => flavourManagementPlan._id);
    }
  } catch (e) {
    return {
      status: 'failure',
      object: savedFlavourManagementPlans,
      errorMessage: e
    };
  }

  // save managementPlan record
  let savedManagementPlan = null;

  try {
    savedManagementPlan = await this.editMaster(args, res, next, incomingObj, flavourIds);

    return {
      status: 'success',
      object: savedManagementPlan,
      flavours: savedFlavourManagementPlans
    };
  } catch (e) {
    return {
      status: 'failure',
      object: savedManagementPlan,
      errorMessage: e
    };
  }
};

/**
 * Performs all operations necessary to edit a master Management Plan record.
 *
 * Example of incomingObj
 *
 *  managementPlans: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'managementPlan',
 *      ...
 *      ManagementPlanLNG: {
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
 * @returns edited master managementPlan record
 */
exports.editMaster = async function(args, res, next, incomingObj, flavourIds) {
  if (!incomingObj || !incomingObj._id) {
    // skip, as there is no way to update the master record
    return;
  }

  const _id = incomingObj._id;
  delete incomingObj._id;

  // Reject any changes to master permissions
  delete incomingObj.read;
  delete incomingObj.write;

  const ManagementPlan = mongoose.model('ManagementPlan');

  const sanitizedObj = PutUtils.validateObjectAgainstModel(ManagementPlan, incomingObj);

  if (!sanitizedObj || sanitizedObj === {}) {
    // skip, as there are no changes to master record
    return;
  }

  sanitizedObj.dateUpdated = new Date();
  sanitizedObj.updatedBy = args.swagger.params.auth_payload.displayName;

  let updateObj = { $set: sanitizedObj };

  if (flavourIds && flavourIds.length) {
    updateObj.$addToSet = { _flavourRecords: flavourIds.map(id => new ObjectID(id)) };
  }

  return await ManagementPlan.findOneAndUpdate({ _schemaName: 'ManagementPlan', _id: _id }, updateObj, { new: true });
};

/**
 * Performs all operations necessary to edit a lng Management Plan record.
 *
 * Example of incomingObj
 *
 *  managementPlans: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'managementPlan',
 *      ...
 *      ManagementPlanLNG: {
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
 * @returns edited lng managementPlan record
 */
exports.editLNG = async function(args, res, next, incomingObj) {
  if (!incomingObj || !incomingObj._id) {
    // skip, as there is no way to update the lng record
    return;
  }

  const _id = incomingObj._id;
  delete incomingObj._id;

  // Reject any changes to permissions
  // Publishing must be done via addRole or removeRole
  delete incomingObj.read;
  delete incomingObj.write;

  let ManagementPlanLNG = mongoose.model('ManagementPlanLNG');

  const sanitizedObj = PutUtils.validateObjectAgainstModel(ManagementPlanLNG, incomingObj);

  // If incoming object has addRole: 'public' then read will look like ['sysadmin', 'public']
  let updateObj = { $set: sanitizedObj };

  if (incomingObj.addRole && incomingObj.addRole === 'public') {
    updateObj['$addToSet'] = { read: 'public' };
    updateObj.$set['datePublished'] = new Date();
    updateObj.$set['publishedBy'] = args.swagger.params.auth_payload.displayName;
  } else if (incomingObj.removeRole && incomingObj.removeRole === 'public') {
    updateObj['$pull'] = { read: 'public' };
    updateObj.$set['datePublished'] = null;
    updateObj.$set['publishedBy'] = '';
  }

  updateObj.$set['dateUpdated'] = new Date();

  return await ManagementPlanLNG.findOneAndUpdate({ _schemaName: 'ManagementPlanLNG', _id: _id }, updateObj, {
    new: true
  });
};
