const mongoose = require('mongoose');
const ObjectId = require('mongoose').Types.ObjectId;
const postUtils = require('../../utils/post-utils');
const { userHasValidRoles } = require('../../utils/auth-utils');
const utils = require('../../utils/constants/misc');

/**
 * Performs all operations necessary to create a master correspondence record and its associated flavour records.
 *
 * Example of incomingObj
 *
 *  correspondences: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'correspondence',
 *      ...
 *      correspondenceBCMI: {
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
    CorrespondenceBCMI: this.createBCMI,
    CorrespondenceNRCED: this.createNRCED
  }
  return await postUtils.createRecordWithFlavours(args, res, next, incomingObj, this.createMaster, flavourFunctions);
};

/**
 * Performs all operations necessary to create a master Correspondence record.
 *
 * Example of incomingObj
 *
 *  correspondence: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'correspondence',
 *      ...
 *      correspondenceBCMI: {
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
  let Correspondence = mongoose.model('Correspondence');
  let correspondence = new Correspondence();

  correspondence._schemaName = 'Correspondence';
  // set integration references
  incomingObj._epicProjectId &&
    ObjectId.isValid(incomingObj._epicProjectId) &&
    (correspondence._epicProjectId = new ObjectId(incomingObj._epicProjectId));
  incomingObj._sourceRefId &&
    ObjectId.isValid(incomingObj._sourceRefId) &&
    (correspondence._sourceRefId = new ObjectId(incomingObj._sourceRefId));
  incomingObj._epicMilestoneId &&
    ObjectId.isValid(incomingObj._epicMilestoneId) &&
    (correspondence._epicMilestoneId = new ObjectId(incomingObj._epicMilestoneId));
  incomingObj.mineGuid &&
    (correspondence.mineGuid = incomingObj.mineGuid);
  incomingObj.collectionId &&
    ObjectId.isValid(incomingObj.collectionId) &&
    (correspondence.collectionId = new ObjectId(incomingObj.collectionId));

  // set permissions
  correspondence.read = utils.ApplicationAdminRoles;
  correspondence.write = utils.ApplicationAdminRoles;

  // set forward references
  if (flavourIds && flavourIds.length) {
    flavourIds.forEach(id => {
      if (ObjectId.isValid(id)) {
        correspondence._flavourRecords.push(new ObjectId(id));
      }
    });
  }

  // set data
  incomingObj.recordName && (correspondence.recordName = incomingObj.recordName);
  correspondence.recordType = 'Correspondence';
  correspondence.issuedTo.read = utils.ApplicationAdminRoles;
  correspondence.issuedTo.write = utils.ApplicationAdminRoles;
  incomingObj.issuedTo && incomingObj.issuedTo.type && (correspondence.issuedTo.type = incomingObj.issuedTo.type);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.companyName &&
    (correspondence.issuedTo.companyName = incomingObj.issuedTo.companyName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.firstName &&
    (correspondence.issuedTo.firstName = incomingObj.issuedTo.firstName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.middleName &&
    (correspondence.issuedTo.middleName = incomingObj.issuedTo.middleName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.lastName &&
    (correspondence.issuedTo.lastName = incomingObj.issuedTo.lastName);
  incomingObj.issuedTo && (correspondence.issuedTo.fullName = postUtils.getIssuedToFullNameValue(incomingObj.issuedTo));
  incomingObj.issuedTo &&
    incomingObj.issuedTo.dateOfBirth &&
    (correspondence.issuedTo.dateOfBirth = incomingObj.issuedTo.dateOfBirth);
  incomingObj.dateIssued && (correspondence.dateIssued = incomingObj.dateIssued);
  incomingObj.issuingAgency && (correspondence.issuingAgency = incomingObj.issuingAgency);

  correspondence.legislation = postUtils.populateLegislation(incomingObj.legislation);

  incomingObj.projectName && (correspondence.projectName = incomingObj.projectName);
  incomingObj.location && (correspondence.location = incomingObj.location);
  incomingObj.centroid && (correspondence.centroid = incomingObj.centroid);
  incomingObj.documents && (correspondence.documents = incomingObj.documents);
  incomingObj.description && (correspondence.description = incomingObj.description);

  // set meta
  correspondence.addedBy = args.swagger.params.auth_payload.displayName;
  correspondence.dateAdded = new Date();

  // set data source references
  incomingObj.sourceDateAdded && (correspondence.sourceDateAdded = incomingObj.sourceDateAdded);
  incomingObj.sourceDateUpdated && (correspondence.sourceDateUpdated = incomingObj.sourceDateUpdated);
  incomingObj.sourceSystemRef && (correspondence.sourceSystemRef = incomingObj.sourceSystemRef);
  incomingObj.isBcmiPublished && (correspondence.isBcmiPublished = incomingObj.isBcmiPublished);
  incomingObj.isNrcedPublished && (correspondence.isNrcedPublished = incomingObj.isNrcedPublished);

  return correspondence;
};

/**
 * Performs all operations necessary to create a BCMI Correspondence record.
 *
 * Example of incomingObj
 *
 *  Correspondences: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'Correspondence',
 *      ...
 *      CorrespondenceBCMI: {
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
 * @returns created bcmi Correspondence record
 */
