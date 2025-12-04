const mongoose = require('mongoose');
const ObjectId = require('mongoose').Types.ObjectId;
const postUtils = require('../../utils/post-utils');
const { userHasValidRoles } = require('../../utils/auth-utils');
const utils = require('../../utils/constants/misc');

/**
 * Performs all operations necessary to create a master Certificate record and its associated flavour records.
 *
 * Example of incomingObj
 *
 *  certificates: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'certificate',
 *      ...
 *      CertificateLNG: {
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
exports.createItem = async function(args, res, next, incomingObj) {
  const flavourFunctions = {
    CertificateBCMI: this.createBCMI,
    CertificateLNG: this.createLNG
  };
  return await postUtils.createRecordWithFlavours(args, res, next, incomingObj, this.createMaster, flavourFunctions);
};

/**
 * Performs all operations necessary to create a master Certificate record.
 *
 * Example of incomingObj
 *
 *  certificates: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'certificate',
 *      ...
 *      CertificateLNG: {
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
 * @returns created master certificate record
 */
exports.createMaster = function(args, res, next, incomingObj, flavourIds) {
  let Certificate = mongoose.model('Certificate');
  let certificate = new Certificate();

  certificate._schemaName = 'Certificate';

  // set integration references
  incomingObj._epicProjectId &&
    ObjectId.isValid(incomingObj._epicProjectId) &&
    (certificate._epicProjectId = new ObjectId(incomingObj._epicProjectId));
  incomingObj._sourceRefId &&
    ObjectId.isValid(incomingObj._sourceRefId) &&
    (certificate._sourceRefId = new ObjectId(incomingObj._sourceRefId));
  incomingObj._epicMilestoneId &&
    ObjectId.isValid(incomingObj._epicMilestoneId) &&
    (certificate._epicMilestoneId = new ObjectId(incomingObj._epicMilestoneId));
  incomingObj.collectionId &&
    ObjectId.isValid(incomingObj.collectionId) &&
    (certificate.collectionId = new ObjectId(incomingObj.collectionId));

  // set permissions
  certificate.read = utils.ApplicationAdminRoles;
  certificate.write = utils.ApplicationAdminRoles;

  // set forward references
  if (flavourIds && flavourIds.length) {
    flavourIds.forEach(id => {
      if (ObjectId.isValid(id)) {
        certificate._flavourRecords.push(new ObjectId(id));
      }
    });
  }

  // set data
  incomingObj.recordName && (certificate.recordName = incomingObj.recordName);
  certificate.recordType = 'Certificate';
  incomingObj.recordSubtype && (certificate.recordSubtype = incomingObj.recordSubtype);
  incomingObj.dateIssued && (certificate.dateIssued = incomingObj.dateIssued);
  incomingObj.issuingAgency && (certificate.issuingAgency = incomingObj.issuingAgency);

  certificate.legislation = postUtils.populateLegislation(incomingObj.legislation);

  incomingObj.projectName && (certificate.projectName = incomingObj.projectName);
  incomingObj.location && (certificate.location = incomingObj.location);
  incomingObj.centroid && (certificate.centroid = incomingObj.centroid);
  incomingObj.documents && (certificate.documents = incomingObj.documents);

  // set meta
  certificate.addedBy = args.swagger.params.auth_payload.displayName;
  certificate.dateAdded = new Date();

  // set data source references
  incomingObj.sourceDateAdded && (certificate.sourceDateAdded = incomingObj.sourceDateAdded);
  incomingObj.sourceDateUpdated && (certificate.sourceDateUpdated = incomingObj.sourceDateUpdated);
  incomingObj.sourceSystemRef && (certificate.sourceSystemRef = incomingObj.sourceSystemRef);
  incomingObj.isLngPublished && (certificate.isLngPublished = incomingObj.isLngPublished);

  return certificate;
};

/**
 * Performs all operations necessary to create a LNG Certificate record.
 *
 * Example of incomingObj
 *
 *  certificates: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'certificate',
 *      ...
 *      CertificateLNG: {
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
 * @returns created lng certificate record
 */
