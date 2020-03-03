const mongoose = require('mongoose');
const putUtils = require('../../utils/put-utils');
const SelfReportPost = require('../post/self-report');
const RECORD_TYPE = require('../../utils/constants/record-type-enum');

/**
 * Edit Master SelfReport record.
 *
 * Example of incomingObj:
 *
 * selfReports: [
 *   {
 *      _id: '85ce24e603984b02a0f8edb42a334876',
 *      recordName: 'test abc',
 *      recordType: 'whatever',
 *      ...
 *      SelfReportLNG: {
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

  const SelfReport = mongoose.model(RECORD_TYPE.SelfReport._schemaName);

  let sanitizedObj;
  try {
    sanitizedObj = putUtils.validateObjectAgainstModel(SelfReport, incomingObj);
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
  let savedSelfReport = null;
  // Skip if there is nothing to update for master
  if (sanitizedObj !== {}) {
    sanitizedObj['dateUpdated'] = new Date();
    sanitizedObj['updatedBy'] = args.swagger.params.auth_payload.displayName;
    try {
      savedSelfReport = await SelfReport.findOneAndUpdate(
        { _schemaName: RECORD_TYPE.SelfReport._schemaName, _id: _id },
        { $set: sanitizedObj },
        { new: true }
      );
      finalRes.object = savedSelfReport;
    } catch (error) {
      finalRes.status = 'failure';
      finalRes['errorMessage'] = error;
    }
  }

  // Flavours:
  // When editing, we might get a request to make a brand new flavour rather than edit.
  const observables = [];
  if (incomingObj.SelfReportLNG && incomingObj.SelfReportLNG._id) {
    observables.push(this.editLNG(args, res, next, incomingObj.SelfReportLNG));
    delete incomingObj.SelfReportLNG;
  } else if (incomingObj.SelfReportLNG) {
    observables.push(SelfReportPost.createLNG(args, res, next, incomingObj.SelfReportLNG, savedSelfReport._id));
    delete incomingObj.SelfReportLNG;
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
 * Edit LNG SelfReport Record
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

  const SelfReportLNG = mongoose.model(RECORD_TYPE.SelfReport.flavours.lng._schemaName);

  let sanitizedObj;
  try {
    sanitizedObj = putUtils.validateObjectAgainstModel(SelfReportLNG, incomingObj);
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
    const editRes = await SelfReportLNG.findOneAndUpdate(
      { _schemaName: RECORD_TYPE.SelfReport.flavours.lng._schemaName, _id: _id },
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
      object: SelfReportLNG,
      errorMessage: error
    };
  }
};
