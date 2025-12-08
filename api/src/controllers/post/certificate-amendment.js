const mongoose = require('mongoose');
const ObjectId = require('mongoose').Types.ObjectId;
const postUtils = require('../../utils/post-utils');
const { userHasValidRoles } = require('../../utils/auth-utils');
const utils = require('../../utils/constants/misc');

/**
 * Performs all operations necessary to create a master Certificate amendment record and its associated flavour records.
 *
 * Example of incomingObj
 *
 *  certificateAmendments: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'certificateAmendment',
 *      ...
 *      CertificateAmendmentBCMI: {
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
    CertificateAmendmentBCMI: this.createBCMI,
    CertificateAmendmentLNG: this.createLNG
  };
  return await postUtils.createRecordWithFlavours(args, res, next, incomingObj, this.createMaster, flavourFunctions);
};

/**
 * Performs all operations necessary to create a master Certificate amendment record.
 *
 * Example of incomingObj
 *
 *  certificateAmendments: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'certificateAmendment',
 *      ...
 *      CertificateAmendmentBCMI: {
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
 * @returns created master certificate record
 */
exports.createMaster = function (args, res, next, incomingObj, flavourIds) {
  let CertificateAmendment = mongoose.model('CertificateAmendment');
  let certificateAmendment = new CertificateAmendment();

  certificateAmendment._schemaName = 'CertificateAmendment';

  // set integration references
  incomingObj._epicProjectId &&
    ObjectId.isValid(incomingObj._epicProjectId) &&
    (certificateAmendment._epicProjectId = new ObjectId(incomingObj._epicProjectId));
  incomingObj._sourceRefId &&
    ObjectId.isValid(incomingObj._sourceRefId) &&
    (certificateAmendment._sourceRefId = new ObjectId(incomingObj._sourceRefId));
  incomingObj._epicMilestoneId &&
    ObjectId.isValid(incomingObj._epicMilestoneId) &&
    (certificateAmendment._epicMilestoneId = new ObjectId(incomingObj._epicMilestoneId));
  incomingObj.mineGuid && (certificateAmendment.mineGuid = incomingObj.mineGuid);
  incomingObj.collectionId &&
    ObjectId.isValid(incomingObj.collectionId) &&
    (certificateAmendment.collectionId = new ObjectId(incomingObj.collectionId));

  // set permissions
  certificateAmendment.read = utils.ApplicationAdminRoles;
  certificateAmendment.write = utils.ApplicationAdminRoles;

  // set forward references
  if (flavourIds && flavourIds.length) {
    flavourIds.forEach(id => {
      if (ObjectId.isValid(id)) {
        certificateAmendment._flavourRecords.push(new ObjectId(id));
      }
    });
  }

  // set data
  incomingObj.recordName && (certificateAmendment.recordName = incomingObj.recordName);
  certificateAmendment.recordType = 'Certificate Amendment';
  certificateAmendment.recordSubtype = 'Certificate';
  certificateAmendment.issuedTo.read = utils.ApplicationAdminRoles;
  certificateAmendment.issuedTo.write = utils.ApplicationAdminRoles;
  incomingObj.issuedTo && incomingObj.issuedTo.type && (certificateAmendment.issuedTo.type = incomingObj.issuedTo.type);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.companyName &&
    (certificateAmendment.issuedTo.companyName = incomingObj.issuedTo.companyName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.firstName &&
    (certificateAmendment.issuedTo.firstName = incomingObj.issuedTo.firstName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.middleName &&
    (certificateAmendment.issuedTo.middleName = incomingObj.issuedTo.middleName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.lastName &&
    (certificateAmendment.issuedTo.lastName = incomingObj.issuedTo.lastName);
  incomingObj.issuedTo &&
    (certificateAmendment.issuedTo.fullName = postUtils.getIssuedToFullNameValue(incomingObj.issuedTo));
  incomingObj.issuedTo &&
    incomingObj.issuedTo.dateOfBirth &&
    (certificateAmendment.issuedTo.dateOfBirth = incomingObj.issuedTo.dateOfBirth);
  incomingObj.dateIssued && (certificateAmendment.dateIssued = incomingObj.dateIssued);
  incomingObj.issuingAgency && (certificateAmendment.issuingAgency = incomingObj.issuingAgency);

  certificateAmendment.legislation = postUtils.populateLegislation(incomingObj.legislation);

  incomingObj.projectName && (certificateAmendment.projectName = incomingObj.projectName);
  incomingObj.location && (certificateAmendment.location = incomingObj.location);
  incomingObj.centroid && (certificateAmendment.centroid = incomingObj.centroid);
  incomingObj.documents && (certificateAmendment.documents = incomingObj.documents);
  incomingObj.description && (certificateAmendment.description = incomingObj.description);

  // set meta
  certificateAmendment.addedBy = args.swagger.params.auth_payload.displayName;
  certificateAmendment.dateAdded = new Date();

  // set data source references
  incomingObj.sourceDateAdded && (certificateAmendment.sourceDateAdded = incomingObj.sourceDateAdded);
  incomingObj.sourceDateUpdated && (certificateAmendment.sourceDateUpdated = incomingObj.sourceDateUpdated);
  incomingObj.sourceSystemRef && (certificateAmendment.sourceSystemRef = incomingObj.sourceSystemRef);
  incomingObj.isLngPublished && (certificateAmendment.isLngPublished = incomingObj.isLngPublished);
  incomingObj.isBcmiPublished && (certificateAmendment.isBcmiPublished = incomingObj.isBcmiPublished);

  return certificateAmendment;
};

/**
 * Performs all operations necessary to create a LNG Certificate amendment record.
 *
 * Example of incomingObj
 *
 *  certificateAmendments: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'certificateAmendment',
 *      ...
 *      CertificateAmendmentLNG: {
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
 * @returns created bcmi certificate amendment record
 */
exports.createLNG = function (args, res, next, incomingObj) {
  // Confirm user has correct role for this type of record.
  if (
    !userHasValidRoles(
      [utils.ApplicationRoles.ADMIN, utils.ApplicationRoles.ADMIN_BCMI],
      args.swagger.params.auth_payload.client_roles
    )
  ) {
    throw new Error('Missing valid user role.');
  }

  let CertificateAmendmentLNG = mongoose.model('CertificateAmendmentLNG');
  let certificateAmendmentLNG = new CertificateAmendmentLNG();

  certificateAmendmentLNG._schemaName = 'CertificateAmendmentLNG';

  // set integration references
  incomingObj._epicProjectId &&
    ObjectId.isValid(incomingObj._epicProjectId) &&
    (certificateAmendmentLNG._epicProjectId = new ObjectId(incomingObj._epicProjectId));
  incomingObj._sourceRefId &&
    ObjectId.isValid(incomingObj._sourceRefId) &&
    (certificateAmendmentLNG._sourceRefId = new ObjectId(incomingObj._sourceRefId));
  incomingObj._epicMilestoneId &&
    ObjectId.isValid(incomingObj._epicMilestoneId) &&
    (certificateAmendmentLNG._epicMilestoneId = new ObjectId(incomingObj._epicMilestoneId));
  incomingObj.mineGuid && (certificateAmendmentLNG.mineGuid = incomingObj.mineGuid);

  // set permissions
  certificateAmendmentLNG.read = utils.ApplicationAdminRoles;
  certificateAmendmentLNG.write = [utils.ApplicationRoles.ADMIN, utils.ApplicationRoles.ADMIN_LNG];

  // If incoming object has addRole: 'public' then read will look like ['sysadmin', 'public']
  if (incomingObj.addRole && incomingObj.addRole === 'public') {
    certificateAmendmentLNG.read.push('public');
    certificateAmendmentLNG.datePublished = new Date();
    certificateAmendmentLNG.publishedBy = args.swagger.params.auth_payload.displayName;
  }

  // set data
  incomingObj.recordName && (certificateAmendmentLNG.recordName = incomingObj.recordName);
  certificateAmendmentLNG.recordType = 'Certificate Amendment';
  certificateAmendmentLNG.recordSubtype = 'Certificate';
  certificateAmendmentLNG.issuedTo.read = utils.ApplicationAdminRoles;
  certificateAmendmentLNG.issuedTo.write = [utils.ApplicationRoles.ADMIN, utils.ApplicationRoles.ADMIN_LNG];
  incomingObj.issuedTo &&
    incomingObj.issuedTo.type &&
    (certificateAmendmentLNG.issuedTo.type = incomingObj.issuedTo.type);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.companyName &&
    (certificateAmendmentLNG.issuedTo.companyName = incomingObj.issuedTo.companyName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.firstName &&
    (certificateAmendmentLNG.issuedTo.firstName = incomingObj.issuedTo.firstName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.middleName &&
    (certificateAmendmentLNG.issuedTo.middleName = incomingObj.issuedTo.middleName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.lastName &&
    (certificateAmendmentLNG.issuedTo.lastName = incomingObj.issuedTo.lastName);
  incomingObj.issuedTo &&
    (certificateAmendmentLNG.issuedTo.fullName = postUtils.getIssuedToFullNameValue(incomingObj.issuedTo));
  incomingObj.issuedTo &&
    incomingObj.issuedTo.dateOfBirth &&
    (certificateAmendmentLNG.issuedTo.dateOfBirth = incomingObj.issuedTo.dateOfBirth);
  incomingObj.dateIssued && (certificateAmendmentLNG.dateIssued = incomingObj.dateIssued);
  incomingObj.issuingAgency && (certificateAmendmentLNG.issuingAgency = incomingObj.issuingAgency);

  certificateAmendmentLNG.legislation = postUtils.populateLegislation(incomingObj.legislation);

  incomingObj.projectName && (certificateAmendmentLNG.projectName = incomingObj.projectName);
  incomingObj.location && (certificateAmendmentLNG.location = incomingObj.location);
  incomingObj.centroid && (certificateAmendmentLNG.centroid = incomingObj.centroid);
  incomingObj.documents && (certificateAmendmentLNG.documents = incomingObj.documents);

  incomingObj.description && (certificateAmendmentLNG.description = incomingObj.description);

  // set meta
  certificateAmendmentLNG.addedBy = args.swagger.params.auth_payload.displayName;
  certificateAmendmentLNG.dateAdded = new Date();

  // set data source references
  incomingObj.sourceDateAdded && (certificateAmendmentLNG.sourceDateAdded = incomingObj.sourceDateAdded);
  incomingObj.sourceDateUpdated && (certificateAmendmentLNG.sourceDateUpdated = incomingObj.sourceDateUpdated);
  incomingObj.sourceSystemRef && (certificateAmendmentLNG.sourceSystemRef = incomingObj.sourceSystemRef);

  return certificateAmendmentLNG;
};

/**
 * Performs all operations necessary to create a BCMI Certificate amendment record.
 *
 * Example of incomingObj
 *
 *  certificateAmendments: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'certificateAmendment',
 *      ...
 *      CertificateAmendmentBCMI: {
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
 * @returns created bcmi certificate amendment record
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

  let CertificateAmendmentBCMI = mongoose.model('CertificateAmendmentBCMI');
  let certificateAmendmentBCMI = new CertificateAmendmentBCMI();

  certificateAmendmentBCMI._schemaName = 'CertificateAmendmentBCMI';

  // set integration references
  incomingObj._epicProjectId &&
    ObjectId.isValid(incomingObj._epicProjectId) &&
    (certificateAmendmentBCMI._epicProjectId = new ObjectId(incomingObj._epicProjectId));
  incomingObj._sourceRefId &&
    ObjectId.isValid(incomingObj._sourceRefId) &&
    (certificateAmendmentBCMI._sourceRefId = new ObjectId(incomingObj._sourceRefId));
  incomingObj._epicMilestoneId &&
    ObjectId.isValid(incomingObj._epicMilestoneId) &&
    (certificateAmendmentBCMI._epicMilestoneId = new ObjectId(incomingObj._epicMilestoneId));
  incomingObj.mineGuid && (certificateAmendmentBCMI.mineGuid = incomingObj.mineGuid);
  incomingObj.collectionId &&
    ObjectId.isValid(incomingObj.collectionId) &&
    (certificateAmendmentBCMI.collectionId = new ObjectId(incomingObj.collectionId));
  incomingObj._master &&
    ObjectId.isValid(incomingObj._master) &&
    (certificateAmendmentBCMI._master = new ObjectId(incomingObj._master));

  // set permissions
  certificateAmendmentBCMI.read = utils.ApplicationAdminRoles;
  certificateAmendmentBCMI.write = [utils.ApplicationRoles.ADMIN, utils.ApplicationRoles.ADMIN_BCMI];

  // If incoming object has addRole: 'public' then read will look like ['sysadmin', 'public']
  if (incomingObj.addRole && incomingObj.addRole === 'public') {
    certificateAmendmentBCMI.read.push('public');
    certificateAmendmentBCMI.datePublished = new Date();
    certificateAmendmentBCMI.publishedBy = args.swagger.params.auth_payload.displayName;
  }

  // set data
  incomingObj.recordName && (certificateAmendmentBCMI.recordName = incomingObj.recordName);
  certificateAmendmentBCMI.recordType = 'Certificate Amendment';
  certificateAmendmentBCMI.recordSubtype = 'Certificate';
  certificateAmendmentBCMI.issuedTo.read = utils.ApplicationAdminRoles;
  certificateAmendmentBCMI.issuedTo.write = [utils.ApplicationRoles.ADMIN, utils.ApplicationRoles.ADMIN_BCMI];
  incomingObj.issuedTo &&
    incomingObj.issuedTo.type &&
    (certificateAmendmentBCMI.issuedTo.type = incomingObj.issuedTo.type);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.companyName &&
    (certificateAmendmentBCMI.issuedTo.companyName = incomingObj.issuedTo.companyName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.firstName &&
    (certificateAmendmentBCMI.issuedTo.firstName = incomingObj.issuedTo.firstName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.middleName &&
    (certificateAmendmentBCMI.issuedTo.middleName = incomingObj.issuedTo.middleName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.lastName &&
    (certificateAmendmentBCMI.issuedTo.lastName = incomingObj.issuedTo.lastName);
  incomingObj.issuedTo &&
    (certificateAmendmentBCMI.issuedTo.fullName = postUtils.getIssuedToFullNameValue(incomingObj.issuedTo));
  incomingObj.issuedTo &&
    incomingObj.issuedTo.dateOfBirth &&
    (certificateAmendmentBCMI.issuedTo.dateOfBirth = incomingObj.issuedTo.dateOfBirth);
  incomingObj.dateIssued && (certificateAmendmentBCMI.dateIssued = incomingObj.dateIssued);
  incomingObj.issuingAgency && (certificateAmendmentBCMI.issuingAgency = incomingObj.issuingAgency);

  certificateAmendmentBCMI.legislation = postUtils.populateLegislation(incomingObj.legislation);

  incomingObj.projectName && (certificateAmendmentBCMI.projectName = incomingObj.projectName);
  incomingObj.location && (certificateAmendmentBCMI.location = incomingObj.location);
  incomingObj.centroid && (certificateAmendmentBCMI.centroid = incomingObj.centroid);
  incomingObj.documents && (certificateAmendmentBCMI.documents = incomingObj.documents);

  incomingObj.description && (certificateAmendmentBCMI.description = incomingObj.description);

  // set meta
  certificateAmendmentBCMI.addedBy = args.swagger.params.auth_payload.displayName;
  certificateAmendmentBCMI.dateAdded = new Date();

  // set data source references
  incomingObj.sourceDateAdded && (certificateAmendmentBCMI.sourceDateAdded = incomingObj.sourceDateAdded);
  incomingObj.sourceDateUpdated && (certificateAmendmentBCMI.sourceDateUpdated = incomingObj.sourceDateUpdated);
  incomingObj.sourceSystemRef && (certificateAmendmentBCMI.sourceSystemRef = incomingObj.sourceSystemRef);

  return certificateAmendmentBCMI;
};
