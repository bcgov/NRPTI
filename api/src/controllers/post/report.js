const mongoose = require('mongoose');
const ObjectId = require('mongoose').Types.ObjectId;
const postUtils = require('../../utils/post-utils');
const { userHasValidRoles } = require('../../utils/auth-utils');
const { ROLES } = require('../../utils/constants/misc');

/**
 * Performs all operations necessary to create a master report record and its associated flavour records.
 *
 * Example of incomingObj
 *
 *  reports: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'report',
 *      ...
 *      ReportBCMI: {
 *        description: 'report description'
 *        addRole: 'public',
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
    ReportBCMI: this.createBCMI,
    ReportNRCED: this.createNRCED
  }
  return await postUtils.createRecordWithFlavours(args, res, next, incomingObj, this.createMaster, flavourFunctions);
};

/**
 * Performs all operations necessary to create a master  Report record.
 *
 * Example of incomingObj
 *
 *  Report: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'Report',
 *      ...
 *      ReportBCMI: {
 *        description: 'bcmi description'
 *        addRole: 'public',
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
 * @returns created master  report record
 */
exports.createMaster = function (args, res, next, incomingObj, flavourIds) {
  let Report = mongoose.model('Report');
  let report = new Report();

  report._schemaName = 'Report';

  // set integration references
  incomingObj._epicProjectId &&
    ObjectId.isValid(incomingObj._epicProjectId) &&
    (report._epicProjectId = new ObjectId(incomingObj._epicProjectId));
  incomingObj._sourceRefId &&
    ObjectId.isValid(incomingObj._sourceRefId) &&
    (report._sourceRefId = new ObjectId(incomingObj._sourceRefId));
  incomingObj._epicMilestoneId &&
    ObjectId.isValid(incomingObj._epicMilestoneId) &&
    (report._epicMilestoneId = new ObjectId(incomingObj._epicMilestoneId));
  incomingObj.mineGuid &&
    (report.mineGuid = incomingObj.mineGuid);

  // set permissions
  report.read = ROLES.ADMIN_ROLES;
  report.write = ROLES.ADMIN_ROLES;

  // If incoming object has addRole: 'public' then read will look like ['sysadmin', 'public']
  if (incomingObj.addRole && incomingObj.addRole === 'public') {
    report.read.push('public');
    report.datePublished = new Date();
    report.publishedBy = args.swagger.params.auth_payload.displayName;
  }

  // set forward references
  if (flavourIds && flavourIds.length) {
    flavourIds.forEach(id => {
      if (ObjectId.isValid(id)) {
        report._flavourRecords.push(new ObjectId(id));
      }
    });
  }

  // set data
  incomingObj.recordName && (report.recordName = incomingObj.recordName);
  report.recordType = 'Report';
  report.issuedTo.read = ROLES.ADMIN_ROLES;
  report.issuedTo.write = ROLES.ADMIN_ROLES;
  incomingObj.issuedTo && incomingObj.issuedTo.type && (report.issuedTo.type = incomingObj.issuedTo.type);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.companyName &&
    (report.issuedTo.companyName = incomingObj.issuedTo.companyName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.firstName &&
    (report.issuedTo.firstName = incomingObj.issuedTo.firstName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.middleName &&
    (report.issuedTo.middleName = incomingObj.issuedTo.middleName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.lastName &&
    (report.issuedTo.lastName = incomingObj.issuedTo.lastName);
  incomingObj.issuedTo && (report.issuedTo.fullName = postUtils.getIssuedToFullNameValue(incomingObj.issuedTo));
  incomingObj.issuedTo &&
    incomingObj.issuedTo.dateOfBirth &&
    (report.issuedTo.dateOfBirth = incomingObj.issuedTo.dateOfBirth);
  incomingObj.dateIssued && (report.dateIssued = incomingObj.dateIssued);
  incomingObj.issuingAgency && (report.issuingAgency = incomingObj.issuingAgency);
  incomingObj.legislation && incomingObj.legislation.act && (report.legislation.act = incomingObj.legislation.act);
  incomingObj.legislation &&
    incomingObj.legislation.regulation &&
    (report.legislation.regulation = incomingObj.legislation.regulation);
  incomingObj.legislation &&
    incomingObj.legislation.section &&
    (report.legislation.section = incomingObj.legislation.section);
  incomingObj.legislation &&
    incomingObj.legislation.subSection &&
    (report.legislation.subSection = incomingObj.legislation.subSection);
  incomingObj.legislation &&
    incomingObj.legislation.paragraph &&
    (report.legislation.paragraph = incomingObj.legislation.paragraph);
  incomingObj.legislationDescription && (report.legislationDescription = incomingObj.legislationDescription);
  incomingObj.projectName && (report.projectName = incomingObj.projectName);
  incomingObj.location && (report.location = incomingObj.location);
  incomingObj.centroid && (report.centroid = incomingObj.centroid);
  incomingObj.documents && (report.documents = incomingObj.documents);
  incomingObj.description && (report.description = incomingObj.description);

  // set meta
  report.addedBy = args.swagger.params.auth_payload.displayName;
  report.dateAdded = new Date();

  // set data source references
  incomingObj.sourceDateAdded && (report.sourceDateAdded = incomingObj.sourceDateAdded);
  incomingObj.sourceDateUpdated && (report.sourceDateUpdated = incomingObj.sourceDateUpdated);
  incomingObj.sourceSystemRef && (report.sourceSystemRef = incomingObj.sourceSystemRef);
  incomingObj.isBcmiPublished && (report.isBcmiPublished = incomingObj.isBcmiPublished);
  incomingObj.isNrcedPublished && (report.isNrcedPublished = incomingObj.isNrcedPublished);

  return report;
};

/**
 * Performs all operations necessary to create a BCMI  Report record.
 *
 * Example of incomingObj
 *
 *  certificates: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'Report',
 *      ...
 *      ReportBCMI: {
 *        description: 'bcmi description'
 *        addRole: 'public',
 *        ...
 *      }
 *    }
 *  ]
 *
 * @param {*} args
 * @param {*} res
 * @param {*} next
 * @param {*} incomingObj see example
 * @returns created bcmi  report record
 */
exports.createBCMI = function (args, res, next, incomingObj) {
  // Confirm user has correct role for this type of record.
  if (!userHasValidRoles([ROLES.SYSADMIN, ROLES.BCMIADMIN], args.swagger.params.auth_payload.realm_access.roles)) {
    throw new Error('Missing valid user role.');
  }

  let ReportBCMI = mongoose.model('ReportBCMI');
  let reportBCMI = new ReportBCMI();

  reportBCMI._schemaName = 'ReportBCMI';
  // set integration references
  incomingObj._epicProjectId &&
  ObjectId.isValid(incomingObj._epicProjectId) &&
  (reportBCMI._epicProjectId = new ObjectId(incomingObj._epicProjectId));
  incomingObj._sourceRefId &&
  ObjectId.isValid(incomingObj._sourceRefId) &&
  (reportBCMI._sourceRefId = new ObjectId(incomingObj._sourceRefId));
  incomingObj._epicMilestoneId &&
  ObjectId.isValid(incomingObj._epicMilestoneId) &&
  (reportBCMI._epicMilestoneId = new ObjectId(incomingObj._epicMilestoneId));
  incomingObj.mineGuid &&
  (reportBCMI.mineGuid = incomingObj.mineGuid);

  // set permissions
  reportBCMI.read = ROLES.ADMIN_ROLES;
  reportBCMI.write = [ROLES.SYSADMIN, ROLES.BCMIADMIN];

  // If incoming object has addRole: 'public' then read will look like ['sysadmin', 'public']
  if (incomingObj.addRole && incomingObj.addRole === 'public') {
    reportBCMI.read.push('public');
    reportBCMI.datePublished = new Date();
    reportBCMI.publishedBy = args.swagger.params.auth_payload.displayName;
  }

  // set data
  incomingObj.recordName && (reportBCMI.recordName = incomingObj.recordName);
  reportBCMI.recordType = 'Report';
  reportBCMI.issuedTo.read = ROLES.ADMIN_ROLES;
  reportBCMI.issuedTo.write = [ROLES.SYSADMIN, ROLES.BCMIADMIN];
  incomingObj.issuedTo && incomingObj.issuedTo.type && (reportBCMI.issuedTo.type = incomingObj.issuedTo.type);
  incomingObj.issuedTo &&
  incomingObj.issuedTo.companyName &&
  (reportBCMI.issuedTo.companyName = incomingObj.issuedTo.companyName);
  incomingObj.issuedTo &&
  incomingObj.issuedTo.firstName &&
  (reportBCMI.issuedTo.firstName = incomingObj.issuedTo.firstName);
  incomingObj.issuedTo &&
  incomingObj.issuedTo.middleName &&
  (reportBCMI.issuedTo.middleName = incomingObj.issuedTo.middleName);
  incomingObj.issuedTo &&
  incomingObj.issuedTo.lastName &&
  (reportBCMI.issuedTo.lastName = incomingObj.issuedTo.lastName);
  incomingObj.issuedTo && (reportBCMI.issuedTo.fullName = postUtils.getIssuedToFullNameValue(incomingObj.issuedTo));
  incomingObj.issuedTo &&
  incomingObj.issuedTo.dateOfBirth &&
  (reportBCMI.issuedTo.dateOfBirth = incomingObj.issuedTo.dateOfBirth);
  incomingObj.dateIssued && (reportBCMI.dateIssued = incomingObj.dateIssued);
  incomingObj.issuingAgency && (reportBCMI.issuingAgency = incomingObj.issuingAgency);
  incomingObj.legislation && incomingObj.legislation.act && (reportBCMI.legislation.act = incomingObj.legislation.act);
  incomingObj.legislation &&
  incomingObj.legislation.regulation &&
  (reportBCMI.legislation.regulation = incomingObj.legislation.regulation);
  incomingObj.legislation &&
  incomingObj.legislation.section &&
  (reportBCMI.legislation.section = incomingObj.legislation.section);
  incomingObj.legislation &&
  incomingObj.legislation.subSection &&
  (reportBCMI.legislation.subSection = incomingObj.legislation.subSection);
  incomingObj.legislation &&
  incomingObj.legislation.paragraph &&
  (reportBCMI.legislation.paragraph = incomingObj.legislation.paragraph);
  incomingObj.legislationDescription && (reportBCMI.legislationDescription = incomingObj.legislationDescription);
  incomingObj.projectName && (reportBCMI.projectName = incomingObj.projectName);
  incomingObj.location && (reportBCMI.location = incomingObj.location);
  incomingObj.centroid && (reportBCMI.centroid = incomingObj.centroid);
  incomingObj.documents && (reportBCMI.documents = incomingObj.documents);
  incomingObj.description && (reportBCMI.description = incomingObj.description);

  // set meta
  reportBCMI.addedBy = args.swagger.params.auth_payload.displayName;
  reportBCMI.dateAdded = new Date();

  // set data source references
  incomingObj.sourceDateAdded && (reportBCMI.sourceDateAdded = incomingObj.sourceDateAdded);
  incomingObj.sourceDateUpdated && (reportBCMI.sourceDateUpdated = incomingObj.sourceDateUpdated);
  incomingObj.sourceSystemRef && (reportBCMI.sourceSystemRef = incomingObj.sourceSystemRef);
  incomingObj.isBcmiPublished && (reportBCMI.isBcmiPublished = incomingObj.isBcmiPublished);
  incomingObj.isNrcedPublished && (reportBCMI.isNrcedPublished = incomingObj.isNrcedPublished);

  return reportBCMI;
};


/**
 * Performs all operations necessary to create a nrced Report record.
 *
 * Example of incomingObj
 *
 *  reports: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'Report',
 *      ...
 *      ReportNRCED: {
 *        description: 'nrced description'
 *        addRole: 'public',
 *        ...
 *      }
 *    }
 *  ]
 *
 * @param {*} args
 * @param {*} res
 * @param {*} next
 * @param {*} incomingObj see example
 * @returns created bcmi  report record
 */
 exports.createNRCED = function (args, res, next, incomingObj) {
  // Confirm user has correct role for this type of record.
  if (!userHasValidRoles([ROLES.SYSADMIN, ROLES.BCMIADMIN], args.swagger.params.auth_payload.realm_access.roles)) {
    throw new Error('Missing valid user role.');
  }

  let ReportNRCED = mongoose.model('ReportNRCED');
  let reportNRCED = new ReportNRCED();

  reportNRCED._schemaName = 'ReportNRCED';
  // set integration references
  incomingObj._epicProjectId &&
  ObjectId.isValid(incomingObj._epicProjectId) &&
  (reportNRCED._epicProjectId = new ObjectId(incomingObj._epicProjectId));
  incomingObj._sourceRefId &&
  ObjectId.isValid(incomingObj._sourceRefId) &&
  (reportNRCED._sourceRefId = new ObjectId(incomingObj._sourceRefId));
  incomingObj._epicMilestoneId &&
  ObjectId.isValid(incomingObj._epicMilestoneId) &&
  (reportNRCED._epicMilestoneId = new ObjectId(incomingObj._epicMilestoneId));
  incomingObj.mineGuid &&
  (reportNRCED.mineGuid = incomingObj.mineGuid);

  // set permissions
  reportNRCED.read = ROLES.ADMIN_ROLES;
  reportNRCED.write = [ROLES.SYSADMIN, ROLES.BCMIADMIN];

  // If incoming object has addRole: 'public' then read will look like ['sysadmin', 'public']
  if (incomingObj.addRole && incomingObj.addRole === 'public') {
    reportNRCED.read.push('public');
    reportNRCED.datePublished = new Date();
    reportNRCED.publishedBy = args.swagger.params.auth_payload.displayName;
  }

  // set data
  incomingObj.recordName && (reportNRCED.recordName = incomingObj.recordName);
  reportNRCED.recordType = 'Report';
  reportNRCED.issuedTo.read = ROLES.ADMIN_ROLES;
  reportNRCED.issuedTo.write = [ROLES.SYSADMIN, ROLES.BCMIADMIN];
  incomingObj.issuedTo && incomingObj.issuedTo.type && (reportNRCED.issuedTo.type = incomingObj.issuedTo.type);
  incomingObj.issuedTo &&
  incomingObj.issuedTo.companyName &&
  (reportNRCED.issuedTo.companyName = incomingObj.issuedTo.companyName);
  incomingObj.issuedTo &&
  incomingObj.issuedTo.firstName &&
  (reportNRCED.issuedTo.firstName = incomingObj.issuedTo.firstName);
  incomingObj.issuedTo &&
  incomingObj.issuedTo.middleName &&
  (reportNRCED.issuedTo.middleName = incomingObj.issuedTo.middleName);
  incomingObj.issuedTo &&
  incomingObj.issuedTo.lastName &&
  (reportNRCED.issuedTo.lastName = incomingObj.issuedTo.lastName);
  incomingObj.issuedTo && (reportNRCED.issuedTo.fullName = postUtils.getIssuedToFullNameValue(incomingObj.issuedTo));
  incomingObj.issuedTo &&
  incomingObj.issuedTo.dateOfBirth &&
  (reportNRCED.issuedTo.dateOfBirth = incomingObj.issuedTo.dateOfBirth);
  incomingObj.dateIssued && (reportNRCED.dateIssued = incomingObj.dateIssued);
  incomingObj.issuingAgency && (reportNRCED.issuingAgency = incomingObj.issuingAgency);
  incomingObj.legislation && incomingObj.legislation.act && (reportNRCED.legislation.act = incomingObj.legislation.act);
  incomingObj.legislation &&
  incomingObj.legislation.regulation &&
  (reportNRCED.legislation.regulation = incomingObj.legislation.regulation);
  incomingObj.legislation &&
  incomingObj.legislation.section &&
  (reportNRCED.legislation.section = incomingObj.legislation.section);
  incomingObj.legislation &&
  incomingObj.legislation.subSection &&
  (reportNRCED.legislation.subSection = incomingObj.legislation.subSection);
  incomingObj.legislation &&
  incomingObj.legislation.paragraph &&
  (reportNRCED.legislation.paragraph = incomingObj.legislation.paragraph);
  incomingObj.legislationDescription && (reportNRCED.legislationDescription = incomingObj.legislationDescription);
  incomingObj.projectName && (reportNRCED.projectName = incomingObj.projectName);
  incomingObj.location && (reportNRCED.location = incomingObj.location);
  incomingObj.centroid && (reportNRCED.centroid = incomingObj.centroid);
  incomingObj.documents && (reportNRCED.documents = incomingObj.documents);
  incomingObj.description && (reportNRCED.description = incomingObj.description);

  // set meta
  reportNRCED.addedBy = args.swagger.params.auth_payload.displayName;
  reportNRCED.dateAdded = new Date();

  // set data source references
  incomingObj.sourceDateAdded && (reportNRCED.sourceDateAdded = incomingObj.sourceDateAdded);
  incomingObj.sourceDateUpdated && (reportNRCED.sourceDateUpdated = incomingObj.sourceDateUpdated);
  incomingObj.sourceSystemRef && (reportNRCED.sourceSystemRef = incomingObj.sourceSystemRef);
  incomingObj.isBcmiPublished && (reportNRCED.isBcmiPublished = incomingObj.isBcmiPublished);
  incomingObj.isNrcedPublished && (reportNRCED.isNrcedPublished = incomingObj.isNrcedPublished);

  return reportNRCED;
};
