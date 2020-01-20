var mongoose = require('mongoose');
var putUtils = require('../../utils/put-utils');

// Example of incomingObj
/**
 *    inspections: [
 *     {
 *       _id: '85ce24e603984b02a0f8edb42a334876',
 *       recordName: 'test abc',
 *       recordType: 'whatever',
 *       ...
 *       InspectionLNG: {
 *          description: 'lng description'
 *          addRole: 'public',
 *       }
 *       InspectionNRCED: {
 *          summary: 'nrced summary'
 *          removeRole: 'public',
 *       }
 *     },
 */
exports.editMaster = async function (args, res, next, incomingObj) {
  var _id = null;
  if (!incomingObj._id) {
    return {
      status: 'failure',
      object: incomingObj,
      errorMessage: 'No _id provided'
    }
  }

  _id = incomingObj._id;
  delete incomingObj._id;

  // Reject any changes to master perm
  delete incomingObj.read;
  delete incomingObj.write;

  var Inspection = mongoose.model('Inspection');
  try {
    var sanitizedObj = putUtils.validateObjectAgainstModel(Inspection, incomingObj);
  } catch (e) {
    return {
      status: 'failure',
      object: incomingObj,
      errorMessage: e
    }
  }

  // Get flavours
  var observables = [];
  incomingObj.InspectionLNG && observables.push(this.editLNG(args, res, next, incomingObj.InspectionLNG)) && delete incomingObj.InspectionLNG;
  incomingObj.InspectionNRCED && observables.push(this.editNRCED(args, res, next, incomingObj.InspectionNRCED)) && delete incomingObj.InspectionNRCED;

  var finalRes = {
    status: 'success',
    object: sanitizedObj,
    flavours: null
  }
  // Skip if there is nothing to update for master
  if (sanitizedObj !== {}) {
    sanitizedObj['dateUpdated'] = new Date();
    sanitizedObj['updatedBy'] = args.swagger.params.auth_payload.displayName;
    try {
      var savedInspection = savedInspection = await Inspection.findOneAndUpdate(
        { _schemaName: 'Inspection', _id: _id },
        { $set: sanitizedObj },
        { new: true }
      );
      finalRes.object = savedInspection;
    } catch (e) {
      finalRes.status = 'failure';
      finalRes['errorMessage'] = e;
    }
  }

  // Execute edit flavours
  try {
    observables.length > 0 && (finalRes.flavours = await Promise.all(observables));
  } catch (e) {
    finalRes.flavours = {
      status: 'failure',
      object: observables,
      errorMessage: e
    }
  }

  return finalRes;
};

// Example of incomingObj
/**
 *  {
 *      _id: 'cd0b34a4ec1341288b5ea4164daffbf2'
 *      description: 'lng description',
 *      ...
 *      addRole: 'public'
 *  }
 */
exports.editLNG = async function (args, res, next, incomingObj) {
  var _id = null;
  if (!incomingObj._id) {
    return {
      status: 'failure',
      object: incomingObj,
      errorMessage: 'No _id provided'
    }
  }

  _id = incomingObj._id;
  delete incomingObj._id;

  // Reject any changes to permissions.
  // Publishing must be done via addRole or removeRole
  delete incomingObj.read;
  delete incomingObj.write;

  // You cannot update _master
  delete incomingObj._master;

  var InspectionLNG = mongoose.model('InspectionLNG');

  try {
    var sanitizedObj = putUtils.validateObjectAgainstModel(InspectionLNG, incomingObj);
  } catch (e) {
    return {
      status: 'failure',
      object: incomingObj,
      errorMessage: e
    }
  }

  // If incoming object has addRole: 'public' then read will look like ['sysadmin', 'public']
  let updateObj = { $set: sanitizedObj };
  if (incomingObj.addRole && incomingObj.addRole === 'public') {
    updateObj['$addToSet'] = { read: 'public' }
    updateObj.$set['datePublished'] = new Date();
  } else if (incomingObj.removeRole === 'public') {
    updateObj['$pull'] = { read: 'public' }
  }
  updateObj.$set['dateUpdated'] = new Date();

  try {
    var editRes = null
    editRes = await InspectionLNG.findOneAndUpdate(
      { _schemaName: 'InspectionLNG', _id: _id },
      updateObj,
      { new: true }
    );
    return {
      status: 'success',
      object: editRes
    }
  } catch (e) {
    return {
      status: 'failure',
      object: inspectionLNG,
      errorMessage: e
    }
  }
};

// Example of incomingObj
/**
 *  {
 *      _id: 'd95e28e3576247049d797f87e852fec6',
 *      summary: 'nrced summary',
 *      ...
 *      addRole: 'public'
 *  }
 */
exports.editNRCED = async function (args, res, next, incomingObj) {
  var _id = null;
  if (!incomingObj._id) {
    return {
      status: 'failure',
      object: incomingObj,
      errorMessage: 'No _id provided'
    }
  }

  _id = incomingObj._id;
  delete incomingObj._id;

  // Reject any changes to permissions.
  // Publishing must be done via addRole or removeRole
  delete incomingObj.read;
  delete incomingObj.write;

  // You cannot update _master
  delete incomingObj._master;

  var InspectionNRCED = mongoose.model('InspectionNRCED');
  try {
    var sanitizedObj = putUtils.validateObjectAgainstModel(InspectionNRCED, incomingObj);
  } catch (e) {
    return {
      status: 'failure',
      object: incomingObj,
      errorMessage: e
    }
  }

  // If incoming object has addRole: 'public' then read will look like ['sysadmin', 'public']
  let updateObj = { $set: sanitizedObj };
  if (incomingObj.addRole && incomingObj.addRole === 'public') {
    updateObj['$addToSet'] = { read: 'public' }
    updateObj.$set['datePublished'] = new Date();
  } else if (incomingObj.removeRole === 'public') {
    updateObj['$pull'] = { read: 'public' }
  }
  updateObj.$set['dateUpdated'] = new Date();

  try {
    var editRes = null
    editRes = await InspectionNRCED.findOneAndUpdate(
      { _schemaName: 'InspectionNRCED', _id: _id },
      updateObj,
      { new: true }
    );
    return {
      status: 'success',
      object: editRes
    }
  } catch (e) {
    return {
      status: 'failure',
      object: inspectionNRCED,
      errorMessage: e
    }
  }
};
