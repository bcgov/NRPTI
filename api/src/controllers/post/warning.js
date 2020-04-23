let mongoose = require('mongoose');
let ObjectId = require('mongoose').Types.ObjectId;
let queryUtils = require('../../utils/query-utils');
let postUtils = require('../../utils/post-utils');

/**
 * Performs all operations necessary to create a master Warning record and its associated flavour records.
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
exports.createRecord = async function(args, res, next, incomingObj) {
  // save flavour records
  let observables = [];
  let savedFlavourWarnings = [];
  let flavourIds = [];

  try {
    incomingObj.WarningLNG &&
      observables.push(this.createLNG(args, res, next, { ...incomingObj, ...incomingObj.WarningLNG }));
    incomingObj.WarningNRCED &&
      observables.push(this.createNRCED(args, res, next, { ...incomingObj, ...incomingObj.WarningNRCED }));

    if (observables.length > 0) {
      savedFlavourWarnings = await Promise.all(observables);

      flavourIds = savedFlavourWarnings.map(flavourWarning => flavourWarning._id);
    }
  } catch (e) {
    return {
      status: 'failure',
      object: savedFlavourWarnings,
      errorMessage: e.message
    };
  }

  // save warning record
  let savedWarning = null;

  try {
    savedWarning = await this.createMaster(args, res, next, incomingObj, flavourIds);

    return {
      status: 'success',
      object: savedWarning,
      flavours: savedFlavourWarnings
    };
  } catch (e) {
    return {
      status: 'failure',
      object: savedWarning,
      errorMessage: e.message
    };
  }
};

/**
 * Performs all operations necessary to create a master Warning record.
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
 * @param {*} flavourIds array of flavour record _ids
 * @returns created master warning record
 */
