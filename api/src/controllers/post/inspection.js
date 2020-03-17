let mongoose = require('mongoose');
let ObjectId = require('mongoose').Types.ObjectId;

/**
 * Performs all operations necessary to create a master Inspection record and its associated flavour records.
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
exports.createRecord = async function(args, res, next, incomingObj) {
  // save flavour records
  let observables = [];
  let savedFlavourInspections = [];
  let flavourIds = [];

  try {
    incomingObj.InspectionLNG &&
      observables.push(this.createLNG(args, res, next, { ...incomingObj, ...incomingObj.InspectionLNG }));
    incomingObj.InspectionNRCED &&
      observables.push(this.createNRCED(args, res, next, { ...incomingObj, ...incomingObj.InspectionNRCED }));

    if (observables.length > 0) {
      savedFlavourInspections = await Promise.all(observables);

      flavourIds = savedFlavourInspections.map(flavourInspection => flavourInspection._id);
    }
  } catch (e) {
    return {
      status: 'failure',
      object: savedFlavourInspections,
      errorMessage: e
    };
  }

  // save inspection record
  let savedInspection = null;

  try {
    savedInspection = await this.createMaster(args, res, next, incomingObj, flavourIds);

    return {
      status: 'success',
      object: savedInspection,
      flavours: savedFlavourInspections
    };
  } catch (e) {
    return {
      status: 'failure',
      object: savedInspection,
      errorMessage: e
    };
  }
};

/**
 * Performs all operations necessary to create a master Inspection record.
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
 * @param {*} flavourIds array of flavour record _ids
 * @returns created master inspection record
 */
exports.createMaster = async function(args, res, next, incomingObj, flavourIds) {
  let Inspection = mongoose.model('Inspection');
  let inspection = new Inspection();

  inspection._schemaName = 'Inspection';

  // set integration references
  incomingObj._epicProjectId &&
    ObjectId.isValid(incomingObj._epicProjectId) &&
    (inspection._epicProjectId = new ObjectId(incomingObj._epicProjectId));
  incomingObj._sourceRefId &&
    ObjectId.isValid(incomingObj._sourceRefId) &&
    (inspection._sourceRefId = new ObjectId(incomingObj._sourceRefId));
  incomingObj._epicMilestoneId &&
    ObjectId.isValid(incomingObj._epicMilestoneId) &&
    (inspection._epicMilestoneId = new ObjectId(incomingObj._epicMilestoneId));

  // set permissions
  inspection.read = ['sysadmin'];
  inspection.write = ['sysadmin'];

  // set forward references
  if (flavourIds && flavourIds.length) {
    flavourIds.forEach(id => {
      if (ObjectId.isValid(id)) {
        inspection._flavourRecords.push(new ObjectId(id));
      }
    });
  }

  // set data
  incomingObj.recordName && (inspection.recordName = incomingObj.recordName);
  inspection.recordType = 'Inspection';
  incomingObj.dateIssued && (inspection.dateIssued = incomingObj.dateIssued);
  incomingObj.issuingAgency && (inspection.issuingAgency = incomingObj.issuingAgency);
  incomingObj.author && (inspection.author = incomingObj.author);
  incomingObj.legislation && incomingObj.legislation.act && (inspection.legislation.act = incomingObj.legislation.act);
  incomingObj.legislation &&
    incomingObj.legislation.regulation &&
    (inspection.legislation.regulation = incomingObj.legislation.regulation);
  incomingObj.legislation &&
    incomingObj.legislation.section &&
    (inspection.legislation.section = incomingObj.legislation.section);
  incomingObj.legislation &&
    incomingObj.legislation.subSection &&
    (inspection.legislation.subSection = incomingObj.legislation.subSection);
  incomingObj.legislation &&
    incomingObj.legislation.paragraph &&
    (inspection.legislation.paragraph = incomingObj.legislation.paragraph);
  incomingObj.issuedTo && (inspection.issuedTo = incomingObj.issuedTo);
  incomingObj.projectName && (inspection.projectName = incomingObj.projectName);
  incomingObj.location && (inspection.location = incomingObj.location);
  incomingObj.centroid && (inspection.centroid = incomingObj.centroid);
  incomingObj.outcomeStatus && (inspection.outcomeStatus = incomingObj.outcomeStatus);
  incomingObj.outcomeDescription && (inspection.outcomeDescription = incomingObj.outcomeDescription);

  // set meta
  inspection.addedBy = args.swagger.params.auth_payload.displayName;
  inspection.dateAdded = new Date();

  // set data source references
  incomingObj.sourceDateAdded && (inspection.sourceDateAdded = incomingObj.sourceDateAdded);
  incomingObj.sourceDateUpdated && (inspection.sourceDateUpdated = incomingObj.sourceDateUpdated);
  incomingObj.sourceSystemRef && (inspection.sourceSystemRef = incomingObj.sourceSystemRef);

  return await inspection.save();
};

