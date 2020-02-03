const mongoose = require('mongoose');
const putUtils = require('../../utils/put-utils');
const AdministrativeSanctionPost = require('../post/administrative-sanction');
const RECORD_TYPE = require('../../utils/constants/record-type-enum');

/**
 * Edit Master Administrative Sanction record.
 *
 * Example of incomingObj:
 *
 * administrativeSanctions: [
 *   {
 *      _id: '85ce24e603984b02a0f8edb42a334876',
 *      recordName: 'test abc',
 *      recordType: 'whatever',
 *      ...
 *      AdministrativeSanctionLNG: {
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

  const AdministrativeSanction = mongoose.model(RECORD_TYPE.AdministrativeSanction._schemaName);

  let sanitizedObj;
  try {
    sanitizedObj = putUtils.validateObjectAgainstModel(AdministrativeSanction, incomingObj);
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
  let savedAdministrativeSanction = null;
  // Skip if there is nothing to update for master
  if (sanitizedObj !== {}) {
    sanitizedObj['dateUpdated'] = new Date();
    sanitizedObj['updatedBy'] = args.swagger.params.auth_payload.displayName;
    try {
      savedAdministrativeSanction = await AdministrativeSanction.findOneAndUpdate(
        { _schemaName: RECORD_TYPE.AdministrativeSanction._schemaName, _id: _id },
        { $set: sanitizedObj },
        { new: true }
      );
      finalRes.object = savedAdministrativeSanction;
    } catch (error) {
      finalRes.status = 'failure';
      finalRes['errorMessage'] = error;
    }
  }

  // Flavours:
  // When editing, we might get a request to make a brand new flavour rather than edit.
  const observables = [];
  if (incomingObj.AdministrativeSanctionLNG && incomingObj.AdministrativeSanctionLNG._id) {
    observables.push(this.editLNG(args, res, next, incomingObj.AdministrativeSanctionLNG));
    delete incomingObj.AdministrativeSanctionLNG;
  } else if (incomingObj.AdministrativeSanctionLNG) {
    observables.push(
      AdministrativeSanctionPost.createLNG(args, res, next, incomingObj.AdministrativeSanctionLNG, savedAdministrativeSanction._id)
    );
    delete incomingObj.AdministrativeSanctionLNG;
  }
  if (incomingObj.AdministrativeSanctionNRCED && incomingObj.AdministrativeSanctionNRCED._id) {
    observables.push(this.editNRCED(args, res, next, incomingObj.AdministrativeSanctionNRCED));
    delete incomingObj.AdministrativeSanctionNRCED;
  } else if (incomingObj.AdministrativeSanctionNRCED) {
    observables.push(
      AdministrativeSanctionPost.createNRCED(
        args,
        res,
        next,
        incomingObj.AdministrativeSanctionNRCED,
        savedAdministrativeSanction._id
      )
    );
    delete incomingObj.AdministrativeSanctionNRCED;
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
 * Edit LNG Administrative Sanction Record
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

  const AdministrativeSanctionLNG = mongoose.model(RECORD_TYPE.AdministrativeSanction.flavours.lng._schemaName);

  let sanitizedObj;
  try {
    sanitizedObj = putUtils.validateObjectAgainstModel(AdministrativeSanctionLNG, incomingObj);
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
    const editRes = await AdministrativeSanctionLNG.findOneAndUpdate(
      { _schemaName: RECORD_TYPE.AdministrativeSanction.flavours.lng._schemaName, _id: _id },
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
      object: AdministrativeSanctionLNG,
      errorMessage: error.message
    };
  }
};

/**
 * Edit NRCED Administrative Sanction Record
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

  const AdministrativeSanctionNRCED = mongoose.model(RECORD_TYPE.AdministrativeSanction.flavours.nrced._schemaName);

  let sanitizedObj;
  try {
    sanitizedObj = putUtils.validateObjectAgainstModel(AdministrativeSanctionNRCED, incomingObj);
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
    const editRes = await AdministrativeSanctionNRCED.findOneAndUpdate(
      { _schemaName: RECORD_TYPE.AdministrativeSanction.flavours.nrced._schemaName, _id: _id },
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
      object: AdministrativeSanctionNRCED,
      errorMessage: error.message
    };
  }
};
