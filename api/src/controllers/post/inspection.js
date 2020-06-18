const mongoose = require('mongoose');
const ObjectId = require('mongoose').Types.ObjectId;
const postUtils = require('../../utils/post-utils');
const BusinessLogicManager = require('../../utils/business-logic-manager');
const { userHasValidRoles } = require('../../utils/auth-utils');
const { ROLES } = require('../../utils/constants/misc');

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
exports.createRecord = async function (args, res, next, incomingObj) {
  const flavourFunctions = {
    InspectionLNG: this.createLNG,
    InspectionNRCED: this.createNRCED
  }
  return await postUtils.createRecordWithFlavours(args, res, next, incomingObj, this.createMaster, flavourFunctions);
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
exports.createMaster = function (args, res, next, incomingObj, flavourIds) {
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
  inspection.read = ROLES.ADMIN_ROLES;
  inspection.write = ROLES.ADMIN_ROLES;

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
  incomingObj.legislationDescription && (inspection.legislationDescription = incomingObj.legislationDescription);
  inspection.issuedTo.read = ROLES.ADMIN_ROLES;
  inspection.issuedTo.write = ROLES.ADMIN_ROLES;
  incomingObj.issuedTo && incomingObj.issuedTo.type && (inspection.issuedTo.type = incomingObj.issuedTo.type);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.companyName &&
    (inspection.issuedTo.companyName = incomingObj.issuedTo.companyName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.firstName &&
    (inspection.issuedTo.firstName = incomingObj.issuedTo.firstName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.middleName &&
    (inspection.issuedTo.middleName = incomingObj.issuedTo.middleName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.lastName &&
    (inspection.issuedTo.lastName = incomingObj.issuedTo.lastName);
  incomingObj.issuedTo && (inspection.issuedTo.fullName = postUtils.getIssuedToFullNameValue(incomingObj.issuedTo));
  incomingObj.issuedTo &&
    incomingObj.issuedTo.dateOfBirth &&
    (inspection.issuedTo.dateOfBirth = incomingObj.issuedTo.dateOfBirth);

  incomingObj.projectName && (inspection.projectName = incomingObj.projectName);
  incomingObj.location && (inspection.location = incomingObj.location);
  incomingObj.centroid && (inspection.centroid = incomingObj.centroid);
  incomingObj.outcomeStatus && (inspection.outcomeStatus = incomingObj.outcomeStatus);
  incomingObj.outcomeDescription && (inspection.outcomeDescription = incomingObj.outcomeDescription);
  incomingObj.documents && (inspection.documents = incomingObj.documents);

  // set meta
  inspection.addedBy = args.swagger.params.auth_payload.displayName;
  inspection.dateAdded = new Date();

  // set data source references
  incomingObj.sourceDateAdded && (inspection.sourceDateAdded = incomingObj.sourceDateAdded);
  incomingObj.sourceDateUpdated && (inspection.sourceDateUpdated = incomingObj.sourceDateUpdated);
  incomingObj.sourceSystemRef && (inspection.sourceSystemRef = incomingObj.sourceSystemRef);
  incomingObj.isNrcedPublished && (inspection.isNrcedPublished = incomingObj.isNrcedPublished);
  incomingObj.isLngPublished && (inspection.isLngPublished = incomingObj.isLngPublished);

  return inspection;
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
exports.createLNG = function (args, res, next, incomingObj) {
  // Confirm user has correct role for this type of record.
  if (!userHasValidRoles([ROLES.SYSADMIN, ROLES.LNGADMIN], args.swagger.params.auth_payload.realm_access.roles)) {
    throw new Error('Missing valid user role.');
  }

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
  inspectionLNG.read = [ROLES.SYSADMIN, ROLES.LNGADMIN];
  inspectionLNG.write = [ROLES.SYSADMIN, ROLES.LNGADMIN];

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
  incomingObj.legislationDescription && (inspectionLNG.legislationDescription = incomingObj.legislationDescription);
  inspectionLNG.issuedTo.read = [ROLES.SYSADMIN, ROLES.LNGADMIN];
  inspectionLNG.issuedTo.write = [ROLES.SYSADMIN, ROLES.LNGADMIN];
  incomingObj.issuedTo && incomingObj.issuedTo.type && (inspectionLNG.issuedTo.type = incomingObj.issuedTo.type);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.companyName &&
    (inspectionLNG.issuedTo.companyName = incomingObj.issuedTo.companyName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.firstName &&
    (inspectionLNG.issuedTo.firstName = incomingObj.issuedTo.firstName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.middleName &&
    (inspectionLNG.issuedTo.middleName = incomingObj.issuedTo.middleName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.lastName &&
    (inspectionLNG.issuedTo.lastName = incomingObj.issuedTo.lastName);
  incomingObj.issuedTo && (inspectionLNG.issuedTo.fullName = postUtils.getIssuedToFullNameValue(incomingObj.issuedTo));
  incomingObj.issuedTo &&
    incomingObj.issuedTo.dateOfBirth &&
    (inspectionLNG.issuedTo.dateOfBirth = incomingObj.issuedTo.dateOfBirth);

  incomingObj.projectName && (inspectionLNG.projectName = incomingObj.projectName);
  incomingObj.location && (inspectionLNG.location = incomingObj.location);
  incomingObj.centroid && (inspectionLNG.centroid = incomingObj.centroid);
  incomingObj.outcomeStatus && (inspectionLNG.outcomeStatus = incomingObj.outcomeStatus);
  incomingObj.outcomeDescription && (inspectionLNG.outcomeDescription = incomingObj.outcomeDescription);
  incomingObj.documents && (inspectionLNG.documents = incomingObj.documents);

  // set flavour data
  incomingObj.description && (inspectionLNG.description = incomingObj.description);

  // set data source references
  incomingObj.sourceDateAdded && (inspectionLNG.sourceDateAdded = incomingObj.sourceDateAdded);
  incomingObj.sourceDateUpdated && (inspectionLNG.sourceDateUpdated = incomingObj.sourceDateUpdated);
  incomingObj.sourceSystemRef && (inspectionLNG.sourceSystemRef = incomingObj.sourceSystemRef);

  // If incoming object has addRole: 'public' then read will look like ['sysadmin', 'public']
  if (incomingObj.addRole && incomingObj.addRole === 'public') {
    inspectionLNG.read.push('public');
    inspectionLNG.datePublished = new Date();
    inspectionLNG.publishedBy = args.swagger.params.auth_payload.displayName;
  }

  inspectionLNG = BusinessLogicManager.applyBusinessLogicOnPost(inspectionLNG);

  return inspectionLNG;
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
exports.createNRCED = function (args, res, next, incomingObj) {
  // Confirm user has correct role for this type of record.
  if (!userHasValidRoles([ROLES.SYSADMIN, ROLES.NRCEDADMIN], args.swagger.params.auth_payload.realm_access.roles)) {
    throw new Error('Missing valid user role.');
  }

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
  inspectionNRCED.read = [ROLES.SYSADMIN, ROLES.NRCEDADMIN];
  inspectionNRCED.write = [ROLES.SYSADMIN, ROLES.NRCEDADMIN];

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
  incomingObj.legislationDescription && (inspectionNRCED.legislationDescription = incomingObj.legislationDescription);
  inspectionNRCED.issuedTo.read = [ROLES.SYSADMIN, ROLES.NRCEDADMIN];
  inspectionNRCED.issuedTo.write = [ROLES.SYSADMIN, ROLES.NRCEDADMIN];
  incomingObj.issuedTo && incomingObj.issuedTo.type && (inspectionNRCED.issuedTo.type = incomingObj.issuedTo.type);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.companyName &&
    (inspectionNRCED.issuedTo.companyName = incomingObj.issuedTo.companyName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.firstName &&
    (inspectionNRCED.issuedTo.firstName = incomingObj.issuedTo.firstName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.middleName &&
    (inspectionNRCED.issuedTo.middleName = incomingObj.issuedTo.middleName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.lastName &&
    (inspectionNRCED.issuedTo.lastName = incomingObj.issuedTo.lastName);
  incomingObj.issuedTo &&
    (inspectionNRCED.issuedTo.fullName = postUtils.getIssuedToFullNameValue(incomingObj.issuedTo));
  incomingObj.issuedTo &&
    incomingObj.issuedTo.dateOfBirth &&
    (inspectionNRCED.issuedTo.dateOfBirth = incomingObj.issuedTo.dateOfBirth);

  incomingObj.projectName && (inspectionNRCED.projectName = incomingObj.projectName);
  incomingObj.location && (inspectionNRCED.location = incomingObj.location);
  incomingObj.centroid && (inspectionNRCED.centroid = incomingObj.centroid);
  incomingObj.outcomeStatus && (inspectionNRCED.outcomeStatus = incomingObj.outcomeStatus);
  incomingObj.outcomeDescription && (inspectionNRCED.outcomeDescription = incomingObj.outcomeDescription);
  incomingObj.documents && (inspectionNRCED.documents = incomingObj.documents);

  // set flavour data
  incomingObj.summary && (inspectionNRCED.summary = incomingObj.summary);

  // set data source references
  incomingObj.sourceDateAdded && (inspectionNRCED.sourceDateAdded = incomingObj.sourceDateAdded);
  incomingObj.sourceDateUpdated && (inspectionNRCED.sourceDateUpdated = incomingObj.sourceDateUpdated);
  incomingObj.sourceSystemRef && (inspectionNRCED.sourceSystemRef = incomingObj.sourceSystemRef);

  // If incoming object has addRole: 'public' then read will look like ['sysadmin', 'public']
  if (incomingObj.addRole && incomingObj.addRole === 'public') {
    inspectionNRCED.read.push('public');
    inspectionNRCED.datePublished = new Date();
    inspectionNRCED.publishedBy = args.swagger.params.auth_payload.displayName;
  }

  inspectionNRCED = BusinessLogicManager.applyBusinessLogicOnPost(inspectionNRCED);

  return inspectionNRCED;
};
