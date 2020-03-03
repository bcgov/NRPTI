const mongoose = require('mongoose');
const ObjectID = require('mongodb').ObjectID;
const PutUtils = require('../../utils/put-utils');
const PostUtils = require('../../utils/post-utils');
// const QueryUtils = require('../../utils/query-utils');
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
exports.editRecord = async function(args, res, next, incomingObj) {
  // save flavour records
  let observables = [];
  let savedFlavourAdministrativePenalties = [];
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

    if (incomingObj.AdministrativePenaltyLNG) {
      if (incomingObj.AdministrativePenaltyLNG._id) {
        observables.push(
          this.editLNG(args, res, next, { ...flavourIncomingObj, ...incomingObj.AdministrativePenaltyLNG })
        );
      } else {
        observables.push(
          AdministrativePenaltyPost.createLNG(args, res, next, {
            ...flavourIncomingObj,
            ...incomingObj.AdministrativePenaltyLNG
          })
        );
      }

      delete incomingObj.AdministrativePenaltyLNG;
    }

    if (incomingObj.AdministrativePenaltyNRCED) {
      if (incomingObj.AdministrativePenaltyNRCED._id) {
        observables.push(
          this.editNRCED(args, res, next, { ...flavourIncomingObj, ...incomingObj.AdministrativePenaltyNRCED })
        );
      } else {
        observables.push(
          AdministrativePenaltyPost.createNRCED(args, res, next, {
            ...flavourIncomingObj,
            ...incomingObj.AdministrativePenaltyNRCED
          })
        );
      }

      delete incomingObj.AdministrativePenaltyNRCED;
    }

    if (observables.length > 0) {
      savedFlavourAdministrativePenalties = await Promise.all(observables);

      flavourIds = savedFlavourAdministrativePenalties.map(
        flavourAdministrativePenalty => flavourAdministrativePenalty._id
      );
    }
  } catch (e) {
    return {
      status: 'failure',
      object: savedFlavourAdministrativePenalties,
      errorMessage: e
    };
  }

  // save administrativePenalty record
  let savedAdministrativePenalty = null;

  try {
    savedAdministrativePenalty = await this.editMaster(args, res, next, incomingObj, flavourIds);

    return {
      status: 'success',
      object: savedAdministrativePenalty,
      flavours: savedFlavourAdministrativePenalties
    };
  } catch (e) {
    return {
      status: 'failure',
      object: savedAdministrativePenalty,
      errorMessage: e
    };
  }
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

  const AdministrativePenalty = mongoose.model('AdministrativePenalty');

  const sanitizedObj = PutUtils.validateObjectAgainstModel(AdministrativePenalty, incomingObj);

  if (!sanitizedObj || sanitizedObj === {}) {
    // skip, as there are no changes to master record
    return;
  }

  sanitizedObj.issuedTo && (sanitizedObj.issuedTo.fullName = PostUtils.getIssuedToFullNameValue(incomingObj.issuedTo));

  sanitizedObj.dateUpdated = new Date();
  sanitizedObj.updatedBy = args.swagger.params.auth_payload.displayName;

  let updateObj = { $set: sanitizedObj };

  if (flavourIds && flavourIds.length) {
    updateObj.$addToSet = { _flavourRecords: flavourIds.map(id => new ObjectID(id)) };
  }

  return await AdministrativePenalty.findOneAndUpdate({ _schemaName: 'AdministrativePenalty', _id: _id }, updateObj, {
    new: true
  });
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

  let AdministrativePenaltyLNG = mongoose.model('AdministrativePenaltyLNG');

  const sanitizedObj = PutUtils.validateObjectAgainstModel(AdministrativePenaltyLNG, incomingObj);

  sanitizedObj.issuedTo && (sanitizedObj.issuedTo.fullName = PostUtils.getIssuedToFullNameValue(incomingObj.issuedTo));

  // If incoming object has addRole: 'public' then read will look like ['sysadmin', 'public']
  let updateObj = { $set: sanitizedObj };

  if (incomingObj.addRole && incomingObj.addRole === 'public') {
    updateObj['$addToSet'] = { read: 'public' };
    updateObj.$set['datePublished'] = new Date();
    updateObj.$set['publishedBy'] = args.swagger.params.auth_payload.displayName;

    // TODO this currently fails because dirty fields (PTI-341) sets the read/write fields to null when it should always be an array, and mongo fails to save as a result.  Enable when fixed.
    // if (!QueryUtils.isRecordAnonymous(incomingObj)) {
    //   updateObj['$addToSet'] = { 'issuedTo.read': 'public' };
    // }
  } else if (incomingObj.removeRole && incomingObj.removeRole === 'public') {
    updateObj['$pull'] = { read: 'public' };
    updateObj.$set['datePublished'] = null;
    updateObj.$set['publishedBy'] = '';
  }

  // TODO this currently fails because dirty fields (PTI-341) sets the read/write fields to null when it should always be an array, and mongo fails to save as a result.  Enable when fixed.
  // // check if a condition changed that would cause the entity information to no longer be public (anonymous)
  // if (QueryUtils.isRecordAnonymous(incomingObj)) {
  //   updateObj['$pull'] = { 'issuedTo.read': 'public' };
  // }

  updateObj.$set['dateUpdated'] = new Date();

  return await AdministrativePenaltyLNG.findOneAndUpdate(
    { _schemaName: 'AdministrativePenaltyLNG', _id: _id },
    updateObj,
    { new: true }
  );
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
exports.editNRCED = async function(args, res, next, incomingObj) {
  if (!incomingObj || !incomingObj._id) {
    // skip, as there is no way to update the NRCED record
    return;
  }

  const _id = incomingObj._id;
  delete incomingObj._id;

  // Reject any changes to permissions
  // Publishing must be done via addRole or removeRole
  delete incomingObj.read;
  delete incomingObj.write;

  let AdministrativePenaltyNRCED = mongoose.model('AdministrativePenaltyNRCED');

  const sanitizedObj = PutUtils.validateObjectAgainstModel(AdministrativePenaltyNRCED, incomingObj);

  sanitizedObj.issuedTo && (sanitizedObj.issuedTo.fullName = PostUtils.getIssuedToFullNameValue(incomingObj.issuedTo));

  // If incoming object has addRole: 'public' then read will look like ['sysadmin', 'public']
  let updateObj = { $set: sanitizedObj };

  if (incomingObj.addRole && incomingObj.addRole === 'public') {
    updateObj['$addToSet'] = { read: 'public' };
    updateObj.$set['datePublished'] = new Date();
    updateObj.$set['publishedBy'] = args.swagger.params.auth_payload.displayName;

    // TODO this currently fails because dirty fields (PTI-341) sets the read/write fields to null when it should always be an array, and mongo fails to save as a result.  Enable when fixed.
    // if (!QueryUtils.isRecordAnonymous(incomingObj)) {
    //   updateObj['$addToSet'] = { 'issuedTo.read': 'public' };
    // }
  } else if (incomingObj.removeRole && incomingObj.removeRole === 'public') {
    updateObj['$pull'] = { read: 'public' };
    updateObj.$set['datePublished'] = null;
    updateObj.$set['publishedBy'] = '';
  }

  // TODO this currently fails because dirty fields (PTI-341) sets the read/write fields to null when it should always be an array, and mongo fails to save as a result.  Enable when fixed.
  // // check if a condition changed that would cause the entity information to no longer be public (anonymous)
  // if (QueryUtils.isRecordAnonymous(incomingObj)) {
  //   updateObj['$pull'] = { 'issuedTo.read': 'public' };
  // }

  updateObj.$set['dateUpdated'] = new Date();

  return await AdministrativePenaltyNRCED.findOneAndUpdate(
    { _schemaName: 'AdministrativePenaltyNRCED', _id: _id },
    updateObj,
    { new: true }
  );
};
