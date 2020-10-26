const mongoose = require('mongoose');
const ObjectId = require('mongoose').Types.ObjectId;
const postUtils = require('../../utils/post-utils');
const { userHasValidRoles } = require('../../utils/auth-utils');
const utils = require('../../utils/constants/misc');

/**
 * Performs all operations necessary to create a master Permit record and its associated flavour records.
 *
 * Example of incomingObj
 *
 *  permits: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'permit',
 *      ...
 *      PermitLNG: {
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
    PermitLNG: this.createLNG,
    PermitBCMI: this.createBCMI,
  }
  return await postUtils.createRecordWithFlavours(args, res, next, incomingObj, this.createMaster, flavourFunctions);
};

/**
 * Performs all operations necessary to create a master Permit record.
 *
 * Example of incomingObj
 *
 *  permits: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'permit',
 *      ...
 *      PermitLNG: {
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
 * @returns created master permit record
 */
exports.createMaster = function (args, res, next, incomingObj, flavourIds) {
  let Permit = mongoose.model('Permit');
  let permit = new Permit();

  permit._schemaName = 'Permit';

  // set integration references
  incomingObj._epicProjectId &&
    ObjectId.isValid(incomingObj._epicProjectId) &&
    (permit._epicProjectId = new ObjectId(incomingObj._epicProjectId));
  incomingObj._epicMilestoneId &&
    ObjectId.isValid(incomingObj._epicMilestoneId) &&
    (permit._epicMilestoneId = new ObjectId(incomingObj._epicMilestoneId));
  incomingObj._sourceRefId && (permit._sourceRefId = incomingObj._sourceRefId);
  incomingObj._sourceDocumentRefId && (permit._sourceDocumentRefId = incomingObj._sourceDocumentRefId);
  incomingObj.collectionId &&
    ObjectId.isValid(incomingObj.collectionId) &&
    (permit.collectionId = new ObjectId(incomingObj.collectionId));

  // set permissions
  permit.read = utils.ApplicationAdminRoles;
  permit.write = utils.ApplicationAdminRoles;

  // set forward references
  if (flavourIds && flavourIds.length) {
    flavourIds.forEach(id => {
      if (ObjectId.isValid(id)) {
        permit._flavourRecords.push(new ObjectId(id));
      }
    });
  }

  // set data
  incomingObj.recordName && (permit.recordName = incomingObj.recordName);
  permit.recordType = 'Permit';
  incomingObj.recordSubtype && (permit.recordSubtype = incomingObj.recordSubtype);
  incomingObj.dateIssued && (permit.dateIssued = incomingObj.dateIssued);
  incomingObj.issuingAgency && (permit.issuingAgency = incomingObj.issuingAgency);
  incomingObj.issuedTo && (permit.issuedTo = incomingObj.issuedTo);
  incomingObj.legislation && incomingObj.legislation.act && (permit.legislation.act = incomingObj.legislation.act);
  incomingObj.legislation &&
    incomingObj.legislation.regulation &&
    (permit.legislation.regulation = incomingObj.legislation.regulation);
  incomingObj.legislation &&
    incomingObj.legislation.section &&
    (permit.legislation.section = incomingObj.legislation.section);
  incomingObj.legislation &&
    incomingObj.legislation.subSection &&
    (permit.legislation.subSection = incomingObj.legislation.subSection);
  incomingObj.legislation &&
    incomingObj.legislation.paragraph &&
    (permit.legislation.paragraph = incomingObj.legislation.paragraph);
  incomingObj.legislationDescription && (permit.legislationDescription = incomingObj.legislationDescription);
  incomingObj.projectName && (permit.projectName = incomingObj.projectName);
  incomingObj.location && (permit.location = incomingObj.location);
  incomingObj.centroid && (permit.centroid = incomingObj.centroid);
  incomingObj.documents && (permit.documents = incomingObj.documents);

  incomingObj.mineGuid && (permit.mineGuid = incomingObj.mineGuid);
  incomingObj.permitNumber && (permit.permitNumber = incomingObj.permitNumber);
  incomingObj.status && (permit.status = incomingObj.status);

  incomingObj.permitStatusCode && (permit.permitStatusCode = incomingObj.permitStatusCode);
  incomingObj.amendmentStatusCode && (permit.amendmentStatusCode = incomingObj.amendmentStatusCode);
  incomingObj.typeCode && (permit.status = incomingObj.typeCode);
  ObjectId.isValid(incomingObj.originalPermit) &&
    incomingObj.originalPermit &&
    (permit.originalPermit = new ObjectId(incomingObj.originalPermit));

  // set meta
  permit.addedBy = args.swagger.params.auth_payload.displayName;
  permit.dateAdded = new Date();

  // set data source references
  incomingObj.sourceDateAdded && (permit.sourceDateAdded = incomingObj.sourceDateAdded);
  incomingObj.sourceDateUpdated && (permit.sourceDateUpdated = incomingObj.sourceDateUpdated);
  incomingObj.sourceSystemRef && (permit.sourceSystemRef = incomingObj.sourceSystemRef);
  incomingObj.isLngPublished && (permit.isLngPublished = incomingObj.isLngPublished);
  incomingObj.isBcmiPublished && (permit.isBcmiPublished = incomingObj.isBcmiPublished);

  return permit;
};