exports.createBCMI = function (args, res, next, incomingObj) {
  // Confirm user has correct role for this type of record.
  if (!userHasValidRoles([utils.ApplicationRoles.ADMIN, utils.ApplicationRoles.ADMIN_BCMI], args.swagger.params.auth_payload.realm_access.roles)) {
    throw new Error('Missing valid user role.');
  }

  let CorrespondenceBCMI = mongoose.model('CorrespondenceBCMI');
  let correspondenceBCMI = new CorrespondenceBCMI();

  correspondenceBCMI._schemaName = 'CorrespondenceBCMI';

  // set integration references
  incomingObj._epicProjectId &&
    ObjectId.isValid(incomingObj._epicProjectId) &&
    (correspondenceBCMI._epicProjectId = new ObjectId(incomingObj._epicProjectId));
  incomingObj._sourceRefId &&
    ObjectId.isValid(incomingObj._sourceRefId) &&
    (correspondenceBCMI._sourceRefId = new ObjectId(incomingObj._sourceRefId));
  incomingObj._epicMilestoneId &&
    ObjectId.isValid(incomingObj._epicMilestoneId) &&
    (correspondenceBCMI._epicMilestoneId = new ObjectId(incomingObj._epicMilestoneId));
  incomingObj.mineGuid &&
    (correspondenceBCMI.mineGuid = incomingObj.mineGuid);
  incomingObj.collectionId &&
    ObjectId.isValid(incomingObj.collectionId) &&
    (correspondenceBCMI.collectionId = new ObjectId(incomingObj.collectionId));
  incomingObj._master &&
    ObjectId.isValid(incomingObj._master) &&
    (correspondenceBCMI._master = new ObjectId(incomingObj._master));

  // set permissions
  correspondenceBCMI.read = utils.ApplicationAdminRoles;
  correspondenceBCMI.write = [utils.ApplicationRoles.ADMIN, utils.ApplicationRoles.ADMIN_BCMI];

  // If incoming object has addRole: 'public' then read will look like ['sysadmin', 'public']
  if (incomingObj.addRole && incomingObj.addRole === 'public') {
    correspondenceBCMI.read.push('public');
    correspondenceBCMI.datePublished = new Date();
    correspondenceBCMI.publishedBy = args.swagger.params.auth_payload.displayName;
  }

  // set data
  incomingObj.recordName && (correspondenceBCMI.recordName = incomingObj.recordName);
  correspondenceBCMI.recordType = 'Correspondence';
  correspondenceBCMI.issuedTo.read = utils.ApplicationAdminRoles;
  correspondenceBCMI.issuedTo.write = [utils.ApplicationRoles.ADMIN, utils.ApplicationRoles.ADMIN_BCMI];
  incomingObj.issuedTo && incomingObj.issuedTo.type && (correspondenceBCMI.issuedTo.type = incomingObj.issuedTo.type);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.companyName &&
    (correspondenceBCMI.issuedTo.companyName = incomingObj.issuedTo.companyName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.firstName &&
    (correspondenceBCMI.issuedTo.firstName = incomingObj.issuedTo.firstName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.middleName &&
    (correspondenceBCMI.issuedTo.middleName = incomingObj.issuedTo.middleName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.lastName &&
    (correspondenceBCMI.issuedTo.lastName = incomingObj.issuedTo.lastName);
  incomingObj.issuedTo && (correspondenceBCMI.issuedTo.fullName = postUtils.getIssuedToFullNameValue(incomingObj.issuedTo));
  incomingObj.issuedTo &&
    incomingObj.issuedTo.dateOfBirth &&
    (correspondenceBCMI.issuedTo.dateOfBirth = incomingObj.issuedTo.dateOfBirth);
  incomingObj.dateIssued && (correspondenceBCMI.dateIssued = incomingObj.dateIssued);
  incomingObj.issuingAgency && (correspondenceBCMI.issuingAgency = incomingObj.issuingAgency);

  correspondenceBCMI.legislation = postUtils.populateLegislation(incomingObj.legislation);

  incomingObj.projectName && (correspondenceBCMI.projectName = incomingObj.projectName);
  incomingObj.location && (correspondenceBCMI.location = incomingObj.location);
  incomingObj.centroid && (correspondenceBCMI.centroid = incomingObj.centroid);
  incomingObj.documents && (correspondenceBCMI.documents = incomingObj.documents);
  incomingObj.description && (correspondenceBCMI.description = incomingObj.description);

  // set meta
  correspondenceBCMI.addedBy = args.swagger.params.auth_payload.displayName;
  correspondenceBCMI.dateAdded = new Date();

  // set data source references
  incomingObj.sourceDateAdded && (correspondenceBCMI.sourceDateAdded = incomingObj.sourceDateAdded);
  incomingObj.sourceDateUpdated && (correspondenceBCMI.sourceDateUpdated = incomingObj.sourceDateUpdated);
  incomingObj.sourceSystemRef && (correspondenceBCMI.sourceSystemRef = incomingObj.sourceSystemRef);

  return correspondenceBCMI;
};


/**
 * Performs all operations necessary to create a nrced Correspondence record.
 *
 * Example of incomingObj
 *
 *  Correspondences: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'Correspondence',
 *      ...
 *      CorrespondenceNRCED: {
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
 * @returns created bcmi Correspondence record
 */
exports.createNRCED = function (args, res, next, incomingObj) {
  // Confirm user has correct role for this type of record.
  if (!userHasValidRoles([utils.ApplicationRoles.ADMIN, utils.ApplicationRoles.ADMIN_BCMI], args.swagger.params.auth_payload.realm_access.roles)) {
    throw new Error('Missing valid user role.');
  }

  let CorrespondenceNRCED = mongoose.model('CorrespondenceNRCED');
  let correspondenceNRCED = new CorrespondenceNRCED();

  correspondenceNRCED._schemaName = 'CorrespondenceNRCED';

  // set integration references
  incomingObj._epicProjectId &&
    ObjectId.isValid(incomingObj._epicProjectId) &&
    (correspondenceNRCED._epicProjectId = new ObjectId(incomingObj._epicProjectId));
  incomingObj._sourceRefId &&
    ObjectId.isValid(incomingObj._sourceRefId) &&
    (correspondenceNRCED._sourceRefId = new ObjectId(incomingObj._sourceRefId));
  incomingObj._epicMilestoneId &&
    ObjectId.isValid(incomingObj._epicMilestoneId) &&
    (correspondenceNRCED._epicMilestoneId = new ObjectId(incomingObj._epicMilestoneId));
  incomingObj.mineGuid &&
    (correspondenceNRCED.mineGuid = incomingObj.mineGuid);

  // set permissions
  correspondenceNRCED.read = utils.ApplicationAdminRoles;
  correspondenceNRCED.write = [utils.ApplicationRoles.ADMIN, utils.ApplicationRoles.ADMIN_BCMI];

  // If incoming object has addRole: 'public' then read will look like ['sysadmin', 'public']
  if (incomingObj.addRole && incomingObj.addRole === 'public') {
    correspondenceNRCED.read.push('public');
    correspondenceNRCED.datePublished = new Date();
    correspondenceNRCED.publishedBy = args.swagger.params.auth_payload.displayName;
  }

  // set data
  incomingObj.recordName && (correspondenceNRCED.recordName = incomingObj.recordName);
  correspondenceNRCED.recordType = 'Correspondence';
  correspondenceNRCED.issuedTo.read = utils.ApplicationAdminRoles;
  correspondenceNRCED.issuedTo.write = [utils.ApplicationRoles.ADMIN, utils.ApplicationRoles.ADMIN_BCMI];
  incomingObj.issuedTo && incomingObj.issuedTo.type && (correspondenceNRCED.issuedTo.type = incomingObj.issuedTo.type);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.companyName &&
    (correspondenceNRCED.issuedTo.companyName = incomingObj.issuedTo.companyName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.firstName &&
    (correspondenceNRCED.issuedTo.firstName = incomingObj.issuedTo.firstName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.middleName &&
    (correspondenceNRCED.issuedTo.middleName = incomingObj.issuedTo.middleName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.lastName &&
    (correspondenceNRCED.issuedTo.lastName = incomingObj.issuedTo.lastName);
  incomingObj.issuedTo && (correspondenceNRCED.issuedTo.fullName = postUtils.getIssuedToFullNameValue(incomingObj.issuedTo));
  incomingObj.issuedTo &&
    incomingObj.issuedTo.dateOfBirth &&
    (correspondenceNRCED.issuedTo.dateOfBirth = incomingObj.issuedTo.dateOfBirth);
  incomingObj.dateIssued && (correspondenceNRCED.dateIssued = incomingObj.dateIssued);
  incomingObj.issuingAgency && (correspondenceNRCED.issuingAgency = incomingObj.issuingAgency);

  correspondenceNRCED.legislation = postUtils.populateLegislation(incomingObj.legislation);

  incomingObj.projectName && (correspondenceNRCED.projectName = incomingObj.projectName);
  incomingObj.location && (correspondenceNRCED.location = incomingObj.location);
  incomingObj.centroid && (correspondenceNRCED.centroid = incomingObj.centroid);
  incomingObj.documents && (correspondenceNRCED.documents = incomingObj.documents);
  incomingObj.description && (correspondenceNRCED.description = incomingObj.description);

  // set meta
  correspondenceNRCED.addedBy = args.swagger.params.auth_payload.displayName;
  correspondenceNRCED.dateAdded = new Date();

  // set data source references
  incomingObj.sourceDateAdded && (correspondenceNRCED.sourceDateAdded = incomingObj.sourceDateAdded);
  incomingObj.sourceDateUpdated && (correspondenceNRCED.sourceDateUpdated = incomingObj.sourceDateUpdated);
  incomingObj.sourceSystemRef && (correspondenceNRCED.sourceSystemRef = incomingObj.sourceSystemRef);

  return correspondenceNRCED;
};