/**
 * Performs all operations necessary to create a LNG Inspection record.
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
 * @returns created lng inspection record
 */
exports.createLNG = async function(args, res, next, incomingObj) {
  let InspectionLNG = mongoose.model('InspectionLNG');
  let inspectionLNG = new InspectionLNG();

  inspectionLNG._schemaName = 'InspectionLNG';

  // set integration references
  incomingObj._epicProjectId &&
    ObjectId.isValid(incomingObj._epicProjectId) &&
    (inspectionLNG._epicProjectId = new ObjectId(incomingObj._epicProjectId));
  incomingObj._sourceRefId &&
    ObjectId.isValid(incomingObj._sourceRefId) &&
    (inspectionLNG._sourceRefId = new ObjectId(incomingObj._sourceRefId));
  incomingObj._epicMilestoneId &&
    ObjectId.isValid(incomingObj._epicMilestoneId) &&
    (inspectionLNG._epicMilestoneId = new ObjectId(incomingObj._epicMilestoneId));

  // set permissions and meta
  inspectionLNG.read = ['sysadmin'];
  inspectionLNG.write = ['sysadmin'];

  // If incoming object has addRole: 'public' then read will look like ['sysadmin', 'public']
  if (incomingObj.addRole && incomingObj.addRole === 'public') {
    inspectionLNG.read.push('public');
    inspectionLNG.datePublished = new Date();
    inspectionLNG.publishedBy = args.swagger.params.auth_payload.displayName;
  }

  inspectionLNG.addedBy = args.swagger.params.auth_payload.displayName;
  inspectionLNG.dateAdded = new Date();

  // set master data
  incomingObj.recordName && (inspectionLNG.recordName = incomingObj.recordName);
  inspectionLNG.recordType = 'Inspection';
  incomingObj.dateIssued && (inspectionLNG.dateIssued = incomingObj.dateIssued);
  incomingObj.issuingAgency && (inspectionLNG.issuingAgency = incomingObj.issuingAgency);
  incomingObj.author && (inspectionLNG.author = incomingObj.author);
  incomingObj.legislation &&
    incomingObj.legislation.act &&
    (inspectionLNG.legislation.act = incomingObj.legislation.act);
  incomingObj.legislation &&
    incomingObj.legislation.regulation &&
    (inspectionLNG.legislation.regulation = incomingObj.legislation.regulation);
  incomingObj.legislation &&
    incomingObj.legislation.section &&
    (inspectionLNG.legislation.section = incomingObj.legislation.section);
  incomingObj.legislation &&
    incomingObj.legislation.subSection &&
    (inspectionLNG.legislation.subSection = incomingObj.legislation.subSection);
  incomingObj.legislation &&
    incomingObj.legislation.paragraph &&
    (inspectionLNG.legislation.paragraph = incomingObj.legislation.paragraph);
  incomingObj.issuedTo && (inspectionLNG.issuedTo = incomingObj.issuedTo);
  incomingObj.projectName && (inspectionLNG.projectName = incomingObj.projectName);
  incomingObj.location && (inspectionLNG.location = incomingObj.location);
  incomingObj.centroid && (inspectionLNG.centroid = incomingObj.centroid);
  incomingObj.outcomeStatus && (inspectionLNG.outcomeStatus = incomingObj.outcomeStatus);
  incomingObj.outcomeDescription && (inspectionLNG.outcomeDescription = incomingObj.outcomeDescription);

  // set flavour data
  incomingObj.description && (inspectionLNG.description = incomingObj.description);

  // set data source references
  incomingObj.sourceDateAdded && (inspectionLNG.sourceDateAdded = incomingObj.sourceDateAdded);
  incomingObj.sourceDateUpdated && (inspectionLNG.sourceDateUpdated = incomingObj.sourceDateUpdated);
  incomingObj.sourceSystemRef && (inspectionLNG.sourceSystemRef = incomingObj.sourceSystemRef);

  return await inspectionLNG.save();
};

