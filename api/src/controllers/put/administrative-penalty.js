const mongoose = require('mongoose');
const putUtils = require('../../utils/put-utils');
const AdministrativePenaltyPost = require('../post/administrative-penalty');
const RECORD_TYPE = require('../../utils/constants/record-type-enum');

/**
 * Edit Master Administrative Penalty record.
 *
 * Example of incomingObj:
 *
 * administrativePenalties: [
 *   {
 *      _id: '85ce24e603984b02a0f8edb42a334876',
 *      recordName: 'test abc',
 *      recordType: 'whatever',
 *      ...
 *      AdministrativePenaltyLNG: {
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

  const AdministrativePenalty = mongoose.model(RECORD_TYPE.AdministrativePenalty._schemaName);

  let sanitizedObj;
  try {
    sanitizedObj = putUtils.validateObjectAgainstModel(AdministrativePenalty, incomingObj);
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
  let savedAdministrativePenalty = null;
  // Skip if there is nothing to update for master
  if (sanitizedObj !== {}) {
    sanitizedObj['dateUpdated'] = new Date();
    sanitizedObj['updatedBy'] = args.swagger.params.auth_payload.displayName;
    try {
      savedAdministrativePenalty = await AdministrativePenalty.findOneAndUpdate(
        { _schemaName: RECORD_TYPE.AdministrativePenalty._schemaName, _id: _id },
        { $set: sanitizedObj },
        { new: true }
      );
      finalRes.object = savedAdministrativePenalty;
    } catch (error) {
      finalRes.status = 'failure';
      finalRes['errorMessage'] = error;
    }
  }

  // Flavours:
  // When editing, we might get a request to make a brand new flavour rather than edit.
  const observables = [];
  if (incomingObj.AdministrativePenaltyLNG && incomingObj.AdministrativePenaltyLNG._id) {
    observables.push(this.editLNG(args, res, next, incomingObj.AdministrativePenaltyLNG));
    delete incomingObj.AdministrativePenaltyLNG;
  } else if (incomingObj.AdministrativePenaltyLNG) {
    observables.push(
      AdministrativePenaltyPost.createLNG(args, res, next, incomingObj.AdministrativePenaltyLNG, savedAdministrativePenalty._id)
    );
    delete incomingObj.AdministrativePenaltyLNG;
  }
  if (incomingObj.AdministrativePenaltyNRCED && incomingObj.AdministrativePenaltyNRCED._id) {
    observables.push(this.editNRCED(args, res, next, incomingObj.AdministrativePenaltyNRCED));
    delete incomingObj.AdministrativePenaltyNRCED;
  } else if (incomingObj.AdministrativePenaltyNRCED) {
    observables.push(
      AdministrativePenaltyPost.createNRCED(
        args,
        res,
        next,
        incomingObj.AdministrativePenaltyNRCED,
        savedAdministrativePenalty._id
      )
    );
    delete incomingObj.AdministrativePenaltyNRCED;
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
 * Edit LNG Administrative Penalty Record
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

  const AdministrativePenaltyLNG = mongoose.model(RECORD_TYPE.AdministrativePenalty.flavours.lng._schemaName);

  let sanitizedObj;
  try {
    sanitizedObj = putUtils.validateObjectAgainstModel(AdministrativePenaltyLNG, incomingObj);
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
    const editRes = await AdministrativePenaltyLNG.findOneAndUpdate(
      { _schemaName: RECORD_TYPE.AdministrativePenalty.flavours.lng._schemaName, _id: _id },
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
      object: AdministrativePenaltyLNG,
      errorMessage: error.message
    };
  }
};

/**
 * Edit NRCED Administrative Penalty Record
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

  const AdministrativePenaltyNRCED = mongoose.model(RECORD_TYPE.AdministrativePenalty.flavours.nrced._schemaName);

  let sanitizedObj;
  try {
    sanitizedObj = putUtils.validateObjectAgainstModel(AdministrativePenaltyNRCED, incomingObj);
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
    const editRes = await AdministrativePenaltyNRCED.findOneAndUpdate(
      { _schemaName: RECORD_TYPE.AdministrativePenalty.flavours.nrced._schemaName, _id: _id },
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
      object: AdministrativePenaltyNRCED,
      errorMessage: error.message
    };
  }
};