/**
 * Performs all operations necessary to create a LNG Permit record.
 *
 * Example of incomingObj
 *
 *  permits: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'permit',
 *      ...
 *      PermitLNG: {
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
 * @returns created lng permit record
 */
exports.createLNG = function (args, res, next, incomingObj) {
  // Confirm user has correct role for this type of record.
  if (!userHasValidRoles([utils.ApplicationRoles.ADMIN, utils.ApplicationRoles.ADMIN_LNG], args.swagger.params.auth_payload.realm_access.roles)) {
    throw new Error('Missing valid user role.');
  }

  let PermitLNG = mongoose.model('PermitLNG');
  let permitLNG = new PermitLNG();

  permitLNG._schemaName = 'PermitLNG';

  // set integration references
  incomingObj._epicProjectId &&
    ObjectId.isValid(incomingObj._epicProjectId) &&
    (permitLNG._epicProjectId = new ObjectId(incomingObj._epicProjectId));
  incomingObj._sourceRefId &&
    ObjectId.isValid(incomingObj._sourceRefId) &&
    (permitLNG._sourceRefId = new ObjectId(incomingObj._sourceRefId));
  incomingObj._epicMilestoneId &&
    ObjectId.isValid(incomingObj._epicMilestoneId) &&
    (permitLNG._epicMilestoneId = new ObjectId(incomingObj._epicMilestoneId));

  // set permissions and meta
  permitLNG.read = utils.ApplicationAdminRoles;
  permitLNG.write = [utils.ApplicationRoles.ADMIN, utils.ApplicationRoles.ADMIN_LNG];

  // If incoming object has addRole: 'public' then read will look like ['sysadmin', 'public']
  if (incomingObj.addRole && incomingObj.addRole === 'public') {
    permitLNG.read.push('public');
    permitLNG.datePublished = new Date();
    permitLNG.publishedBy = args.swagger.params.auth_payload.displayName;
  }

  permitLNG.addedBy = args.swagger.params.auth_payload.displayName;
  permitLNG.dateAdded = new Date();

  // set master data
  incomingObj.recordName && (permitLNG.recordName = incomingObj.recordName);
  permitLNG.recordType = 'Permit';
  incomingObj.recordSubtype && (permitLNG.recordSubtype = incomingObj.recordSubtype);
  incomingObj.dateIssued && (permitLNG.dateIssued = incomingObj.dateIssued);
  incomingObj.issuingAgency && (permitLNG.issuingAgency = incomingObj.issuingAgency);
  incomingObj.issuedTo && (permitLNG.issuedTo = incomingObj.issuedTo);
  incomingObj.legislation && incomingObj.legislation.act && (permitLNG.legislation.act = incomingObj.legislation.act);
  incomingObj.legislation &&
    incomingObj.legislation.regulation &&
    (permitLNG.legislation.regulation = incomingObj.legislation.regulation);
  incomingObj.legislation &&
    incomingObj.legislation.section &&
    (permitLNG.legislation.section = incomingObj.legislation.section);
  incomingObj.legislation &&
    incomingObj.legislation.subSection &&
    (permitLNG.legislation.subSection = incomingObj.legislation.subSection);
  incomingObj.legislation &&
    incomingObj.legislation.paragraph &&
    (permitLNG.legislation.paragraph = incomingObj.legislation.paragraph);
  incomingObj.legislationDescription && (permitLNG.legislationDescription = incomingObj.legislationDescription);
  incomingObj.projectName && (permitLNG.projectName = incomingObj.projectName);
  incomingObj.location && (permitLNG.location = incomingObj.location);
  incomingObj.centroid && (permitLNG.centroid = incomingObj.centroid);
  incomingObj.documents && (permitLNG.documents = incomingObj.documents);

  incomingObj.permitStatusCode && (permitLNG.permitStatusCode = incomingObj.permitStatusCode);
  incomingObj.amendmentStatusCode && (permitLNG.amendmentStatusCode = incomingObj.amendmentStatusCode);
  incomingObj.typeCode && (permitLNG.status = incomingObj.typeCode);
  ObjectId.isValid(incomingObj.originalPermit) &&
    incomingObj.originalPermit &&
    (permitLNG.originalPermit = new ObjectId(incomingObj.originalPermit));
  // set flavour data
  incomingObj.description && (permitLNG.description = incomingObj.description);

  // set data source references
  incomingObj.sourceDateAdded && (permitLNG.sourceDateAdded = incomingObj.sourceDateAdded);
  incomingObj.sourceDateUpdated && (permitLNG.sourceDateUpdated = incomingObj.sourceDateUpdated);
  incomingObj.sourceSystemRef && (permitLNG.sourceSystemRef = incomingObj.sourceSystemRef);

  return permitLNG;
};

