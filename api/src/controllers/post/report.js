const mongoose = require('mongoose');
const ObjectId = require('mongoose').Types.ObjectId;
const postUtils = require('../../utils/post-utils');
const { userHasValidRoles } = require('../../utils/auth-utils');
const utils = require('../../utils/constants/misc');

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
exports.createItem = async function (args, res, next, incomingObj) {
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
  incomingObj.collectionId &&
    ObjectId.isValid(incomingObj.collectionId) &&
    (report.collectionId = new ObjectId(incomingObj.collectionId));

  // set permissions
  report.read = utils.ApplicationAdminRoles;
  report.write = utils.ApplicationAdminRoles;

  // If incoming object has addRole: 'public' then read will look like ['sysadmin', 'public']
  if (incomingObj.addRole && incomingObj.addRole === 'public') {
    report.read.push('public');
    report.datePublished = new Date();
    report.publishedBy = args.swagger.params.auth_payload.display_name;
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
  report.issuedTo.read = utils.ApplicationAdminRoles;
  report.issuedTo.write = utils.ApplicationAdminRoles;
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

  report.legislation = postUtils.populateLegislation(incomingObj.legislation);

  incomingObj.projectName && (report.projectName = incomingObj.projectName);
  incomingObj.location && (report.location = incomingObj.location);
  incomingObj.centroid && (report.centroid = incomingObj.centroid);
  incomingObj.documents && (report.documents = incomingObj.documents);
  incomingObj.description && (report.description = incomingObj.description);

  // set meta
  report.addedBy = args.swagger.params.auth_payload.display_name;
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
  if (!userHasValidRoles([utils.ApplicationRoles.ADMIN, utils.ApplicationRoles.ADMIN_BCMI], args.swagger.params.auth_payload.client_roles)) {
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
  incomingObj.collectionId &&
    ObjectId.isValid(incomingObj.collectionId) &&
    (reportBCMI.collectionId = new ObjectId(incomingObj.collectionId));
  incomingObj._master &&
    ObjectId.isValid(incomingObj._master) &&
    (reportBCMI._master = new ObjectId(incomingObj._master));

  // set permissions
  reportBCMI.read = utils.ApplicationAdminRoles;
  reportBCMI.write = [utils.ApplicationRoles.ADMIN, utils.ApplicationRoles.ADMIN_BCMI];

  // If incoming object has addRole: 'public' then read will look like ['sysadmin', 'public']
  if (incomingObj.addRole && incomingObj.addRole === 'public') {
    reportBCMI.read.push('public');
    reportBCMI.datePublished = new Date();
    reportBCMI.publishedBy = args.swagger.params.auth_payload.display_name;
  }

  // set data
  incomingObj.recordName && (reportBCMI.recordName = incomingObj.recordName);
  reportBCMI.recordType = 'Report';
  reportBCMI.issuedTo.read = utils.ApplicationAdminRoles;
  reportBCMI.issuedTo.write = [utils.ApplicationRoles.ADMIN, utils.ApplicationRoles.ADMIN_BCMI];
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

  reportBCMI.legislation = postUtils.populateLegislation(incomingObj.legislation);

  incomingObj.projectName && (reportBCMI.projectName = incomingObj.projectName);
  incomingObj.location && (reportBCMI.location = incomingObj.location);
  incomingObj.centroid && (reportBCMI.centroid = incomingObj.centroid);
  incomingObj.documents && (reportBCMI.documents = incomingObj.documents);
  incomingObj.description && (reportBCMI.description = incomingObj.description);

  // set meta
  reportBCMI.addedBy = args.swagger.params.auth_payload.display_name;
  reportBCMI.dateAdded = new Date();

  // set data source references
  incomingObj.sourceDateAdded && (reportBCMI.sourceDateAdded = incomingObj.sourceDateAdded);
  incomingObj.sourceDateUpdated && (reportBCMI.sourceDateUpdated = incomingObj.sourceDateUpdated);
  incomingObj.sourceSystemRef && (reportBCMI.sourceSystemRef = incomingObj.sourceSystemRef);

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
  if (!userHasValidRoles([utils.ApplicationRoles.ADMIN, utils.ApplicationRoles.ADMIN_BCMI], args.swagger.params.auth_payload.client_roles)) {
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
  reportNRCED.read = utils.ApplicationAdminRoles;
  reportNRCED.write = [utils.ApplicationRoles.ADMIN, utils.ApplicationRoles.ADMIN_BCMI];

  // If incoming object has addRole: 'public' then read will look like ['sysadmin', 'public']
  if (incomingObj.addRole && incomingObj.addRole === 'public') {
    reportNRCED.read.push('public');
    reportNRCED.datePublished = new Date();
    reportNRCED.publishedBy = args.swagger.params.auth_payload.display_name;
  }

  // set data
  incomingObj.recordName && (reportNRCED.recordName = incomingObj.recordName);
  reportNRCED.recordType = 'Report';
  reportNRCED.issuedTo.read = utils.ApplicationAdminRoles;
  reportNRCED.issuedTo.write = [utils.ApplicationRoles.ADMIN, utils.ApplicationRoles.ADMIN_BCMI];
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

  reportNRCED.legislation = postUtils.populateLegislation(incomingObj.legislation);

  incomingObj.projectName && (reportNRCED.projectName = incomingObj.projectName);
  incomingObj.location && (reportNRCED.location = incomingObj.location);
  incomingObj.centroid && (reportNRCED.centroid = incomingObj.centroid);
  incomingObj.documents && (reportNRCED.documents = incomingObj.documents);
  incomingObj.description && (reportNRCED.description = incomingObj.description);

  // set meta
  reportNRCED.addedBy = args.swagger.params.auth_payload.display_name;
  reportNRCED.dateAdded = new Date();

  // set data source references
  incomingObj.sourceDateAdded && (reportNRCED.sourceDateAdded = incomingObj.sourceDateAdded);
  incomingObj.sourceDateUpdated && (reportNRCED.sourceDateUpdated = incomingObj.sourceDateUpdated);
  incomingObj.sourceSystemRef && (reportNRCED.sourceSystemRef = incomingObj.sourceSystemRef);

  return reportNRCED;
};
