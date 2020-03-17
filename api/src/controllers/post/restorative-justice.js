let mongoose = require('mongoose');
let ObjectId = require('mongoose').Types.ObjectId;

/**
 * Performs all operations necessary to create a master Restorative Justice record and its associated flavour records.
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
exports.createRecord = async function(args, res, next, incomingObj) {
  // save flavour records
  let observables = [];
  let savedFlavourRestorativeJustices = [];
  let flavourIds = [];

  try {
    incomingObj.RestorativeJusticeLNG &&
      observables.push(this.createLNG(args, res, next, { ...incomingObj, ...incomingObj.RestorativeJusticeLNG }));
    incomingObj.RestorativeJusticeNRCED &&
      observables.push(this.createNRCED(args, res, next, { ...incomingObj, ...incomingObj.RestorativeJusticeNRCED }));

    if (observables.length > 0) {
      savedFlavourRestorativeJustices = await Promise.all(observables);

      flavourIds = savedFlavourRestorativeJustices.map(flavourRestorativeJustice => flavourRestorativeJustice._id);
    }
  } catch (e) {
    return {
      status: 'failure',
      object: savedFlavourRestorativeJustices,
      errorMessage: e
    };
  }

  // save restorativeJustice record
  let savedRestorativeJustice = null;

  try {
    savedRestorativeJustice = await this.createMaster(args, res, next, incomingObj, flavourIds);

    return {
      status: 'success',
      object: savedRestorativeJustice,
      flavours: savedFlavourRestorativeJustices
    };
  } catch (e) {
    return {
      status: 'failure',
      object: savedRestorativeJustice,
      errorMessage: e
    };
  }
};

/**
 * Performs all operations necessary to create a master Restorative Justice record.
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
 * @param {*} flavourIds array of flavour record _ids
 * @returns created master restorativeJustice record
 */
exports.createMaster = async function(args, res, next, incomingObj, flavourIds) {
  let RestorativeJustice = mongoose.model('RestorativeJustice');
  let restorativeJustice = new RestorativeJustice();

  restorativeJustice._schemaName = 'RestorativeJustice';

  // set integration references
  incomingObj._epicProjectId &&
    ObjectId.isValid(incomingObj._epicProjectId) &&
    (restorativeJustice._epicProjectId = new ObjectId(incomingObj._epicProjectId));
  incomingObj._sourceRefId &&
    ObjectId.isValid(incomingObj._sourceRefId) &&
    (restorativeJustice._sourceRefId = new ObjectId(incomingObj._sourceRefId));
  incomingObj._epicMilestoneId &&
    ObjectId.isValid(incomingObj._epicMilestoneId) &&
    (restorativeJustice._epicMilestoneId = new ObjectId(incomingObj._epicMilestoneId));

  // set permissions
  restorativeJustice.read = ['sysadmin'];
  restorativeJustice.write = ['sysadmin'];

  // set forward references
  if (flavourIds && flavourIds.length) {
    flavourIds.forEach(id => {
      if (ObjectId.isValid(id)) {
        restorativeJustice._flavourRecords.push(new ObjectId(id));
      }
    });
  }

  // set data
  incomingObj.recordName && (restorativeJustice.recordName = incomingObj.recordName);
  restorativeJustice.recordType = 'RestorativeJustice';
  incomingObj.dateIssued && (restorativeJustice.dateIssued = incomingObj.dateIssued);
  incomingObj.issuingAgency && (restorativeJustice.issuingAgency = incomingObj.issuingAgency);
  incomingObj.author && (restorativeJustice.author = incomingObj.author);
  incomingObj.legislation &&
    incomingObj.legislation.act &&
    (restorativeJustice.legislation.act = incomingObj.legislation.act);
  incomingObj.legislation &&
    incomingObj.legislation.regulation &&
    (restorativeJustice.legislation.regulation = incomingObj.legislation.regulation);
  incomingObj.legislation &&
    incomingObj.legislation.section &&
    (restorativeJustice.legislation.section = incomingObj.legislation.section);
  incomingObj.legislation &&
    incomingObj.legislation.subSection &&
    (restorativeJustice.legislation.subSection = incomingObj.legislation.subSection);
  incomingObj.legislation &&
    incomingObj.legislation.paragraph &&
    (restorativeJustice.legislation.paragraph = incomingObj.legislation.paragraph);
  incomingObj.issuedTo && (restorativeJustice.issuedTo = incomingObj.issuedTo);
  incomingObj.projectName && (restorativeJustice.projectName = incomingObj.projectName);
  incomingObj.location && (restorativeJustice.location = incomingObj.location);
  incomingObj.centroid && (restorativeJustice.centroid = incomingObj.centroid);
  incomingObj.outcomeStatus && (restorativeJustice.outcomeStatus = incomingObj.outcomeStatus);
  incomingObj.outcomeDescription && (restorativeJustice.outcomeDescription = incomingObj.outcomeDescription);
  incomingObj.penalty && (restorativeJustice.penalty = incomingObj.penalty);

  // set meta
  restorativeJustice.addedBy = args.swagger.params.auth_payload.displayName;
  restorativeJustice.dateAdded = new Date();

  // set data source references
  incomingObj.sourceDateAdded && (restorativeJustice.sourceDateAdded = incomingObj.sourceDateAdded);
  incomingObj.sourceDateUpdated && (restorativeJustice.sourceDateUpdated = incomingObj.sourceDateUpdated);
  incomingObj.sourceSystemRef && (restorativeJustice.sourceSystemRef = incomingObj.sourceSystemRef);

  return await restorativeJustice.save();
};

