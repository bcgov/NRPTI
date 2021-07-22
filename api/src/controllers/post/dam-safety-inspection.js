const mongoose = require('mongoose');
const ObjectId = require('mongoose').Types.ObjectId;
const postUtils = require('../../utils/post-utils');
const { userHasValidRoles } = require('../../utils/auth-utils');
const utils = require('../../utils/constants/misc');

/**
 * Performs all operations necessary to create a master Dam Safety Inspection record and its associated flavour records.
 *
 * Example of incomingObj
 *
 *  DamSafetyInspections: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'damSafetyInspection',
 *      ...
 *      DamSafetyInspectionBCMI: {
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
    DamSafetyInspectionBCMI: this.createBCMI,
    DamSafetyInspectionNRCED: this.createNRCED
  }
  return await postUtils.createRecordWithFlavours(args, res, next, incomingObj, this.createMaster, flavourFunctions);
};

/**
 * Performs all operations necessary to create a master DamSafetyInspection record.
 *
 * Example of incomingObj
 *
 *  DamSafetyInspection: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'DamSafetyInspection',
 *      ...
 *      DamSafetyInspectionBCMI: {
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
  let DamSafetyInspection = mongoose.model('DamSafetyInspection');
  let damSafetyInspection = new DamSafetyInspection();

  damSafetyInspection._schemaName = 'DamSafetyInspection';

  // set integration references
  incomingObj._sourceRefId &&
    ObjectId.isValid(incomingObj._sourceRefId) &&
    (damSafetyInspection._sourceRefId = new ObjectId(incomingObj._sourceRefId));
  incomingObj.mineGuid &&
    (damSafetyInspection.mineGuid = incomingObj.mineGuid);
  incomingObj.collectionId &&
    ObjectId.isValid(incomingObj.collectionId) &&
    (damSafetyInspection.collectionId = new ObjectId(incomingObj.collectionId));

  // set permissions
  damSafetyInspection.read = utils.ApplicationAdminRoles;
  damSafetyInspection.write = utils.ApplicationAdminRoles;

  // set forward references
  if (flavourIds && flavourIds.length) {
    flavourIds.forEach(id => {
      if (ObjectId.isValid(id)) {
        damSafetyInspection._flavourRecords.push(new ObjectId(id));
      }
    });
  }

  // set data
  incomingObj.recordName && (damSafetyInspection.recordName = incomingObj.recordName);
  damSafetyInspection.recordType = 'Dam Safety Inspection';
  damSafetyInspection.issuedTo.read = utils.ApplicationAdminRoles;
  damSafetyInspection.issuedTo.write = utils.ApplicationAdminRoles;
  incomingObj.issuedTo && incomingObj.issuedTo.type && (damSafetyInspection.issuedTo.type = incomingObj.issuedTo.type);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.companyName &&
    (damSafetyInspection.issuedTo.companyName = incomingObj.issuedTo.companyName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.firstName &&
    (damSafetyInspection.issuedTo.firstName = incomingObj.issuedTo.firstName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.middleName &&
    (damSafetyInspection.issuedTo.middleName = incomingObj.issuedTo.middleName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.lastName &&
    (damSafetyInspection.issuedTo.lastName = incomingObj.issuedTo.lastName);
  incomingObj.issuedTo && (damSafetyInspection.issuedTo.fullName = postUtils.getIssuedToFullNameValue(incomingObj.issuedTo));
  incomingObj.issuedTo &&
    incomingObj.issuedTo.dateOfBirth &&
    (damSafetyInspection.issuedTo.dateOfBirth = incomingObj.issuedTo.dateOfBirth);
  incomingObj.dateIssued && (damSafetyInspection.dateIssued = incomingObj.dateIssued);
  incomingObj.issuingAgency && (damSafetyInspection.issuingAgency = incomingObj.issuingAgency);

  damSafetyInspection.legislation = postUtils.populateLegislation(incomingObj.legislation);

  incomingObj.projectName && (damSafetyInspection.projectName = incomingObj.projectName);
  incomingObj.location && (damSafetyInspection.location = incomingObj.location);
  incomingObj.centroid && (damSafetyInspection.centroid = incomingObj.centroid);
  incomingObj.documents && (damSafetyInspection.documents = incomingObj.documents);
  incomingObj.description && (damSafetyInspection.description = incomingObj.description);

  // set meta
  damSafetyInspection.addedBy = args.swagger.params.auth_payload.displayName;
  damSafetyInspection.dateAdded = new Date();

  // set data source references
  incomingObj.sourceDateAdded && (damSafetyInspection.sourceDateAdded = incomingObj.sourceDateAdded);
  incomingObj.sourceDateUpdated && (damSafetyInspection.sourceDateUpdated = incomingObj.sourceDateUpdated);
  incomingObj.sourceSystemRef && (damSafetyInspection.sourceSystemRef = incomingObj.sourceSystemRef);
  incomingObj.isBcmiPublished && (damSafetyInspection.isBcmiPublished = incomingObj.isBcmiPublished);
  incomingObj.isNrcedPublished && (damSafetyInspection.isNrcedPublished = incomingObj.isNrcedPublished);

  return damSafetyInspection;
};

/**
 * Performs all operations necessary to create a BCMI DamSafetyInspection record.
 *
 * Example of incomingObj
 *
 *  DamSafetyInspection: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'DamSafetyInspection',
 *      ...
 *      DamSafetyInspectionBCMI: {
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
 * @returns created bcmi DamSafetyInspection record
 */