exports.createLNG = function(args, res, next, incomingObj) {
  // Confirm user has correct role for this type of record.
  if (
    !userHasValidRoles(
      [utils.ApplicationRoles.ADMIN, utils.ApplicationRoles.ADMIN_LNG],
      args.swagger.params.auth_payload.client_roles
    )
  ) {
    throw new Error('Missing valid user role.');
  }

  let CertificateLNG = mongoose.model('CertificateLNG');
  let certificateLNG = new CertificateLNG();

  certificateLNG._schemaName = 'CertificateLNG';

  // set integration references
  incomingObj._epicProjectId &&
    ObjectId.isValid(incomingObj._epicProjectId) &&
    (certificateLNG._epicProjectId = new ObjectId(incomingObj._epicProjectId));
  incomingObj._sourceRefId &&
    ObjectId.isValid(incomingObj._sourceRefId) &&
    (certificateLNG._sourceRefId = new ObjectId(incomingObj._sourceRefId));
  incomingObj._epicMilestoneId &&
    ObjectId.isValid(incomingObj._epicMilestoneId) &&
    (certificateLNG._epicMilestoneId = new ObjectId(incomingObj._epicMilestoneId));

  // set permissions and meta
  certificateLNG.read = utils.ApplicationAdminRoles;
  certificateLNG.write = [utils.ApplicationRoles.ADMIN, utils.ApplicationRoles.ADMIN_LNG];

  // If incoming object has addRole: 'public' then read will look like ['sysadmin', 'public']
  if (incomingObj.addRole && incomingObj.addRole === 'public') {
    certificateLNG.read.push('public');
    certificateLNG.datePublished = new Date();
    certificateLNG.publishedBy = args.swagger.params.auth_payload.displayName;
  }

  certificateLNG.addedBy = args.swagger.params.auth_payload.displayName;
  certificateLNG.dateAdded = new Date();

  // set master data
  incomingObj.recordName && (certificateLNG.recordName = incomingObj.recordName);
  certificateLNG.recordType = 'Certificate';
  incomingObj.recordSubtype && (certificateLNG.recordSubtype = incomingObj.recordSubtype);
  incomingObj.dateIssued && (certificateLNG.dateIssued = incomingObj.dateIssued);
  incomingObj.issuingAgency && (certificateLNG.issuingAgency = incomingObj.issuingAgency);

  certificateLNG.legislation = postUtils.populateLegislation(incomingObj.legislation);

  incomingObj.projectName && (certificateLNG.projectName = incomingObj.projectName);
  incomingObj.location && (certificateLNG.location = incomingObj.location);
  incomingObj.centroid && (certificateLNG.centroid = incomingObj.centroid);
  incomingObj.documents && (certificateLNG.documents = incomingObj.documents);

  // set flavour data
  incomingObj.description && (certificateLNG.description = incomingObj.description);

  // set data source references
  incomingObj.sourceDateAdded && (certificateLNG.sourceDateAdded = incomingObj.sourceDateAdded);
  incomingObj.sourceDateUpdated && (certificateLNG.sourceDateUpdated = incomingObj.sourceDateUpdated);
  incomingObj.sourceSystemRef && (certificateLNG.sourceSystemRef = incomingObj.sourceSystemRef);

  return certificateLNG;
};

exports.createBCMI = function(args, res, next, incomingObj) {
  // Confirm user has correct role for this type of record.
  if (
    !userHasValidRoles(
      [utils.ApplicationRoles.ADMIN, utils.ApplicationRoles.ADMIN_BCMI],
      args.swagger.params.auth_payload.client_roles
    )
  ) {
    throw new Error('Missing valid user role.');
  }

  let CertificateBCMI = mongoose.model('CertificateBCMI');
  let certificateBCMI = new CertificateBCMI();

  certificateBCMI._schemaName = 'CertificateBCMI';

  // set integration references
  incomingObj._epicProjectId &&
    ObjectId.isValid(incomingObj._epicProjectId) &&
    (certificateBCMI._epicProjectId = new ObjectId(incomingObj._epicProjectId));
  incomingObj._sourceRefId &&
    ObjectId.isValid(incomingObj._sourceRefId) &&
    (certificateBCMI._sourceRefId = new ObjectId(incomingObj._sourceRefId));
  incomingObj._epicMilestoneId &&
    ObjectId.isValid(incomingObj._epicMilestoneId) &&
    (certificateBCMI._epicMilestoneId = new ObjectId(incomingObj._epicMilestoneId));
  incomingObj.mineGuid && (certificateBCMI.mineGuid = incomingObj.mineGuid);

  // set permissions and meta
  certificateBCMI.read = utils.ApplicationAdminRoles;
  certificateBCMI.write = [utils.ApplicationRoles.ADMIN, utils.ApplicationRoles.ADMIN_BCMI];

  // If incoming object has addRole: 'public' then read will look like ['sysadmin', 'public']
  if (incomingObj.addRole && incomingObj.addRole === 'public') {
    certificateBCMI.read.push('public');
    certificateBCMI.datePublished = new Date();
    certificateBCMI.publishedBy = args.swagger.params.auth_payload.displayName;
  }

  certificateBCMI.addedBy = args.swagger.params.auth_payload.displayName;
  certificateBCMI.dateAdded = new Date();

  // set master data
  incomingObj.recordName && (certificateBCMI.recordName = incomingObj.recordName);
  certificateBCMI.recordType = 'Certificate';
  incomingObj.recordSubtype && (certificateBCMI.recordSubtype = incomingObj.recordSubtype);
  incomingObj.dateIssued && (certificateBCMI.dateIssued = incomingObj.dateIssued);
  incomingObj.issuingAgency && (certificateBCMI.issuingAgency = incomingObj.issuingAgency);

  certificateBCMI.legislation = postUtils.populateLegislation(incomingObj.legislation);

  incomingObj.projectName && (certificateBCMI.projectName = incomingObj.projectName);
  incomingObj.location && (certificateBCMI.location = incomingObj.location);
  incomingObj.centroid && (certificateBCMI.centroid = incomingObj.centroid);
  incomingObj.documents && (certificateBCMI.documents = incomingObj.documents);

  // set flavour data
  incomingObj.description && (certificateBCMI.description = incomingObj.description);

  // set data source references
  incomingObj.sourceDateAdded && (certificateBCMI.sourceDateAdded = incomingObj.sourceDateAdded);
  incomingObj.sourceDateUpdated && (certificateBCMI.sourceDateUpdated = incomingObj.sourceDateUpdated);
  incomingObj.sourceSystemRef && (certificateBCMI.sourceSystemRef = incomingObj.sourceSystemRef);

  return certificateBCMI;
};