/**
 * Performs all operations necessary to create a LNG Restorative Justice record.
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
 * @returns created lng restorativeJustice record
 */
exports.createLNG = async function(args, res, next, incomingObj) {
  let RestorativeJusticeLNG = mongoose.model('RestorativeJusticeLNG');
  let restorativeJusticeLNG = new RestorativeJusticeLNG();

  restorativeJusticeLNG._schemaName = 'RestorativeJusticeLNG';

  // set integration references
  incomingObj._epicProjectId &&
    ObjectId.isValid(incomingObj._epicProjectId) &&
    (restorativeJusticeLNG._epicProjectId = new ObjectId(incomingObj._epicProjectId));
  incomingObj._sourceRefId &&
    ObjectId.isValid(incomingObj._sourceRefId) &&
    (restorativeJusticeLNG._sourceRefId = new ObjectId(incomingObj._sourceRefId));
  incomingObj._epicMilestoneId &&
    ObjectId.isValid(incomingObj._epicMilestoneId) &&
    (restorativeJusticeLNG._epicMilestoneId = new ObjectId(incomingObj._epicMilestoneId));

  // set permissions and meta
  restorativeJusticeLNG.read = ['sysadmin'];
  restorativeJusticeLNG.write = ['sysadmin'];

  // If incoming object has addRole: 'public' then read will look like ['sysadmin', 'public']
  if (incomingObj.addRole && incomingObj.addRole === 'public') {
    restorativeJusticeLNG.read.push('public');
    restorativeJusticeLNG.datePublished = new Date();
    restorativeJusticeLNG.publishedBy = args.swagger.params.auth_payload.displayName;
  }

  restorativeJusticeLNG.addedBy = args.swagger.params.auth_payload.displayName;
  restorativeJusticeLNG.dateAdded = new Date();

  // set master data
  incomingObj.recordName && (restorativeJusticeLNG.recordName = incomingObj.recordName);
  restorativeJusticeLNG.recordType = 'RestorativeJustice';
  incomingObj.dateIssued && (restorativeJusticeLNG.dateIssued = incomingObj.dateIssued);
  incomingObj.issuingAgency && (restorativeJusticeLNG.issuingAgency = incomingObj.issuingAgency);
  incomingObj.author && (restorativeJusticeLNG.author = incomingObj.author);
  incomingObj.legislation &&
    incomingObj.legislation.act &&
    (restorativeJusticeLNG.legislation.act = incomingObj.legislation.act);
  incomingObj.legislation &&
    incomingObj.legislation.regulation &&
    (restorativeJusticeLNG.legislation.regulation = incomingObj.legislation.regulation);
  incomingObj.legislation &&
    incomingObj.legislation.section &&
    (restorativeJusticeLNG.legislation.section = incomingObj.legislation.section);
  incomingObj.legislation &&
    incomingObj.legislation.subSection &&
    (restorativeJusticeLNG.legislation.subSection = incomingObj.legislation.subSection);
  incomingObj.legislation &&
    incomingObj.legislation.paragraph &&
    (restorativeJusticeLNG.legislation.paragraph = incomingObj.legislation.paragraph);
  incomingObj.issuedTo && (restorativeJusticeLNG.issuedTo = incomingObj.issuedTo);
  incomingObj.projectName && (restorativeJusticeLNG.projectName = incomingObj.projectName);
  incomingObj.location && (restorativeJusticeLNG.location = incomingObj.location);
  incomingObj.centroid && (restorativeJusticeLNG.centroid = incomingObj.centroid);
  incomingObj.outcomeStatus && (restorativeJusticeLNG.outcomeStatus = incomingObj.outcomeStatus);
  incomingObj.outcomeDescription && (restorativeJusticeLNG.outcomeDescription = incomingObj.outcomeDescription);
  incomingObj.penalty && (restorativeJusticeLNG.penalty = incomingObj.penalty);

  // set flavour data
  incomingObj.description && (restorativeJusticeLNG.description = incomingObj.description);

  // set data source references
  incomingObj.sourceDateAdded && (restorativeJusticeLNG.sourceDateAdded = incomingObj.sourceDateAdded);
  incomingObj.sourceDateUpdated && (restorativeJusticeLNG.sourceDateUpdated = incomingObj.sourceDateUpdated);
  incomingObj.sourceSystemRef && (restorativeJusticeLNG.sourceSystemRef = incomingObj.sourceSystemRef);

  return await restorativeJusticeLNG.save();
};

