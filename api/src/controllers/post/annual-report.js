const mongoose = require('mongoose');
const ObjectId = require('mongoose').Types.ObjectId;
const postUtils = require('../../utils/post-utils');
const { userHasValidRoles } = require('../../utils/auth-utils');
const utils = require('../../utils/constants/misc');

/**
 * Performs all operations necessary to create a master annual report record and its associated flavour records.
 *
 * Example of incomingObj
 *
 *  AnnualRports: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'annualReport',
 *      ...
 *      AnnualReportBCMI: {
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
 * @returns object containing the operation's status and created records
 */
exports.createItem = async function (args, res, next, incomingObj) {
  const flavourFunctions = {
    AnnualReportBCMI: this.createBCMI
  };
  return await postUtils.createRecordWithFlavours(args, res, next, incomingObj, this.createMaster, flavourFunctions);
};

/**
 * Performs all operations necessary to create a master Annual Report record.
 *
 * Example of incomingObj
 *
 *  annualReport: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'annualReport',
 *      ...
 *      AnnualReportBCMI: {
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
 * @returns created master annual report record
 */
exports.createMaster = function (args, res, next, incomingObj, flavourIds) {
  let AnnualReport = mongoose.model('AnnualReport');
  let annualReport = new AnnualReport();

  annualReport._schemaName = 'AnnualReport';

  // set integration references
  incomingObj._sourceRefId &&
    ObjectId.isValid(incomingObj._sourceRefId) &&
    (annualReport._sourceRefId = new ObjectId(incomingObj._sourceRefId));
  incomingObj.mineGuid && (annualReport.mineGuid = incomingObj.mineGuid);
  incomingObj.collectionId &&
    ObjectId.isValid(incomingObj.collectionId) &&
    (annualReport.collectionId = new ObjectId(incomingObj.collectionId));

  // set permissions
  annualReport.read = utils.ApplicationAdminRoles;
  annualReport.write = utils.ApplicationAdminRoles;

  // set forward references
  if (flavourIds && flavourIds.length) {
    flavourIds.forEach(id => {
      if (ObjectId.isValid(id)) {
        annualReport._flavourRecords.push(new ObjectId(id));
      }
    });
  }

  // set data
  incomingObj.recordName && (annualReport.recordName = incomingObj.recordName);
  annualReport.recordType = 'Annual Report';
  annualReport.issuedTo.read = utils.ApplicationAdminRoles;
  annualReport.issuedTo.write = utils.ApplicationAdminRoles;
  incomingObj.issuedTo && incomingObj.issuedTo.type && (annualReport.issuedTo.type = incomingObj.issuedTo.type);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.companyName &&
    (annualReport.issuedTo.companyName = incomingObj.issuedTo.companyName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.firstName &&
    (annualReport.issuedTo.firstName = incomingObj.issuedTo.firstName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.middleName &&
    (annualReport.issuedTo.middleName = incomingObj.issuedTo.middleName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.lastName &&
    (annualReport.issuedTo.lastName = incomingObj.issuedTo.lastName);
  incomingObj.issuedTo && (annualReport.issuedTo.fullName = postUtils.getIssuedToFullNameValue(incomingObj.issuedTo));
  incomingObj.issuedTo &&
    incomingObj.issuedTo.dateOfBirth &&
    (annualReport.issuedTo.dateOfBirth = incomingObj.issuedTo.dateOfBirth);
  incomingObj.dateIssued && (annualReport.dateIssued = incomingObj.dateIssued);
  incomingObj.issuingAgency && (annualReport.issuingAgency = incomingObj.issuingAgency);

  annualReport.legislation = postUtils.populateLegislation(incomingObj.legislation);

  incomingObj.projectName && (annualReport.projectName = incomingObj.projectName);
  incomingObj.location && (annualReport.location = incomingObj.location);
  incomingObj.centroid && (annualReport.centroid = incomingObj.centroid);
  incomingObj.documents && (annualReport.documents = incomingObj.documents);
  incomingObj.description && (annualReport.description = incomingObj.description);

  // set meta
  annualReport.addedBy = args.swagger.params.auth_payload.displayName;
  annualReport.dateAdded = new Date();

  // set data source references
  incomingObj.sourceDateAdded && (annualReport.sourceDateAdded = incomingObj.sourceDateAdded);
  incomingObj.sourceDateUpdated && (annualReport.sourceDateUpdated = incomingObj.sourceDateUpdated);
  incomingObj.sourceSystemRef && (annualReport.sourceSystemRef = incomingObj.sourceSystemRef);
  incomingObj.isBcmiPublished && (annualReport.isBcmiPublished = incomingObj.isBcmiPublished);

  return annualReport;
};

/**
 * Performs all operations necessary to create a BCMI Annual Report record.
 *
 * Example of incomingObj
 *
 *  certificates: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'annualReport',
 *      ...
 *      AnnualReportBCMI: {
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
 * @returns created BCMI annual report record
 */
exports.createBCMI = function (args, res, next, incomingObj) {
  // Confirm user has correct role for this type of record.
  if (
    !userHasValidRoles(
      [utils.ApplicationRoles.ADMIN, utils.ApplicationRoles.ADMIN_BCMI],
      args.swagger.params.auth_payload.client_roles
    )
  ) {
    throw new Error('Missing valid user role.');
  }

  let AnnualReportBCMI = mongoose.model('AnnualReportBCMI');
  let annualReportBCMI = new AnnualReportBCMI();

  annualReportBCMI._schemaName = 'AnnualReportBCMI';

  // set integration references
  incomingObj._sourceRefId &&
    ObjectId.isValid(incomingObj._sourceRefId) &&
    (annualReportBCMI._sourceRefId = new ObjectId(incomingObj._sourceRefId));
  incomingObj.mineGuid && (annualReportBCMI.mineGuid = incomingObj.mineGuid);
  incomingObj.collectionId &&
    ObjectId.isValid(incomingObj.collectionId) &&
    (annualReportBCMI.collectionId = new ObjectId(incomingObj.collectionId));
  incomingObj._master &&
    ObjectId.isValid(incomingObj._master) &&
    (annualReportBCMI._master = new ObjectId(incomingObj._master));

  // set permissions
  annualReportBCMI.read = utils.ApplicationAdminRoles;
  annualReportBCMI.write = utils.ApplicationAdminRoles;

  // If incoming object has addRole: 'public' then read will look like ['sysadmin', 'public']
  if (incomingObj.addRole && incomingObj.addRole === 'public') {
    annualReportBCMI.read.push('public');
    annualReportBCMI.datePublished = new Date();
    annualReportBCMI.publishedBy = args.swagger.params.auth_payload.displayName;
  }

  // set data
  incomingObj.recordName && (annualReportBCMI.recordName = incomingObj.recordName);
  annualReportBCMI.recordType = 'Annual Report';
  annualReportBCMI.issuedTo.read = utils.ApplicationAdminRoles;
  annualReportBCMI.issuedTo.write = utils.ApplicationAdminRoles;
  incomingObj.issuedTo && incomingObj.issuedTo.type && (annualReportBCMI.issuedTo.type = incomingObj.issuedTo.type);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.companyName &&
    (annualReportBCMI.issuedTo.companyName = incomingObj.issuedTo.companyName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.firstName &&
    (annualReportBCMI.issuedTo.firstName = incomingObj.issuedTo.firstName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.middleName &&
    (annualReportBCMI.issuedTo.middleName = incomingObj.issuedTo.middleName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.lastName &&
    (annualReportBCMI.issuedTo.lastName = incomingObj.issuedTo.lastName);
  incomingObj.issuedTo &&
    (annualReportBCMI.issuedTo.fullName = postUtils.getIssuedToFullNameValue(incomingObj.issuedTo));
  incomingObj.issuedTo &&
    incomingObj.issuedTo.dateOfBirth &&
    (annualReportBCMI.issuedTo.dateOfBirth = incomingObj.issuedTo.dateOfBirth);
  incomingObj.dateIssued && (annualReportBCMI.dateIssued = incomingObj.dateIssued);
  incomingObj.issuingAgency && (annualReportBCMI.issuingAgency = incomingObj.issuingAgency);

  annualReportBCMI.legislation = postUtils.populateLegislation(incomingObj.legislation);

  incomingObj.projectName && (annualReportBCMI.projectName = incomingObj.projectName);
  incomingObj.location && (annualReportBCMI.location = incomingObj.location);
  incomingObj.centroid && (annualReportBCMI.centroid = incomingObj.centroid);
  incomingObj.documents && (annualReportBCMI.documents = incomingObj.documents);
  incomingObj.description && (annualReportBCMI.description = incomingObj.description);

  // set meta
  annualReportBCMI.addedBy = args.swagger.params.auth_payload.displayName;
  annualReportBCMI.dateAdded = new Date();

  // set data source references
  incomingObj.sourceDateAdded && (annualReportBCMI.sourceDateAdded = incomingObj.sourceDateAdded);
  incomingObj.sourceDateUpdated && (annualReportBCMI.sourceDateUpdated = incomingObj.sourceDateUpdated);
  incomingObj.sourceSystemRef && (annualReportBCMI.sourceSystemRef = incomingObj.sourceSystemRef);

  return annualReportBCMI;
};
