const mongoose = require('mongoose');
const putUtils = require('../../utils/put-utils');
const RestorativeJusticePost = require('../post/restorative-justice');
const RECORD_TYPE = require('../../utils/constants/record-type-enum');

/**
 * Edit Master Restorative Justice record.
 *
 * Example of incomingObj:
 *
 * restorativeJustices: [
 *   {
 *      _id: '85ce24e603984b02a0f8edb42a334876',
 *      recordName: 'test abc',
 *      recordType: 'whatever',
 *      ...
 *      RestorativeJusticeLNG: {
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

  const RestorativeJustice = mongoose.model(RECORD_TYPE.RestorativeJustice._schemaName);

  let sanitizedObj;
  try {
    sanitizedObj = putUtils.validateObjectAgainstModel(RestorativeJustice, incomingObj);
  } catch (error) {
    return {
      status: 'failure',
      object: incomingObj,
      errorMessage: error.message
    };
  }

  const finalRes = {
    status: 'success',
    object: sanitizedObj,
    flavours: null
  };
  let savedRestorativeJustice = null;
  // Skip if there is nothing to update for master
  if (sanitizedObj !== {}) {
    sanitizedObj['dateUpdated'] = new Date();
    sanitizedObj['updatedBy'] = args.swagger.params.auth_payload.displayName;
    try {
      savedRestorativeJustice = await RestorativeJustice.findOneAndUpdate(
        { _schemaName: RECORD_TYPE.RestorativeJustice._schemaName, _id: _id },
        { $set: sanitizedObj },
        { new: true }
      );
      finalRes.object = savedRestorativeJustice;
    } catch (error) {
      finalRes.status = 'failure';
      finalRes['errorMessage'] = error;
    }
  }

  // Flavours:
  // When editing, we might get a request to make a brand new flavour rather than edit.
  const observables = [];
  if (incomingObj.RestorativeJusticeLNG && incomingObj.RestorativeJusticeLNG._id) {
    observables.push(this.editLNG(args, res, next, incomingObj.RestorativeJusticeLNG));
    delete incomingObj.RestorativeJusticeLNG;
  } else if (incomingObj.RestorativeJusticeLNG) {
    observables.push(
      RestorativeJusticePost.createLNG(args, res, next, incomingObj.RestorativeJusticeLNG, savedRestorativeJustice._id)
    );
    delete incomingObj.RestorativeJusticeLNG;
  }
  if (incomingObj.RestorativeJusticeNRCED && incomingObj.RestorativeJusticeNRCED._id) {
    observables.push(this.editNRCED(args, res, next, incomingObj.RestorativeJusticeNRCED));
    delete incomingObj.RestorativeJusticeNRCED;
  } else if (incomingObj.RestorativeJusticeNRCED) {
    observables.push(
      RestorativeJusticePost.createNRCED(
        args,
        res,
        next,
        incomingObj.RestorativeJusticeNRCED,
        savedRestorativeJustice._id
      )
    );
    delete incomingObj.RestorativeJusticeNRCED;
  }

  // Execute edit flavours
  try {
    observables.length > 0 && (finalRes.flavours = await Promise.all(observables));
  } catch (error) {
    finalRes.flavours = {
      status: 'failure',
      object: observables,
      errorMessage: error.message
    };
  }

  return finalRes;
};

/**
 * Edit LNG Restorative Justice Record
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

  const RestorativeJusticeLNG = mongoose.model(RECORD_TYPE.RestorativeJustice.flavours.lng._schemaName);

  let sanitizedObj;
  try {
    sanitizedObj = putUtils.validateObjectAgainstModel(RestorativeJusticeLNG, incomingObj);
  } catch (error) {
    return {
      status: 'failure',
      object: incomingObj,
      errorMessage: error.message
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
    const editRes = await RestorativeJusticeLNG.findOneAndUpdate(
      { _schemaName: RECORD_TYPE.RestorativeJustice.flavours.lng._schemaName, _id: _id },
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
      object: RestorativeJusticeLNG,
      errorMessage: error.message
    };
  }
};

/**
 * Edit NRCED Restorative Justice Record
 *
 * Example of incomingObj:
 *
 * {
 *   _id: 'cd0b34a4ec1341288b5ea4164daffbf2'
 *   summary: 'nrced description',
 *   ...
 *   addRole: 'public'
 * }
 */
exports.editNRCED = async function(args, res, next, incomingObj) {
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

  const RestorativeJusticeNRCED = mongoose.model(RECORD_TYPE.RestorativeJustice.flavours.nrced._schemaName);

  let sanitizedObj;
  try {
    sanitizedObj = putUtils.validateObjectAgainstModel(RestorativeJusticeNRCED, incomingObj);
  } catch (error) {
    return {
      status: 'failure',
      object: incomingObj,
      errorMessage: error.message
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
    const editRes = await RestorativeJusticeNRCED.findOneAndUpdate(
      { _schemaName: RECORD_TYPE.RestorativeJustice.flavours.nrced._schemaName, _id: _id },
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
      object: RestorativeJusticeNRCED,
      errorMessage: error.message
    };
  }
};
