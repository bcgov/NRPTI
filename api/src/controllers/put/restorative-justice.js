const mongoose = require('mongoose');
const ObjectID = require('mongodb').ObjectID;
const PutUtils = require('../../utils/put-utils');
const PostUtils = require('../../utils/post-utils');
const RestorativeJusticePost = require('../post/restorative-justice');

/**
 * Performs all operations necessary to edit a master Restorative Justice record and its associated flavour records.
 *
 * Example of incomingObj
 *
 *  restorativeJustices: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'restorativeJustice',
 *      ...
 *      RestorativeJusticeLNG: {
 *        description: 'lng description'
 *        addRole: 'public',
 *        ...
 *      },
 *      RestorativeJusticeNRCED: {
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
  let savedFlavourRestorativeJustices = [];
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

    if (incomingObj.RestorativeJusticeLNG) {
      if (incomingObj.RestorativeJusticeLNG._id) {
        observables.push(
          this.editLNG(args, res, next, { ...flavourIncomingObj, ...incomingObj.RestorativeJusticeLNG })
        );
      } else {
        const masterRecord = await PutUtils.fetchMasterForCreateFlavour('RestorativeJustice', incomingObj._id);

        observables.push(
          RestorativeJusticePost.createLNG(args, res, next, {
            ...masterRecord,
            ...flavourIncomingObj,
            ...incomingObj.RestorativeJusticeLNG
          })
        );
      }

      delete incomingObj.RestorativeJusticeLNG;
    }

    if (incomingObj.RestorativeJusticeNRCED) {
      if (incomingObj.RestorativeJusticeNRCED._id) {
        observables.push(
          this.editNRCED(args, res, next, { ...flavourIncomingObj, ...incomingObj.RestorativeJusticeNRCED })
        );
      } else {
        const masterRecord = await PutUtils.fetchMasterForCreateFlavour('RestorativeJustice', incomingObj._id);

        observables.push(
          RestorativeJusticePost.createNRCED(args, res, next, {
            ...masterRecord,
            ...flavourIncomingObj,
            ...incomingObj.RestorativeJusticeNRCED
          })
        );
      }

      delete incomingObj.RestorativeJusticeNRCED;
    }

    if (observables.length > 0) {
      savedFlavourRestorativeJustices = await Promise.all(observables);

      flavourIds = savedFlavourRestorativeJustices.map(flavourRestorativeJustice => flavourRestorativeJustice._id);
    }
  } catch (e) {
    return {
      status: 'failure',
      object: savedFlavourRestorativeJustices,
      errorMessage: e.message
    };
  }

  // save restorativeJustice record
  let savedRestorativeJustice = null;

  try {
    savedRestorativeJustice = await this.editMaster(args, res, next, incomingObj, flavourIds);

    return {
      status: 'success',
      object: savedRestorativeJustice,
      flavours: savedFlavourRestorativeJustices
    };
  } catch (e) {
    return {
      status: 'failure',
      object: savedRestorativeJustice,
      errorMessage: e.message
    };
  }
};

/**
 * Performs all operations necessary to edit a master Restorative Justice record.
 *
 * Example of incomingObj
 *
 *  restorativeJustices: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'restorativeJustice',
 *      ...
 *      RestorativeJusticeLNG: {
 *        description: 'lng description'
 *        addRole: 'public',
 *        ...
 *      },
 *      RestorativeJusticeNRCED: {
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
 * @returns edited master restorativeJustice record
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

  const RestorativeJustice = mongoose.model('RestorativeJustice');

  const sanitizedObj = PutUtils.validateObjectAgainstModel(RestorativeJustice, incomingObj);

  if (!sanitizedObj || sanitizedObj === {}) {
    // skip, as there are no changes to master record
    return;
  }

  sanitizedObj.issuedTo && (sanitizedObj.issuedTo.fullName = PostUtils.getIssuedToFullNameValue(incomingObj.issuedTo));

  sanitizedObj.dateUpdated = new Date();
  sanitizedObj.updatedBy = args.swagger.params.auth_payload.displayName;

  const dotNotatedObj = PutUtils.getDotNotation(sanitizedObj);

  const updateObj = { $set: dotNotatedObj };

  if (flavourIds && flavourIds.length) {
    updateObj.$addToSet = { _flavourRecords: flavourIds.map(id => new ObjectID(id)) };
  }

  return await RestorativeJustice.findOneAndUpdate({ _schemaName: 'RestorativeJustice', _id: _id }, updateObj, {
    new: true
  });
};

/**
 * Performs all operations necessary to edit a lng Restorative Justice record.
 *
 * Example of incomingObj
 *
 *  restorativeJustices: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'restorativeJustice',
 *      ...
 *      RestorativeJusticeLNG: {
 *        description: 'lng description'
 *        addRole: 'public',
 *        ...
 *      },
 *      RestorativeJusticeNRCED: {
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
 * @returns edited lng restorativeJustice record
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

  let RestorativeJusticeLNG = mongoose.model('RestorativeJusticeLNG');

  const sanitizedObj = PutUtils.validateObjectAgainstModel(RestorativeJusticeLNG, incomingObj);

  sanitizedObj.issuedTo && (sanitizedObj.issuedTo.fullName = PostUtils.getIssuedToFullNameValue(incomingObj.issuedTo));

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

  if (incomingObj.issuedTo && incomingObj.issuedTo.removeRole === 'public') {
    updateObj.$pull['issuedTo.read'] = 'public';
  } else if (incomingObj.issuedTo && incomingObj.issuedTo.addRole === 'public') {
    updateObj.$addToSet['issuedTo.read'] = 'public';
  }

  return await RestorativeJusticeLNG.findOneAndUpdate({ _schemaName: 'RestorativeJusticeLNG', _id: _id }, updateObj, {
    new: true
  });
};

/**
 * Performs all operations necessary to edit a nrced Restorative Justice record.
 *
 * Example of incomingObj
 *
 *  restorativeJustices: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'restorativeJustice',
 *      ...
 *      RestorativeJusticeLNG: {
 *        description: 'lng description'
 *        addRole: 'public',
 *        ...
 *      },
 *      RestorativeJusticeNRCED: {
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
 * @returns edited nrced restorativeJustice record
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

  let RestorativeJusticeNRCED = mongoose.model('RestorativeJusticeNRCED');

  const sanitizedObj = PutUtils.validateObjectAgainstModel(RestorativeJusticeNRCED, incomingObj);

  sanitizedObj.issuedTo && (sanitizedObj.issuedTo.fullName = PostUtils.getIssuedToFullNameValue(incomingObj.issuedTo));

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

  if (incomingObj.issuedTo && incomingObj.issuedTo.removeRole === 'public') {
    updateObj.$pull['issuedTo.read'] = 'public';
  } else if (incomingObj.issuedTo && incomingObj.issuedTo.addRole === 'public') {
    updateObj.$addToSet['issuedTo.read'] = 'public';
  }

  return await RestorativeJusticeNRCED.findOneAndUpdate(
    { _schemaName: 'RestorativeJusticeNRCED', _id: _id },
    updateObj,
    { new: true }
  );
};