exports.createMaster = async function(args, res, next, incomingObj, flavourIds) {
  let Warning = mongoose.model('Warning');
  let warning = new Warning();

  warning._schemaName = 'Warning';

  // set integration references
  incomingObj._epicProjectId &&
    ObjectId.isValid(incomingObj._epicProjectId) &&
    (warning._epicProjectId = new ObjectId(incomingObj._epicProjectId));
  incomingObj._sourceRefId &&
    ObjectId.isValid(incomingObj._sourceRefId) &&
    (warning._sourceRefId = new ObjectId(incomingObj._sourceRefId));
  incomingObj._epicMilestoneId &&
    ObjectId.isValid(incomingObj._epicMilestoneId) &&
    (warning._epicMilestoneId = new ObjectId(incomingObj._epicMilestoneId));

  // set permissions
  warning.read = ['sysadmin'];
  warning.write = ['sysadmin'];

  // set forward references
  if (flavourIds && flavourIds.length) {
    flavourIds.forEach(id => {
      if (ObjectId.isValid(id)) {
        warning._flavourRecords.push(new ObjectId(id));
      }
    });
  }

  // set data
  incomingObj.recordName && (warning.recordName = incomingObj.recordName);
  warning.recordType = 'Warning';
  incomingObj.recordSubtype && (warning.recordSubtype = incomingObj.recordSubtype);
  incomingObj.dateIssued && (warning.dateIssued = incomingObj.dateIssued);
  incomingObj.issuingAgency && (warning.issuingAgency = incomingObj.issuingAgency);
  incomingObj.author && (warning.author = incomingObj.author);

  incomingObj.legislation && incomingObj.legislation.act && (warning.legislation.act = incomingObj.legislation.act);
  incomingObj.legislation &&
    incomingObj.legislation.regulation &&
    (warning.legislation.regulation = incomingObj.legislation.regulation);
  incomingObj.legislation &&
    incomingObj.legislation.section &&
    (warning.legislation.section = incomingObj.legislation.section);
  incomingObj.legislation &&
    incomingObj.legislation.subSection &&
    (warning.legislation.subSection = incomingObj.legislation.subSection);
  incomingObj.legislation &&
    incomingObj.legislation.paragraph &&
    (warning.legislation.paragraph = incomingObj.legislation.paragraph);

  incomingObj.legislationDescription && (warning.legislationDescription = incomingObj.legislationDescription);

  warning.issuedTo.read = ['sysadmin'];
  warning.issuedTo.write = ['sysadmin'];
  incomingObj.issuedTo && incomingObj.issuedTo.type && (warning.issuedTo.type = incomingObj.issuedTo.type);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.companyName &&
    (warning.issuedTo.companyName = incomingObj.issuedTo.companyName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.firstName &&
    (warning.issuedTo.firstName = incomingObj.issuedTo.firstName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.middleName &&
    (warning.issuedTo.middleName = incomingObj.issuedTo.middleName);
  incomingObj.issuedTo && incomingObj.issuedTo.lastName && (warning.issuedTo.lastName = incomingObj.issuedTo.lastName);
  incomingObj.issuedTo && (warning.issuedTo.fullName = postUtils.getIssuedToFullNameValue(incomingObj.issuedTo));
  incomingObj.issuedTo &&
    incomingObj.issuedTo.dateOfBirth &&
    (warning.issuedTo.dateOfBirth = incomingObj.issuedTo.dateOfBirth);

  incomingObj.projectName && (warning.projectName = incomingObj.projectName);
  incomingObj.location && (warning.location = incomingObj.location);
  incomingObj.centroid && (warning.centroid = incomingObj.centroid);
  incomingObj.outcomeStatus && (warning.outcomeStatus = incomingObj.outcomeStatus);
  incomingObj.outcomeDescription && (warning.outcomeDescription = incomingObj.outcomeDescription);
  incomingObj.documents && (warning.documents = incomingObj.documents);

  // set meta
  warning.addedBy = args.swagger.params.auth_payload.displayName;
  warning.dateAdded = new Date();

  // set data source references
  incomingObj.sourceDateAdded && (warning.sourceDateAdded = incomingObj.sourceDateAdded);
  incomingObj.sourceDateUpdated && (warning.sourceDateUpdated = incomingObj.sourceDateUpdated);
  incomingObj.sourceSystemRef && (warning.sourceSystemRef = incomingObj.sourceSystemRef);

  // set issuedTo sub-object read roles
  if (!queryUtils.isRecordConsideredAnonymous(warning)) {
    warning.issuedTo.read.push('public');
  }

  return await warning.save();
};

/**
 * Performs all operations necessary to create a LNG Warning record.
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
 * @returns created lng warning record
 */
exports.createLNG = async function(args, res, next, incomingObj) {
  let WarningLNG = mongoose.model('WarningLNG');
  let warningLNG = new WarningLNG();

  warningLNG._schemaName = 'WarningLNG';

  // set integration references
  incomingObj._epicProjectId &&
    ObjectId.isValid(incomingObj._epicProjectId) &&
    (warningLNG._epicProjectId = new ObjectId(incomingObj._epicProjectId));
  incomingObj._sourceRefId &&
    ObjectId.isValid(incomingObj._sourceRefId) &&
    (warningLNG._sourceRefId = new ObjectId(incomingObj._sourceRefId));
  incomingObj._epicMilestoneId &&
    ObjectId.isValid(incomingObj._epicMilestoneId) &&
    (warningLNG._epicMilestoneId = new ObjectId(incomingObj._epicMilestoneId));

  // set permissions and meta
  warningLNG.read = ['sysadmin'];
  warningLNG.write = ['sysadmin'];

  warningLNG.addedBy = args.swagger.params.auth_payload.displayName;
  warningLNG.dateAdded = new Date();

  // set master data
  incomingObj.recordName && (warningLNG.recordName = incomingObj.recordName);
  warningLNG.recordType = 'Warning';
  incomingObj.recordSubtype && (warningLNG.recordSubtype = incomingObj.recordSubtype);
  incomingObj.dateIssued && (warningLNG.dateIssued = incomingObj.dateIssued);
  incomingObj.issuingAgency && (warningLNG.issuingAgency = incomingObj.issuingAgency);
  incomingObj.author && (warningLNG.author = incomingObj.author);

  incomingObj.legislation && incomingObj.legislation.act && (warningLNG.legislation.act = incomingObj.legislation.act);
  incomingObj.legislation &&
    incomingObj.legislation.regulation &&
    (warningLNG.legislation.regulation = incomingObj.legislation.regulation);
  incomingObj.legislation &&
    incomingObj.legislation.section &&
    (warningLNG.legislation.section = incomingObj.legislation.section);
  incomingObj.legislation &&
    incomingObj.legislation.subSection &&
    (warningLNG.legislation.subSection = incomingObj.legislation.subSection);
  incomingObj.legislation &&
    incomingObj.legislation.paragraph &&
    (warningLNG.legislation.paragraph = incomingObj.legislation.paragraph);

  incomingObj.legislationDescription && (warningLNG.legislationDescription = incomingObj.legislationDescription);

  warningLNG.issuedTo.read = ['sysadmin'];
  warningLNG.issuedTo.write = ['sysadmin'];
  incomingObj.issuedTo && incomingObj.issuedTo.type && (warningLNG.issuedTo.type = incomingObj.issuedTo.type);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.companyName &&
    (warningLNG.issuedTo.companyName = incomingObj.issuedTo.companyName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.firstName &&
    (warningLNG.issuedTo.firstName = incomingObj.issuedTo.firstName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.middleName &&
    (warningLNG.issuedTo.middleName = incomingObj.issuedTo.middleName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.lastName &&
    (warningLNG.issuedTo.lastName = incomingObj.issuedTo.lastName);
  incomingObj.issuedTo && (warningLNG.issuedTo.fullName = postUtils.getIssuedToFullNameValue(incomingObj.issuedTo));
  incomingObj.issuedTo &&
    incomingObj.issuedTo.dateOfBirth &&
    (warningLNG.issuedTo.dateOfBirth = incomingObj.issuedTo.dateOfBirth);

  incomingObj.projectName && (warningLNG.projectName = incomingObj.projectName);
  incomingObj.location && (warningLNG.location = incomingObj.location);
  incomingObj.centroid && (warningLNG.centroid = incomingObj.centroid);
  incomingObj.outcomeStatus && (warningLNG.outcomeStatus = incomingObj.outcomeStatus);
  incomingObj.outcomeDescription && (warningLNG.outcomeDescription = incomingObj.outcomeDescription);
  incomingObj.documents && (warningLNG.documents = incomingObj.documents);

  // set flavour data
  incomingObj.description && (warningLNG.description = incomingObj.description);

  // set data source references
  incomingObj.sourceDateAdded && (warningLNG.sourceDateAdded = incomingObj.sourceDateAdded);
  incomingObj.sourceDateUpdated && (warningLNG.sourceDateUpdated = incomingObj.sourceDateUpdated);
  incomingObj.sourceSystemRef && (warningLNG.sourceSystemRef = incomingObj.sourceSystemRef);

  // If incoming object has addRole: 'public' then read will look like ['sysadmin', 'public']
  if (incomingObj.addRole && incomingObj.addRole === 'public') {
    warningLNG.read.push('public');
    warningLNG.datePublished = new Date();
    warningLNG.publishedBy = args.swagger.params.auth_payload.displayName;
  }

  // set issuedTo sub-object read roles
  if (!queryUtils.isRecordConsideredAnonymous(warningLNG)) {
    warningLNG.issuedTo.read.push('public');
  }

  return await warningLNG.save();
};

/**
 * Performs all operations necessary to create a NRCED Warning record.
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
 * @returns created nrced warning record
 */
exports.createNRCED = async function(args, res, next, incomingObj) {
  let WarningNRCED = mongoose.model('WarningNRCED');
  let warningNRCED = new WarningNRCED();

  warningNRCED._schemaName = 'WarningNRCED';

  // set integration references
  incomingObj._epicProjectId &&
    ObjectId.isValid(incomingObj._epicProjectId) &&
    (warningNRCED._epicProjectId = new ObjectId(incomingObj._epicProjectId));
  incomingObj._sourceRefId &&
    ObjectId.isValid(incomingObj._sourceRefId) &&
    (warningNRCED._sourceRefId = new ObjectId(incomingObj._sourceRefId));
  incomingObj._epicMilestoneId &&
    ObjectId.isValid(incomingObj._epicMilestoneId) &&
    (warningNRCED._epicMilestoneId = new ObjectId(incomingObj._epicMilestoneId));

  // set permissions and meta
  warningNRCED.read = ['sysadmin'];
  warningNRCED.write = ['sysadmin'];

  warningNRCED.addedBy = args.swagger.params.auth_payload.displayName;
  warningNRCED.dateAdded = new Date();

  // set master data
  incomingObj.recordName && (warningNRCED.recordName = incomingObj.recordName);
  warningNRCED.recordType = 'Warning';
  incomingObj.recordSubtype && (warningNRCED.recordSubtype = incomingObj.recordSubtype);
  incomingObj.dateIssued && (warningNRCED.dateIssued = incomingObj.dateIssued);
  incomingObj.issuingAgency && (warningNRCED.issuingAgency = incomingObj.issuingAgency);
  incomingObj.author && (warningNRCED.author = incomingObj.author);

  incomingObj.legislation &&
    incomingObj.legislation.act &&
    (warningNRCED.legislation.act = incomingObj.legislation.act);
  incomingObj.legislation &&
    incomingObj.legislation.regulation &&
    (warningNRCED.legislation.regulation = incomingObj.legislation.regulation);
  incomingObj.legislation &&
    incomingObj.legislation.section &&
    (warningNRCED.legislation.section = incomingObj.legislation.section);
  incomingObj.legislation &&
    incomingObj.legislation.subSection &&
    (warningNRCED.legislation.subSection = incomingObj.legislation.subSection);
  incomingObj.legislation &&
    incomingObj.legislation.paragraph &&
    (warningNRCED.legislation.paragraph = incomingObj.legislation.paragraph);

  incomingObj.legislationDescription && (warningNRCED.legislationDescription = incomingObj.legislationDescription);

  warningNRCED.issuedTo.read = ['sysadmin'];
  warningNRCED.issuedTo.write = ['sysadmin'];
  incomingObj.issuedTo && incomingObj.issuedTo.type && (warningNRCED.issuedTo.type = incomingObj.issuedTo.type);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.companyName &&
    (warningNRCED.issuedTo.companyName = incomingObj.issuedTo.companyName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.firstName &&
    (warningNRCED.issuedTo.firstName = incomingObj.issuedTo.firstName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.middleName &&
    (warningNRCED.issuedTo.middleName = incomingObj.issuedTo.middleName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.lastName &&
    (warningNRCED.issuedTo.lastName = incomingObj.issuedTo.lastName);
  incomingObj.issuedTo && (warningNRCED.issuedTo.fullName = postUtils.getIssuedToFullNameValue(incomingObj.issuedTo));
  incomingObj.issuedTo &&
    incomingObj.issuedTo.dateOfBirth &&
    (warningNRCED.issuedTo.dateOfBirth = incomingObj.issuedTo.dateOfBirth);

  incomingObj.projectName && (warningNRCED.projectName = incomingObj.projectName);
  incomingObj.location && (warningNRCED.location = incomingObj.location);
  incomingObj.centroid && (warningNRCED.centroid = incomingObj.centroid);
  incomingObj.outcomeStatus && (warningNRCED.outcomeStatus = incomingObj.outcomeStatus);
  incomingObj.outcomeDescription && (warningNRCED.outcomeDescription = incomingObj.outcomeDescription);
  incomingObj.documents && (warningNRCED.documents = incomingObj.documents);

  // set flavour data
  incomingObj.summary && (warningNRCED.summary = incomingObj.summary);

  // set data source references
  incomingObj.sourceDateAdded && (warningNRCED.sourceDateAdded = incomingObj.sourceDateAdded);
  incomingObj.sourceDateUpdated && (warningNRCED.sourceDateUpdated = incomingObj.sourceDateUpdated);
  incomingObj.sourceSystemRef && (warningNRCED.sourceSystemRef = incomingObj.sourceSystemRef);

  // If incoming object has addRole: 'public' then read will look like ['sysadmin', 'public']
  if (incomingObj.addRole && incomingObj.addRole === 'public') {
    warningNRCED.read.push('public');
    warningNRCED.datePublished = new Date();
    warningNRCED.publishedBy = args.swagger.params.auth_payload.displayName;
  }

  // set issuedTo sub-object read roles
  if (!queryUtils.isRecordConsideredAnonymous(warningNRCED)) {
    warningNRCED.issuedTo.read.push('public');
  }

  return await warningNRCED.save();
};
