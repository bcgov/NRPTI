const mongoose = require('mongoose');
const ObjectID = require('mongodb').ObjectID;
const PutUtils = require('../../utils/put-utils');
const PostUtils = require('../../utils/post-utils');
const QueryUtils = require('../../utils/query-utils');
const InspectionPost = require('../post/inspection');
const DocumentController = require('../document-controller');

/**
 * Performs all operations necessary to edit a master Inspection record and its associated flavour records.
 *
 * Example of incomingObj
 *
 *  inspections: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'inspection',
 *      ...
 *      InspectionLNG: {
 *        description: 'lng description'
 *        addRole: 'public',
 *        ...
 *      },
 *      InspectionNRCED: {
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
  let savedFlavourInspections = [];
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

    if (incomingObj.InspectionLNG) {
      if (incomingObj.InspectionLNG._id) {
        observables.push(this.editLNG(args, res, next, { ...flavourIncomingObj, ...incomingObj.InspectionLNG }));
      } else {
        const masterRecord = await PutUtils.fetchMasterForCreateFlavour('Inspection', incomingObj._id);

        observables.push(
          InspectionPost.createLNG(args, res, next, {
            ...masterRecord,
            ...flavourIncomingObj,
            ...incomingObj.InspectionLNG
          })
        );
      }

      delete incomingObj.InspectionLNG;
    }

    if (incomingObj.InspectionNRCED) {
      if (incomingObj.InspectionNRCED._id) {
        observables.push(this.editNRCED(args, res, next, { ...flavourIncomingObj, ...incomingObj.InspectionNRCED }));
      } else {
        const masterRecord = await PutUtils.fetchMasterForCreateFlavour('Inspection', incomingObj._id);

        observables.push(
          InspectionPost.createNRCED(args, res, next, {
            ...masterRecord,
            ...flavourIncomingObj,
            ...incomingObj.InspectionNRCED
          })
        );
      }

      delete incomingObj.InspectionNRCED;
    }

    if (observables.length > 0) {
      savedFlavourInspections = await Promise.all(observables);

      flavourIds = savedFlavourInspections.map(flavourInspection => flavourInspection._id);
    }
  } catch (e) {
    return {
      status: 'failure',
      object: savedFlavourInspections,
      errorMessage: e.message
    };
  }

  // save inspection record
  let savedInspection = null;

  try {
    savedInspection = await this.editMaster(args, res, next, incomingObj, flavourIds);
  } catch (e) {
    return {
      status: 'failure',
      object: savedInspection,
      errorMessage: e.message
    };
  }

  // update document roles
  let documentPromises = [];
  let savedDocuments = [];

  try {
    const isAnonymous = QueryUtils.isRecordAnonymous(savedInspection);

    if (isAnonymous) {
      savedInspection.documents.forEach(docId => {
        documentPromises.push(DocumentController.unpublishDocument(docId, args.swagger.params.auth_payload));
      });
    } else if (savedInspection) {
      savedInspection.documents.forEach(docId => {
        DocumentController.publishDocument(savedInspection._id, docId, args.swagger.params.auth_payload);
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
    object: savedInspection,
    flavours: savedFlavourInspections,
    documents: savedDocuments
  };
};

/**
 * Performs all operations necessary to edit a master Inspection record.
 *
 * Example of incomingObj
 *
 *  inspections: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'inspection',
 *      ...
 *      InspectionLNG: {
 *        description: 'lng description'
 *        addRole: 'public',
 *        ...
 *      },
 *      InspectionNRCED: {
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
 * @returns edited master inspection record
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

  const Inspection = mongoose.model('Inspection');

  const sanitizedObj = PutUtils.validateObjectAgainstModel(Inspection, incomingObj);

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

  return await Inspection.findOneAndUpdate({ _schemaName: 'Inspection', _id: _id }, updateObj, { new: true });
};

/**
 * Performs all operations necessary to edit a lng Inspection record.
 *
 * Example of incomingObj
 *
 *  inspections: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'inspection',
 *      ...
 *      InspectionLNG: {
 *        description: 'lng description'
 *        addRole: 'public',
 *        ...
 *      },
 *      InspectionNRCED: {
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
 * @returns edited lng inspection record
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

  let InspectionLNG = mongoose.model('InspectionLNG');

  const sanitizedObj = PutUtils.validateObjectAgainstModel(InspectionLNG, incomingObj);

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

  return await InspectionLNG.findOneAndUpdate({ _schemaName: 'InspectionLNG', _id: _id }, updateObj, { new: true });
};

/**
 * Performs all operations necessary to edit a nrced Inspection record.
 *
 * Example of incomingObj
 *
 *  inspections: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'inspection',
 *      ...
 *      InspectionLNG: {
 *        description: 'lng description'
 *        addRole: 'public',
 *        ...
 *      },
 *      InspectionNRCED: {
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
 * @returns edited nrced inspection record
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

  let InspectionNRCED = mongoose.model('InspectionNRCED');

  const sanitizedObj = PutUtils.validateObjectAgainstModel(InspectionNRCED, incomingObj);

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

  return await InspectionNRCED.findOneAndUpdate({ _schemaName: 'InspectionNRCED', _id: _id }, updateObj, { new: true });
};