/**
 * Performs all operations necessary to create a NRCED Inspection record.
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
 * @returns created nrced inspection record
 */
exports.createNRCED = async function(args, res, next, incomingObj) {
  let InspectionNRCED = mongoose.model('InspectionNRCED');
  let inspectionNRCED = new InspectionNRCED();

  inspectionNRCED._schemaName = 'InspectionNRCED';

  // set integration references
  incomingObj._epicProjectId &&
    ObjectId.isValid(incomingObj._epicProjectId) &&
    (inspectionNRCED._epicProjectId = new ObjectId(incomingObj._epicProjectId));
  incomingObj._sourceRefId &&
    ObjectId.isValid(incomingObj._sourceRefId) &&
    (inspectionNRCED._sourceRefId = new ObjectId(incomingObj._sourceRefId));
  incomingObj._epicMilestoneId &&
    ObjectId.isValid(incomingObj._epicMilestoneId) &&
    (inspectionNRCED._epicMilestoneId = new ObjectId(incomingObj._epicMilestoneId));

  // set permissions and meta
  inspectionNRCED.read = ['sysadmin'];
  inspectionNRCED.write = ['sysadmin'];

  // If incoming object has addRole: 'public' then read will look like ['sysadmin', 'public']
  if (incomingObj.addRole && incomingObj.addRole === 'public') {
    inspectionNRCED.read.push('public');
    inspectionNRCED.datePublished = new Date();
    inspectionNRCED.publishedBy = args.swagger.params.auth_payload.displayName;
  }

  inspectionNRCED.addedBy = args.swagger.params.auth_payload.displayName;
  inspectionNRCED.dateAdded = new Date();

  // set master data
  incomingObj.recordName && (inspectionNRCED.recordName = incomingObj.recordName);
  inspectionNRCED.recordType = 'Inspection';
  incomingObj.dateIssued && (inspectionNRCED.dateIssued = incomingObj.dateIssued);
  incomingObj.issuingAgency && (inspectionNRCED.issuingAgency = incomingObj.issuingAgency);
  incomingObj.author && (inspectionNRCED.author = incomingObj.author);
  incomingObj.legislation &&
    incomingObj.legislation.act &&
    (inspectionNRCED.legislation.act = incomingObj.legislation.act);
  incomingObj.legislation &&
    incomingObj.legislation.regulation &&
    (inspectionNRCED.legislation.regulation = incomingObj.legislation.regulation);
  incomingObj.legislation &&
    incomingObj.legislation.section &&
    (inspectionNRCED.legislation.section = incomingObj.legislation.section);
  incomingObj.legislation &&
    incomingObj.legislation.subSection &&
    (inspectionNRCED.legislation.subSection = incomingObj.legislation.subSection);
  incomingObj.legislation &&
    incomingObj.legislation.paragraph &&
    (inspectionNRCED.legislation.paragraph = incomingObj.legislation.paragraph);
  incomingObj.issuedTo && (inspectionNRCED.issuedTo = incomingObj.issuedTo);
  incomingObj.projectName && (inspectionNRCED.projectName = incomingObj.projectName);
  incomingObj.location && (inspectionNRCED.location = incomingObj.location);
  incomingObj.centroid && (inspectionNRCED.centroid = incomingObj.centroid);
  incomingObj.outcomeStatus && (inspectionNRCED.outcomeStatus = incomingObj.outcomeStatus);
  incomingObj.outcomeDescription && (inspectionNRCED.outcomeDescription = incomingObj.outcomeDescription);

  // set flavour data
  incomingObj.summary && (inspectionNRCED.summary = incomingObj.summary);

  // set data source references
  incomingObj.sourceDateAdded && (inspectionNRCED.sourceDateAdded = incomingObj.sourceDateAdded);
  incomingObj.sourceDateUpdated && (inspectionNRCED.sourceDateUpdated = incomingObj.sourceDateUpdated);
  incomingObj.sourceSystemRef && (inspectionNRCED.sourceSystemRef = incomingObj.sourceSystemRef);

  return await inspectionNRCED.save();
};