exports.createBCMI = function (args, res, next, incomingObj) {
  // Confirm user has correct role for this type of record.
  if (!userHasValidRoles([utils.ApplicationRoles.ADMIN, utils.ApplicationRoles.ADMIN_BCMI], args.swagger.params.auth_payload.realm_access.roles)) {
    throw new Error('Missing valid user role.');
  }

  let DamSafetyInspectionBCMI = mongoose.model('DamSafetyInspectionBCMI');
  let damSafetyInspectionBCMI = new DamSafetyInspectionBCMI();

  damSafetyInspectionBCMI._schemaName = 'DamSafetyInspectionBCMI';

  // set integration references
  incomingObj._sourceRefId &&
    ObjectId.isValid(incomingObj._sourceRefId) &&
    (damSafetyInspectionBCMI._sourceRefId = new ObjectId(incomingObj._sourceRefId));
  incomingObj.mineGuid &&
    (damSafetyInspectionBCMI.mineGuid = incomingObj.mineGuid);
  incomingObj.collectionId &&
    ObjectId.isValid(incomingObj.collectionId) &&
    (damSafetyInspectionBCMI.collectionId = new ObjectId(incomingObj.collectionId));
  incomingObj._master &&
    ObjectId.isValid(incomingObj._master) &&
    (damSafetyInspectionBCMI._master = new ObjectId(incomingObj._master));

  // set permissions
  damSafetyInspectionBCMI.read = utils.ApplicationAdminRoles;
  damSafetyInspectionBCMI.write = [utils.ApplicationRoles.ADMIN, utils.ApplicationRoles.ADMIN_BCMI];

  // If incoming object has addRole: 'public' then read will look like ['sysadmin', 'public']
  if (incomingObj.addRole && incomingObj.addRole === 'public') {
    damSafetyInspectionBCMI.read.push('public');
    damSafetyInspectionBCMI.datePublished = new Date();
    damSafetyInspectionBCMI.publishedBy = args.swagger.params.auth_payload.displayName;
  }

  // set data
  incomingObj.recordName && (damSafetyInspectionBCMI.recordName = incomingObj.recordName);
  damSafetyInspectionBCMI.recordType = 'Dam Safety Inspection';
  damSafetyInspectionBCMI.issuedTo.read = utils.ApplicationAdminRoles;
  damSafetyInspectionBCMI.issuedTo.write = [utils.ApplicationRoles.ADMIN, utils.ApplicationRoles.ADMIN_BCMI];
  incomingObj.issuedTo && incomingObj.issuedTo.type && (damSafetyInspectionBCMI.issuedTo.type = incomingObj.issuedTo.type);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.companyName &&
    (damSafetyInspectionBCMI.issuedTo.companyName = incomingObj.issuedTo.companyName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.firstName &&
    (damSafetyInspectionBCMI.issuedTo.firstName = incomingObj.issuedTo.firstName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.middleName &&
    (damSafetyInspectionBCMI.issuedTo.middleName = incomingObj.issuedTo.middleName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.lastName &&
    (damSafetyInspectionBCMI.issuedTo.lastName = incomingObj.issuedTo.lastName);
  incomingObj.issuedTo && (damSafetyInspectionBCMI.issuedTo.fullName = postUtils.getIssuedToFullNameValue(incomingObj.issuedTo));
  incomingObj.issuedTo &&
    incomingObj.issuedTo.dateOfBirth &&
    (damSafetyInspectionBCMI.issuedTo.dateOfBirth = incomingObj.issuedTo.dateOfBirth);
  incomingObj.dateIssued && (damSafetyInspectionBCMI.dateIssued = incomingObj.dateIssued);
  incomingObj.issuingAgency && (damSafetyInspectionBCMI.issuingAgency = incomingObj.issuingAgency);

  damSafetyInspectionBCMI.legislation = postUtils.populateLegislation(incomingObj.legislation);

  incomingObj.projectName && (damSafetyInspectionBCMI.projectName = incomingObj.projectName);
  incomingObj.location && (damSafetyInspectionBCMI.location = incomingObj.location);
  incomingObj.centroid && (damSafetyInspectionBCMI.centroid = incomingObj.centroid);
  incomingObj.documents && (damSafetyInspectionBCMI.documents = incomingObj.documents);
  incomingObj.description && (damSafetyInspectionBCMI.description = incomingObj.description);

  // set meta
  damSafetyInspectionBCMI.addedBy = args.swagger.params.auth_payload.displayName;
  damSafetyInspectionBCMI.dateAdded = new Date();

  // set data source references
  incomingObj.sourceDateAdded && (damSafetyInspectionBCMI.sourceDateAdded = incomingObj.sourceDateAdded);
  incomingObj.sourceDateUpdated && (damSafetyInspectionBCMI.sourceDateUpdated = incomingObj.sourceDateUpdated);
  incomingObj.sourceSystemRef && (damSafetyInspectionBCMI.sourceSystemRef = incomingObj.sourceSystemRef);

  return damSafetyInspectionBCMI;
};

/**
 * Performs all operations necessary to create a nrced DamSafetyInspection record.
 *
 * Example of incomingObj
 *
 *  DamSafetyInspection: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'DamSafetyInspection',
 *      ...
 *      DamSafetyInspectionNRCED: {
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
 * @returns created nrced DamSafetyInspection record
 */
 exports.createNRCED = function (args, res, next, incomingObj) {
  // Confirm user has correct role for this type of record.
  if (!userHasValidRoles([utils.ApplicationRoles.ADMIN, utils.ApplicationRoles.ADMIN_BCMI], args.swagger.params.auth_payload.realm_access.roles)) {
    throw new Error('Missing valid user role.');
  }

  let DamSafetyInspectionNRCED = mongoose.model('DamSafetyInspectionNRCED');
  let damSafetyInspectionNRCED = new DamSafetyInspectionNRCED();

  damSafetyInspectionNRCED._schemaName = 'DamSafetyInspectionNRCED';

  // set integration references
  incomingObj._sourceRefId &&
    ObjectId.isValid(incomingObj._sourceRefId) &&
    (damSafetyInspectionNRCED._sourceRefId = new ObjectId(incomingObj._sourceRefId));
  incomingObj.mineGuid &&
    (damSafetyInspectionNRCED.mineGuid = incomingObj.mineGuid);

  // set permissions
  damSafetyInspectionNRCED.read = utils.ApplicationAdminRoles;
  damSafetyInspectionNRCED.write = [utils.ApplicationRoles.ADMIN, utils.ApplicationRoles.ADMIN_BCMI];

  // If incoming object has addRole: 'public' then read will look like ['sysadmin', 'public']
  if (incomingObj.addRole && incomingObj.addRole === 'public') {
    damSafetyInspectionNRCED.read.push('public');
    damSafetyInspectionNRCED.datePublished = new Date();
    damSafetyInspectionNRCED.publishedBy = args.swagger.params.auth_payload.displayName;
  }

  // set data
  incomingObj.recordName && (damSafetyInspectionNRCED.recordName = incomingObj.recordName);
  damSafetyInspectionNRCED.recordType = 'DamSafetyInspection';
  damSafetyInspectionNRCED.issuedTo.read = utils.ApplicationAdminRoles;
  damSafetyInspectionNRCED.issuedTo.write = [utils.ApplicationRoles.ADMIN, utils.ApplicationRoles.ADMIN_BCMI];
  incomingObj.issuedTo && incomingObj.issuedTo.type && (damSafetyInspectionNRCED.issuedTo.type = incomingObj.issuedTo.type);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.companyName &&
    (damSafetyInspectionNRCED.issuedTo.companyName = incomingObj.issuedTo.companyName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.firstName &&
    (damSafetyInspectionNRCED.issuedTo.firstName = incomingObj.issuedTo.firstName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.middleName &&
    (damSafetyInspectionNRCED.issuedTo.middleName = incomingObj.issuedTo.middleName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.lastName &&
    (damSafetyInspectionNRCED.issuedTo.lastName = incomingObj.issuedTo.lastName);
  incomingObj.issuedTo && (damSafetyInspectionNRCED.issuedTo.fullName = postUtils.getIssuedToFullNameValue(incomingObj.issuedTo));
  incomingObj.issuedTo &&
    incomingObj.issuedTo.dateOfBirth &&
    (damSafetyInspectionNRCED.issuedTo.dateOfBirth = incomingObj.issuedTo.dateOfBirth);
  incomingObj.dateIssued && (damSafetyInspectionNRCED.dateIssued = incomingObj.dateIssued);
  incomingObj.issuingAgency && (damSafetyInspectionNRCED.issuingAgency = incomingObj.issuingAgency);

  damSafetyInspectionNRCED.legislation = postUtils.populateLegislation(incomingObj.legislation);

  incomingObj.projectName && (damSafetyInspectionNRCED.projectName = incomingObj.projectName);
  incomingObj.location && (damSafetyInspectionNRCED.location = incomingObj.location);
  incomingObj.centroid && (damSafetyInspectionNRCED.centroid = incomingObj.centroid);
  incomingObj.documents && (damSafetyInspectionNRCED.documents = incomingObj.documents);
  incomingObj.description && (damSafetyInspectionNRCED.description = incomingObj.description);

  // set meta
  damSafetyInspectionNRCED.addedBy = args.swagger.params.auth_payload.displayName;
  damSafetyInspectionNRCED.dateAdded = new Date();

  // set data source references
  incomingObj.sourceDateAdded && (damSafetyInspectionNRCED.sourceDateAdded = incomingObj.sourceDateAdded);
  incomingObj.sourceDateUpdated && (damSafetyInspectionNRCED.sourceDateUpdated = incomingObj.sourceDateUpdated);
  incomingObj.sourceSystemRef && (damSafetyInspectionNRCED.sourceSystemRef = incomingObj.sourceSystemRef);

  return damSafetyInspectionNRCED;
};
