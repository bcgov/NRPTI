const mongoose = require('mongoose');
const ObjectID = require('mongodb').ObjectID;
const PutUtils = require('../../utils/put-utils');
const PostUtils = require('../../utils/post-utils');
const AdministrativeSanctionPost = require('../post/administrative-sanction');

/**
 * Performs all operations necessary to edit a master Administrative Sanction record and its associated flavour records.
 *
 * Example of incomingObj
 *
 *  administrativeSanctions: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'administrativeSanction',
 *      ...
 *      AdministrativeSanctionLNG: {
 *        description: 'lng description'
 *        addRole: 'public',
 *        ...
 *      },
 *      AdministrativeSanctionNRCED: {
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
  let savedFlavourAdministrativeSanctions = [];
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

    if (incomingObj.AdministrativeSanctionLNG) {
      if (incomingObj.AdministrativeSanctionLNG._id) {
        observables.push(
          this.editLNG(args, res, next, { ...flavourIncomingObj, ...incomingObj.AdministrativeSanctionLNG })
        );
      } else {
        const masterRecord = await PutUtils.fetchMasterForCreateFlavour('AdministrativeSanction', incomingObj._id);

        observables.push(
          AdministrativeSanctionPost.createLNG(args, res, next, {
            ...masterRecord,
            ...flavourIncomingObj,
            ...incomingObj.AdministrativeSanctionLNG
          })
        );
      }

      delete incomingObj.AdministrativeSanctionLNG;
    }

    if (incomingObj.AdministrativeSanctionNRCED) {
      if (incomingObj.AdministrativeSanctionNRCED._id) {
        observables.push(
          this.editNRCED(args, res, next, { ...flavourIncomingObj, ...incomingObj.AdministrativeSanctionNRCED })
        );
      } else {
        const masterRecord = await PutUtils.fetchMasterForCreateFlavour('AdministrativeSanction', incomingObj._id);

        observables.push(
          AdministrativeSanctionPost.createNRCED(args, res, next, {
            ...masterRecord,
            ...flavourIncomingObj,
            ...incomingObj.AdministrativeSanctionNRCED
          })
        );
      }

      delete incomingObj.AdministrativeSanctionNRCED;
    }

    if (observables.length > 0) {
      savedFlavourAdministrativeSanctions = await Promise.all(observables);

      flavourIds = savedFlavourAdministrativeSanctions.map(
        flavourAdministrativeSanction => flavourAdministrativeSanction._id
      );
    }
  } catch (e) {
    return {
      status: 'failure',
      object: savedFlavourAdministrativeSanctions,
      errorMessage: e.message
    };
  }

  // save administrativeSanction record
  let savedAdministrativeSanction = null;

  try {
    savedAdministrativeSanction = await this.editMaster(args, res, next, incomingObj, flavourIds);

    return {
      status: 'success',
      object: savedAdministrativeSanction,
      flavours: savedFlavourAdministrativeSanctions
    };
  } catch (e) {
    return {
      status: 'failure',
      object: savedAdministrativeSanction,
      errorMessage: e.message
    };
  }
};

/**
 * Performs all operations necessary to edit a master Administrative Sanction record.
 *
 * Example of incomingObj
 *
 *  administrativeSanctions: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'administrativeSanction',
 *      ...
 *      AdministrativeSanctionLNG: {
 *        description: 'lng description'
 *        addRole: 'public',
 *        ...
 *      },
 *      AdministrativeSanctionNRCED: {
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
 * @returns edited master administrativeSanction record
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

  const AdministrativeSanction = mongoose.model('AdministrativeSanction');

  const sanitizedObj = PutUtils.validateObjectAgainstModel(AdministrativeSanction, incomingObj);

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

  return await AdministrativeSanction.findOneAndUpdate({ _schemaName: 'AdministrativeSanction', _id: _id }, updateObj, {
    new: true
  });
};

/**
 * Performs all operations necessary to edit a lng Administrative Sanction record.
 *
 * Example of incomingObj
 *
 *  administrativeSanctions: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'administrativeSanction',
 *      ...
 *      AdministrativeSanctionLNG: {
 *        description: 'lng description'
 *        addRole: 'public',
 *        ...
 *      },
 *      AdministrativeSanctionNRCED: {
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
 * @returns edited lng administrativeSanction record
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

  let AdministrativeSanctionLNG = mongoose.model('AdministrativeSanctionLNG');

  const sanitizedObj = PutUtils.validateObjectAgainstModel(AdministrativeSanctionLNG, incomingObj);

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

  return await AdministrativeSanctionLNG.findOneAndUpdate(
    { _schemaName: 'AdministrativeSanctionLNG', _id: _id },
    updateObj,
    { new: true }
  );
};

/**
 * Performs all operations necessary to edit a nrced Administrative Sanction record.
 *
 * Example of incomingObj
 *
 *  administrativeSanctions: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'administrativeSanction',
 *      ...
 *      AdministrativeSanctionLNG: {
 *        description: 'lng description'
 *        addRole: 'public',
 *        ...
 *      },
 *      AdministrativeSanctionNRCED: {
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
 * @returns edited nrced administrativeSanction record
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

  let AdministrativeSanctionNRCED = mongoose.model('AdministrativeSanctionNRCED');

  const sanitizedObj = PutUtils.validateObjectAgainstModel(AdministrativeSanctionNRCED, incomingObj);

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

  return await AdministrativeSanctionNRCED.findOneAndUpdate(
    { _schemaName: 'AdministrativeSanctionNRCED', _id: _id },
    updateObj,
    { new: true }
  );
};