/**
 * Creates the BCMI flavour of a permit.
 *
 * @param {*} args
 * @param {*} res
 * @param {*} next
 * @param {*} incomingObj
 * @returns created BCMI permit
 */
exports.createBCMI = function (args, res, next, incomingObj) {
  // Confirm user has correct role for this type of record.
  if (!userHasValidRoles([utils.ApplicationRoles.ADMIN, utils.ApplicationRoles.ADMIN_BCMI], args.swagger.params.auth_payload.realm_access.roles)) {
    throw new Error('Missing valid user role.');
  }

  let PermitBCMI = mongoose.model('PermitBCMI');
  let permitBCMI = new PermitBCMI();

  permitBCMI._schemaName = 'PermitBCMI';

  // set integration references
  incomingObj._sourceRefId && (permitBCMI._sourceRefId = incomingObj._sourceRefId);
  incomingObj._sourceDocumentRefId && (permitBCMI._sourceDocumentRefId = incomingObj._sourceDocumentRefId);
  incomingObj.collectionId &&
    ObjectId.isValid(incomingObj.collectionId) &&
    (permitBCMI.collectionId = new ObjectId(incomingObj.collectionId));
  incomingObj._master &&
    ObjectId.isValid(incomingObj._master) &&
    (permitBCMI._master = new ObjectId(incomingObj._master));

  // set permissions and meta
  permitBCMI.read = utils.ApplicationAdminRoles;
  permitBCMI.write = [utils.ApplicationRoles.ADMIN, utils.ApplicationRoles.ADMIN_BCMI];

  // If incoming object has addRole: 'public' then read will look like ['sysadmin', 'public']
  if (incomingObj.addRole && incomingObj.addRole === 'public') {
    permitBCMI.read.push('public');
    permitBCMI.datePublished = new Date();
    permitBCMI.publishedBy = args.swagger.params.auth_payload.displayName;
  }

  permitBCMI.addedBy = args.swagger.params.auth_payload.displayName;
  permitBCMI.dateAdded = new Date();

  // set master data
  incomingObj.recordName && (permitBCMI.recordName = incomingObj.recordName);
  permitBCMI.recordType = 'Permit';
  incomingObj.recordSubtype && (permitBCMI.recordSubtype = incomingObj.recordSubtype);
  incomingObj.dateIssued && (permitBCMI.dateIssued = incomingObj.dateIssued);
  incomingObj.issuingAgency && (permitBCMI.issuingAgency = incomingObj.issuingAgency);
  incomingObj.issuedTo && (permitBCMI.issuedTo = incomingObj.issuedTo);
  incomingObj.legislation && incomingObj.legislation.act && (permitBCMI.legislation.act = incomingObj.legislation.act);
  incomingObj.legislation &&
    incomingObj.legislation.regulation &&
    (permitBCMI.legislation.regulation = incomingObj.legislation.regulation);
  incomingObj.legislation &&
    incomingObj.legislation.section &&
    (permitBCMI.legislation.section = incomingObj.legislation.section);
  incomingObj.legislation &&
    incomingObj.legislation.subSection &&
    (permitBCMI.legislation.subSection = incomingObj.legislation.subSection);
  incomingObj.legislation &&
    incomingObj.legislation.paragraph &&
    (permitBCMI.legislation.paragraph = incomingObj.legislation.paragraph);
  incomingObj.legislationDescription && (permitBCMI.legislationDescription = incomingObj.legislationDescription);
  incomingObj.projectName && (permitBCMI.projectName = incomingObj.projectName);
  incomingObj.location && (permitBCMI.location = incomingObj.location);
  incomingObj.centroid && (permitBCMI.centroid = incomingObj.centroid);
  incomingObj.documents && (permitBCMI.documents = incomingObj.documents);

  // set flavour data
  incomingObj.mineGuid && (permitBCMI.mineGuid = incomingObj.mineGuid);
  incomingObj.permitNumber && (permitBCMI.permitNumber = incomingObj.permitNumber);
  incomingObj.permitStatusCode && (permitBCMI.permitStatusCode = incomingObj.permitStatusCode);
  incomingObj.amendmentStatusCode && (permitBCMI.amendmentStatusCode = incomingObj.amendmentStatusCode);
  incomingObj.typeCode && (permitBCMI.typeCode = incomingObj.typeCode);
  // originalPermit should be null unless the type is amendment
  incomingObj.originalPermit && incomingObj.typeCode.toUpperCase() === 'AMD' && (permitBCMI.originalPermit = incomingObj.originalPermit);
  incomingObj.receivedDate && (permitBCMI.receivedDate = incomingObj.receivedDate);
  incomingObj.issueDate && (permitBCMI.issueDate = incomingObj.issueDate);
  incomingObj.authorizedEndDate && (permitBCMI.authorizedEndDate = incomingObj.authorizedEndDate);
  incomingObj.description && (permitBCMI.description = incomingObj.description);
  incomingObj.amendmentDocument && (permitBCMI.amendmentDocument = incomingObj.amendmentDocument);

  // set data source references
  incomingObj.sourceDateAdded && (permitBCMI.sourceDateAdded = incomingObj.sourceDateAdded);
  incomingObj.sourceDateUpdated && (permitBCMI.sourceDateUpdated = incomingObj.sourceDateUpdated);
  incomingObj.sourceSystemRef && (permitBCMI.sourceSystemRef = incomingObj.sourceSystemRef);
  
  return permitBCMI;
};
