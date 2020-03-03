const mongoose = require('mongoose');
const ObjectID = require('mongodb').ObjectID;
const PutUtils = require('../../utils/put-utils');
const PostUtils = require('../../utils/post-utils');
// const QueryUtils = require('../../utils/query-utils');
const WarningPost = require('../post/warning');

/**
 * Performs all operations necessary to edit a master Warning record and its associated flavour records.
 *
 * Example of incomingObj
 *
 *  warnings: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'warning',
 *      ...
 *      WarningLNG: {
 *        description: 'lng description'
 *        addRole: 'public',
 *        ...
 *      },
 *      WarningNRCED: {
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
  let savedFlavourWarnings = [];
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

    if (incomingObj.WarningLNG) {
      if (incomingObj.WarningLNG._id) {
        observables.push(this.editLNG(args, res, next, { ...flavourIncomingObj, ...incomingObj.WarningLNG }));
      } else {
        observables.push(WarningPost.createLNG(args, res, next, { ...flavourIncomingObj, ...incomingObj.WarningLNG }));
      }

      delete incomingObj.WarningLNG;
    }

    if (incomingObj.WarningNRCED) {
      if (incomingObj.WarningNRCED._id) {
        observables.push(this.editNRCED(args, res, next, { ...flavourIncomingObj, ...incomingObj.WarningNRCED }));
      } else {
        observables.push(
          WarningPost.createNRCED(args, res, next, { ...flavourIncomingObj, ...incomingObj.WarningNRCED })
        );
      }

      delete incomingObj.WarningNRCED;
    }

    if (observables.length > 0) {
      savedFlavourWarnings = await Promise.all(observables);

      flavourIds = savedFlavourWarnings.map(flavourWarning => flavourWarning._id);
    }
  } catch (e) {
    return {
      status: 'failure',
      object: savedFlavourWarnings,
      errorMessage: e
    };
  }

  // save warning record
  let savedWarning = null;

  try {
    savedWarning = await this.editMaster(args, res, next, incomingObj, flavourIds);

    return {
      status: 'success',
      object: savedWarning,
      flavours: savedFlavourWarnings
    };
  } catch (e) {
    return {
      status: 'failure',
      object: savedWarning,
      errorMessage: e
    };
  }
};

/**
 * Performs all operations necessary to edit a master Warning record.
 *
 * Example of incomingObj
 *
 *  warnings: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'warning',
 *      ...
 *      WarningLNG: {
 *        description: 'lng description'
 *        addRole: 'public',
 *        ...
 *      },
 *      WarningNRCED: {
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
 * @returns edited master warning record
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

  const Warning = mongoose.model('Warning');

  const sanitizedObj = PutUtils.validateObjectAgainstModel(Warning, incomingObj);

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

  return await Warning.findOneAndUpdate({ _schemaName: 'Warning', _id: _id }, updateObj, { new: true });
};

/**
 * Performs all operations necessary to edit a lng Warning record.
 *
 * Example of incomingObj
 *
 *  warnings: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'warning',
 *      ...
 *      WarningLNG: {
 *        description: 'lng description'
 *        addRole: 'public',
 *        ...
 *      },
 *      WarningNRCED: {
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
 * @returns edited lng warning record
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

  let WarningLNG = mongoose.model('WarningLNG');

  const sanitizedObj = PutUtils.validateObjectAgainstModel(WarningLNG, incomingObj);

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

  return await WarningLNG.findOneAndUpdate({ _schemaName: 'WarningLNG', _id: _id }, updateObj, { new: true });
};

/**
 * Performs all operations necessary to edit a nrced Warning record.
 *
 * Example of incomingObj
 *
 *  warnings: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'warning',
 *      ...
 *      WarningLNG: {
 *        description: 'lng description'
 *        addRole: 'public',
 *        ...
 *      },
 *      WarningNRCED: {
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
 * @returns edited nrced warning record
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

  let WarningNRCED = mongoose.model('WarningNRCED');

  const sanitizedObj = PutUtils.validateObjectAgainstModel(WarningNRCED, incomingObj);

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

  return await WarningNRCED.findOneAndUpdate({ _schemaName: 'WarningNRCED', _id: _id }, updateObj, { new: true });
};