/**
 * Performs all operations necessary to create a NRCED Restorative Justice record.
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
 * @returns created nrced restorativeJustice record
 */
exports.createNRCED = async function(args, res, next, incomingObj) {
  let RestorativeJusticeNRCED = mongoose.model('RestorativeJusticeNRCED');
  let restorativeJusticeNRCED = new RestorativeJusticeNRCED();

  restorativeJusticeNRCED._schemaName = 'RestorativeJusticeNRCED';

  // set integration references
  incomingObj._epicProjectId &&
    ObjectId.isValid(incomingObj._epicProjectId) &&
    (restorativeJusticeNRCED._epicProjectId = new ObjectId(incomingObj._epicProjectId));
  incomingObj._sourceRefId &&
    ObjectId.isValid(incomingObj._sourceRefId) &&
    (restorativeJusticeNRCED._sourceRefId = new ObjectId(incomingObj._sourceRefId));
  incomingObj._epicMilestoneId &&
    ObjectId.isValid(incomingObj._epicMilestoneId) &&
    (restorativeJusticeNRCED._epicMilestoneId = new ObjectId(incomingObj._epicMilestoneId));

  // set permissions and meta
  restorativeJusticeNRCED.read = ['sysadmin'];
  restorativeJusticeNRCED.write = ['sysadmin'];

  // If incoming object has addRole: 'public' then read will look like ['sysadmin', 'public']
  if (incomingObj.addRole && incomingObj.addRole === 'public') {
    restorativeJusticeNRCED.read.push('public');
    restorativeJusticeNRCED.datePublished = new Date();
    restorativeJusticeNRCED.publishedBy = args.swagger.params.auth_payload.displayName;
  }

  restorativeJusticeNRCED.addedBy = args.swagger.params.auth_payload.displayName;
  restorativeJusticeNRCED.dateAdded = new Date();

  // set master data
  incomingObj.recordName && (restorativeJusticeNRCED.recordName = incomingObj.recordName);
  restorativeJusticeNRCED.recordType = 'RestorativeJustice';
  incomingObj.dateIssued && (restorativeJusticeNRCED.dateIssued = incomingObj.dateIssued);
  incomingObj.issuingAgency && (restorativeJusticeNRCED.issuingAgency = incomingObj.issuingAgency);
  incomingObj.author && (restorativeJusticeNRCED.author = incomingObj.author);
  incomingObj.legislation &&
    incomingObj.legislation.act &&
    (restorativeJusticeNRCED.legislation.act = incomingObj.legislation.act);
  incomingObj.legislation &&
    incomingObj.legislation.regulation &&
    (restorativeJusticeNRCED.legislation.regulation = incomingObj.legislation.regulation);
  incomingObj.legislation &&
    incomingObj.legislation.section &&
    (restorativeJusticeNRCED.legislation.section = incomingObj.legislation.section);
  incomingObj.legislation &&
    incomingObj.legislation.subSection &&
    (restorativeJusticeNRCED.legislation.subSection = incomingObj.legislation.subSection);
  incomingObj.legislation &&
    incomingObj.legislation.paragraph &&
    (restorativeJusticeNRCED.legislation.paragraph = incomingObj.legislation.paragraph);
  incomingObj.issuedTo && (restorativeJusticeNRCED.issuedTo = incomingObj.issuedTo);
  incomingObj.projectName && (restorativeJusticeNRCED.projectName = incomingObj.projectName);
  incomingObj.location && (restorativeJusticeNRCED.location = incomingObj.location);
  incomingObj.centroid && (restorativeJusticeNRCED.centroid = incomingObj.centroid);
  incomingObj.outcomeStatus && (restorativeJusticeNRCED.outcomeStatus = incomingObj.outcomeStatus);
  incomingObj.outcomeDescription && (restorativeJusticeNRCED.outcomeDescription = incomingObj.outcomeDescription);
  incomingObj.penalty && (restorativeJusticeNRCED.penalty = incomingObj.penalty);

  // set flavour data
  incomingObj.summary && (restorativeJusticeNRCED.summary = incomingObj.summary);

  // set data source references
  incomingObj.sourceDateAdded && (restorativeJusticeNRCED.sourceDateAdded = incomingObj.sourceDateAdded);
  incomingObj.sourceDateUpdated && (restorativeJusticeNRCED.sourceDateUpdated = incomingObj.sourceDateUpdated);
  incomingObj.sourceSystemRef && (restorativeJusticeNRCED.sourceSystemRef = incomingObj.sourceSystemRef);

  return await restorativeJusticeNRCED.save();
};
