const mongoose = require('mongoose');
const ObjectID = require('mongodb').ObjectID;
const PutUtils = require('../../utils/put-utils');
const PostUtils = require('../../utils/post-utils');
const QueryUtils = require('../../utils/query-utils');
const CourtConvictionPost = require('../post/court-conviction');
const DocumentController = require('../document-controller');

/**
 * Performs all operations necessary to edit a master Court Conviction record and its associated flavour records.
 *
 * Example of incomingObj
 *
 *  courtConvictions: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'courtConviction',
 *      ...
 *      CourtConvictionLNG: {
 *        description: 'lng description'
 *        addRole: 'public',
 *        ...
 *      },
 *      CourtConvictionNRCED: {
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
  let savedFlavourCourtConvictions = [];
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

    if (incomingObj.CourtConvictionLNG) {
      if (incomingObj.CourtConvictionLNG._id) {
        observables.push(this.editLNG(args, res, next, { ...flavourIncomingObj, ...incomingObj.CourtConvictionLNG }));
      } else {
        const masterRecord = await PutUtils.fetchMasterForCreateFlavour('CourtConviction', incomingObj._id);

        observables.push(
          CourtConvictionPost.createLNG(args, res, next, {
            ...masterRecord,
            ...flavourIncomingObj,
            ...incomingObj.CourtConvictionLNG
          })
        );
      }

      delete incomingObj.CourtConvictionLNG;
    }

    if (incomingObj.CourtConvictionNRCED) {
      if (incomingObj.CourtConvictionNRCED._id) {
        observables.push(
          this.editNRCED(args, res, next, { ...flavourIncomingObj, ...incomingObj.CourtConvictionNRCED })
        );
      } else {
        const masterRecord = await PutUtils.fetchMasterForCreateFlavour('CourtConviction', incomingObj._id);

        observables.push(
          CourtConvictionPost.createNRCED(args, res, next, {
            ...masterRecord,
            ...flavourIncomingObj,
            ...incomingObj.CourtConvictionNRCED
          })
        );
      }

      delete incomingObj.CourtConvictionNRCED;
    }

    if (observables.length > 0) {
      savedFlavourCourtConvictions = await Promise.all(observables);

      flavourIds = savedFlavourCourtConvictions.map(flavourCourtConviction => flavourCourtConviction._id);
    }
  } catch (e) {
    return {
      status: 'failure',
      object: savedFlavourCourtConvictions,
      errorMessage: e.message
    };
  }

  // save courtConviction record
  let savedCourtConviction = null;

  try {
    savedCourtConviction = await this.editMaster(args, res, next, incomingObj, flavourIds);
  } catch (e) {
    return {
      status: 'failure',
      object: savedCourtConviction,
      errorMessage: e.message
    };
  }

  // update document roles
  let documentPromises = [];
  let savedDocuments = [];

  try {
    if (await DocumentController.canDocumentBePublished(savedCourtConviction)) {
      // publish the document
      savedCourtConviction.documents.forEach(docId => {
        documentPromises.push(DocumentController.publishDocument(docId, args.swagger.params.auth_payload));
      });
    } else {
      // unpublish the document
      savedCourtConviction.documents.forEach(docId => {
        documentPromises.push(DocumentController.unpublishDocument(docId, args.swagger.params.auth_payload));
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
    object: savedCourtConviction,
    flavours: savedFlavourCourtConvictions,
    documents: savedDocuments
  };
};

/**
 * Performs all operations necessary to edit a master Court Conviction record.
 *
 * Example of incomingObj
 *
 *  courtConvictions: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'courtConviction',
 *      ...
 *      CourtConvictionLNG: {
 *        description: 'lng description'
 *        addRole: 'public',
 *        ...
 *      },
 *      CourtConvictionNRCED: {
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
 * @returns edited master courtConviction record
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

  const CourtConviction = mongoose.model('CourtConviction');

  const sanitizedObj = PutUtils.validateObjectAgainstModel(CourtConviction, incomingObj);

  if (!sanitizedObj || sanitizedObj === {}) {
    // skip, as there are no changes to master record
    return;
  }

  sanitizedObj.issuedTo && (sanitizedObj.issuedTo.fullName = PostUtils.getIssuedToFullNameValue(incomingObj.issuedTo));

  sanitizedObj.dateUpdated = new Date();
  sanitizedObj.updatedBy = args.swagger.params.auth_payload.displayName;

  const dotNotatedObj = PutUtils.getDotNotation(sanitizedObj);

  const updateObj = { $set: dotNotatedObj, $addToSet: {}, $pull: {} };

  if (flavourIds && flavourIds.length) {
    updateObj.$addToSet = { _flavourRecords: flavourIds.map(id => new ObjectID(id)) };
  }

  if (sanitizedObj.issuedTo && incomingObj.issuedTo) {
    // check if a condition changed that would cause the entity details to be anonymous, or not.
    const isConsideredAnonymous = QueryUtils.isRecordConsideredAnonymous(sanitizedObj);
    if (isConsideredAnonymous || incomingObj.issuedTo.removeRole === 'public') {
      // the record is considered anonymous OR the user wants to manually set it to anonymous
      updateObj.$pull['issuedTo.read'] = 'public';
    } else if (!isConsideredAnonymous) {
      // the record is not considered anonymous
      updateObj.$addToSet['issuedTo.read'] = 'public';
    }
  }

  return await CourtConviction.findOneAndUpdate({ _schemaName: 'CourtConviction', _id: _id }, updateObj, {
    new: true
  });
};

/**
 * Performs all operations necessary to edit a lng Court Conviction record.
 *
 * Example of incomingObj
 *
 *  courtConvictions: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'courtConviction',
 *      ...
 *      CourtConvictionLNG: {
 *        description: 'lng description'
 *        addRole: 'public',
 *        ...
 *      },
 *      CourtConvictionNRCED: {
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
 * @returns edited lng courtConviction record
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

  let CourtConvictionLNG = mongoose.model('CourtConvictionLNG');

  const sanitizedObj = PutUtils.validateObjectAgainstModel(CourtConvictionLNG, incomingObj);

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
    const isConsideredAnonymous = QueryUtils.isRecordConsideredAnonymous(sanitizedObj);
    if (isConsideredAnonymous || incomingObj.issuedTo.removeRole === 'public') {
      // the record is considered anonymous OR the user wants to manually set it to anonymous
      updateObj.$pull['issuedTo.read'] = 'public';
    } else if (!isConsideredAnonymous) {
      // the record is not considered anonymous
      updateObj.$addToSet['issuedTo.read'] = 'public';
    }
  }

  return await CourtConvictionLNG.findOneAndUpdate({ _schemaName: 'CourtConvictionLNG', _id: _id }, updateObj, {
    new: true
  });
};

/**
 * Performs all operations necessary to edit a nrced Court Conviction record.
 *
 * Example of incomingObj
 *
 *  courtConvictions: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'courtConviction',
 *      ...
 *      CourtConvictionLNG: {
 *        description: 'lng description'
 *        addRole: 'public',
 *        ...
 *      },
 *      CourtConvictionNRCED: {
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
 * @returns edited nrced courtConviction record
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

  let CourtConvictionNRCED = mongoose.model('CourtConvictionNRCED');

  const sanitizedObj = PutUtils.validateObjectAgainstModel(CourtConvictionNRCED, incomingObj);

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
    const isConsideredAnonymous = QueryUtils.isRecordConsideredAnonymous(sanitizedObj);
    if (isConsideredAnonymous || incomingObj.issuedTo.removeRole === 'public') {
      // the record is considered anonymous OR the user wants to manually set it to anonymous
      updateObj.$pull['issuedTo.read'] = 'public';
    } else if (!isConsideredAnonymous) {
      // the record is not considered anonymous
      updateObj.$addToSet['issuedTo.read'] = 'public';
    }
  }

  return await CourtConvictionNRCED.findOneAndUpdate({ _schemaName: 'CourtConvictionNRCED', _id: _id }, updateObj, {
    new: true
  });
};
