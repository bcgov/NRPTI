const mongoose = require('mongoose');
const ObjectID = require('mongodb').ObjectID;
const PutUtils = require('../../utils/put-utils');
const PostUtils = require('../../utils/post-utils');
const QueryUtils = require('../../utils/query-utils');
const AdministrativePenaltyPost = require('../post/administrative-penalty');
const DocumentController = require('../document-controller');

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
        const masterRecord = await PutUtils.fetchMasterForCreateFlavour('AdministrativePenalty', incomingObj._id);

        observables.push(
          AdministrativePenaltyPost.createLNG(args, res, next, {
            ...masterRecord,
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
        const masterRecord = await PutUtils.fetchMasterForCreateFlavour('AdministrativePenalty', incomingObj._id);

        observables.push(
          AdministrativePenaltyPost.createNRCED(args, res, next, {
            ...masterRecord,
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
      errorMessage: e.message
    };
  }

  // save administrativePenalty record
  let savedAdministrativePenalty = null;

  try {
    savedAdministrativePenalty = await this.editMaster(args, res, next, incomingObj, flavourIds);
  } catch (e) {
    return {
      status: 'failure',
      object: savedAdministrativePenalty,
      errorMessage: e.message
    };
  }

  // update document roles
  let documentPromises = [];
  let savedDocuments = [];

  try {
    const isAnonymous = QueryUtils.isRecordAnonymous(savedAdministrativePenalty);

    if (isAnonymous) {
      savedAdministrativePenalty.documents.forEach(docId => {
        documentPromises.push(DocumentController.unpublishDocument(docId, args.swagger.params.auth_payload));
      });
    } else if (savedAdministrativePenalty) {
      savedAdministrativePenalty.documents.forEach(docId => {
        DocumentController.publishDocument(savedAdministrativePenalty._id, docId, args.swagger.params.auth_payload);
      });
    }

    if (documentPromises.length > 0) {
      savedDocuments = await Promise.all(documentPromises);
    }
  } catch (e) {
    return {
      status: 'failure',
      object: savedDocuments,
      errorMessage: e.message
    };
  }

  return {
    status: 'success',
    object: savedAdministrativePenalty,
    flavours: savedFlavourAdministrativePenalties,
    documents: savedDocuments
  };
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

  const dotNotatedObj = PutUtils.getDotNotation(sanitizedObj);

  const updateObj = { $set: dotNotatedObj };

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

  if (sanitizedObj.issuedTo && incomingObj.issuedTo) {
    // check if a condition changed that would cause the entity details to be anonymous, or not.
    if (QueryUtils.isRecordAnonymous(sanitizedObj)) {
      updateObj.$pull['issuedTo.read'] = 'public';
    } else {
      updateObj.$addToSet['issuedTo.read'] = 'public';
    }
  }

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

  if (sanitizedObj.issuedTo && incomingObj.issuedTo) {
    // check if a condition changed that would cause the entity details to be anonymous, or not.
    if (QueryUtils.isRecordAnonymous(sanitizedObj)) {
      updateObj.$pull['issuedTo.read'] = 'public';
    } else {
      updateObj.$addToSet['issuedTo.read'] = 'public';
    }
  }

  return await AdministrativePenaltyNRCED.findOneAndUpdate(
    { _schemaName: 'AdministrativePenaltyNRCED', _id: _id },
    updateObj,
    { new: true }
  );
};
