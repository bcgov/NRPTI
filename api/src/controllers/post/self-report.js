const mongoose = require('mongoose');
const ObjectId = require('mongoose').Types.ObjectId;
const postUtils = require('../../utils/post-utils');
const { userHasValidRoles } = require('../../utils/auth-utils');
const utils = require('../../utils/constants/misc');

/**
 * Performs all operations necessary to create a master Self Report record and its associated flavour records.
 *
 * Example of incomingObj
 *
 *  selfReports: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'selfReport',
 *      ...
 *      SelfReportLNG: {
 *        description: 'lng description'
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
    SelfReportLNG: this.createLNG
  }
  return await postUtils.createRecordWithFlavours(args, res, next, incomingObj, this.createMaster, flavourFunctions);
};

/**
 * Performs all operations necessary to create a master Self Report record.
 *
 * Example of incomingObj
 *
 *  selfReports: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'selfReport',
 *      ...
 *      SelfReportLNG: {
 *        description: 'lng description'
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
 * @returns created master selfReport record
 */
exports.createMaster = function (args, res, next, incomingObj, flavourIds) {
  let SelfReport = mongoose.model('SelfReport');
  let selfReport = new SelfReport();

  selfReport._schemaName = 'SelfReport';

  // set integration references
  incomingObj._epicProjectId &&
    ObjectId.isValid(incomingObj._epicProjectId) &&
    (selfReport._epicProjectId = new ObjectId(incomingObj._epicProjectId));
  incomingObj._sourceRefId &&
    ObjectId.isValid(incomingObj._sourceRefId) &&
    (selfReport._sourceRefId = new ObjectId(incomingObj._sourceRefId));
  incomingObj._epicMilestoneId &&
    ObjectId.isValid(incomingObj._epicMilestoneId) &&
    (selfReport._epicMilestoneId = new ObjectId(incomingObj._epicMilestoneId));
  incomingObj.collectionId &&
    ObjectId.isValid(incomingObj.collectionId) &&
    (selfReport.collectionId = new ObjectId(incomingObj.collectionId));

  // set permissions
  selfReport.read = utils.ApplicationAdminRoles
  selfReport.write = utils.ApplicationAdminRoles;

  // set forward references
  if (flavourIds && flavourIds.length) {
    flavourIds.forEach(id => {
      if (ObjectId.isValid(id)) {
        selfReport._flavourRecords.push(new ObjectId(id));
      }
    });
  }

  // set data
  incomingObj.recordName && (selfReport.recordName = incomingObj.recordName);
  selfReport.recordType = 'Compliance Self-Report';
  incomingObj.dateIssued && (selfReport.dateIssued = incomingObj.dateIssued);
  incomingObj.issuingAgency && (selfReport.issuingAgency = incomingObj.issuingAgency);
  incomingObj.author && (selfReport.author = incomingObj.author);

  selfReport.legislation = postUtils.populateLegislation(incomingObj.legislation);

  incomingObj.projectName && (selfReport.projectName = incomingObj.projectName);
  incomingObj.location && (selfReport.location = incomingObj.location);
  incomingObj.centroid && (selfReport.centroid = incomingObj.centroid);
  incomingObj.documents && (selfReport.documents = incomingObj.documents);

  // set meta
  selfReport.addedBy = args.swagger.params.auth_payload.displayName;
  selfReport.dateAdded = new Date();

  // set data source references
  incomingObj.sourceDateAdded && (selfReport.sourceDateAdded = incomingObj.sourceDateAdded);
  incomingObj.sourceDateUpdated && (selfReport.sourceDateUpdated = incomingObj.sourceDateUpdated);
  incomingObj.sourceSystemRef && (selfReport.sourceSystemRef = incomingObj.sourceSystemRef);
  incomingObj.isLngPublished && (selfReport.isLngPublished = incomingObj.isLngPublished);

  return selfReport;
};

/**
 * Performs all operations necessary to create a LNG Self Report record.
 *
 * Example of incomingObj
 *
 *  selfReports: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'selfReport',
 *      ...
 *      SelfReportLNG: {
 *        description: 'lng description'
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
 * @returns created lng selfReport record
 */
exports.createLNG = function (args, res, next, incomingObj) {
  // Confirm user has correct role for this type of record.
  if (!userHasValidRoles([utils.ApplicationRoles.ADMIN, utils.ApplicationRoles.ADMIN_LNG], args.swagger.params.auth_payload.realm_access.roles)) {
    throw new Error('Missing valid user role.');
  }

  let SelfReportLNG = mongoose.model('SelfReportLNG');
  let selfReportLNG = new SelfReportLNG();

  selfReportLNG._schemaName = 'SelfReportLNG';

  // set integration references
  incomingObj._epicProjectId &&
    ObjectId.isValid(incomingObj._epicProjectId) &&
    (selfReportLNG._epicProjectId = new ObjectId(incomingObj._epicProjectId));
  incomingObj._sourceRefId &&
    ObjectId.isValid(incomingObj._sourceRefId) &&
    (selfReportLNG._sourceRefId = new ObjectId(incomingObj._sourceRefId));
  incomingObj._epicMilestoneId &&
    ObjectId.isValid(incomingObj._epicMilestoneId) &&
    (selfReportLNG._epicMilestoneId = new ObjectId(incomingObj._epicMilestoneId));

  // set permissions and meta
  selfReportLNG.read = utils.ApplicationAdminRoles;
  selfReportLNG.write = [utils.ApplicationRoles.ADMIN, utils.ApplicationRoles.ADMIN_LNG];

  // If incoming object has addRole: 'public' then read will look like ['sysadmin', 'public']
  if (incomingObj.addRole && incomingObj.addRole === 'public') {
    selfReportLNG.read.push('public');
    selfReportLNG.datePublished = new Date();
    selfReportLNG.publishedBy = args.swagger.params.auth_payload.displayName;
  }

  selfReportLNG.addedBy = args.swagger.params.auth_payload.displayName;
  selfReportLNG.dateAdded = new Date();

  // set master data
  incomingObj.recordName && (selfReportLNG.recordName = incomingObj.recordName);
  selfReportLNG.recordType = 'Compliance Self-Report';
  incomingObj.dateIssued && (selfReportLNG.dateIssued = incomingObj.dateIssued);
  incomingObj.issuingAgency && (selfReportLNG.issuingAgency = incomingObj.issuingAgency);
  incomingObj.author && (selfReportLNG.author = incomingObj.author);

  selfReportLNG.legislation = postUtils.populateLegislation(incomingObj.legislation);

  incomingObj.projectName && (selfReportLNG.projectName = incomingObj.projectName);
  incomingObj.location && (selfReportLNG.location = incomingObj.location);
  incomingObj.centroid && (selfReportLNG.centroid = incomingObj.centroid);
  incomingObj.documents && (selfReportLNG.documents = incomingObj.documents);

  // set flavour data
  incomingObj.description && (selfReportLNG.description = incomingObj.description);
  incomingObj.relatedPhase && (selfReportLNG.relatedPhase = incomingObj.relatedPhase);

  // set data source references
  incomingObj.sourceDateAdded && (selfReportLNG.sourceDateAdded = incomingObj.sourceDateAdded);
  incomingObj.sourceDateUpdated && (selfReportLNG.sourceDateUpdated = incomingObj.sourceDateUpdated);
  incomingObj.sourceSystemRef && (selfReportLNG.sourceSystemRef = incomingObj.sourceSystemRef);

  return selfReportLNG;
};
