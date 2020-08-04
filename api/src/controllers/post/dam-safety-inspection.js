const mongoose = require('mongoose');
const ObjectId = require('mongoose').Types.ObjectId;
const postUtils = require('../../utils/post-utils');
const { userHasValidRoles } = require('../../utils/auth-utils');
const { ROLES } = require('../../utils/constants/misc');

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
exports.createRecord = async function (args, res, next, incomingObj) {
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

  // set permissions
  damSafetyInspection.read = ROLES.ADMIN_ROLES;
  damSafetyInspection.write = ROLES.ADMIN_ROLES;

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
  damSafetyInspection.issuedTo.read = ROLES.ADMIN_ROLES;
  damSafetyInspection.issuedTo.write = ROLES.ADMIN_ROLES;
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
  incomingObj.legislation && incomingObj.legislation.act && (damSafetyInspection.legislation.act = incomingObj.legislation.act);
  incomingObj.legislation &&
    incomingObj.legislation.regulation &&
    (damSafetyInspection.legislation.regulation = incomingObj.legislation.regulation);
  incomingObj.legislation &&
    incomingObj.legislation.section &&
    (damSafetyInspection.legislation.section = incomingObj.legislation.section);
  incomingObj.legislation &&
    incomingObj.legislation.subSection &&
    (damSafetyInspection.legislation.subSection = incomingObj.legislation.subSection);
  incomingObj.legislation &&
    incomingObj.legislation.paragraph &&
    (damSafetyInspection.legislation.paragraph = incomingObj.legislation.paragraph);
  incomingObj.legislationDescription && (damSafetyInspection.legislationDescription = incomingObj.legislationDescription);
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
  if (!userHasValidRoles([ROLES.SYSADMIN, ROLES.BCMIADMIN], args.swagger.params.auth_payload.realm_access.roles)) {
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

  // set permissions
  damSafetyInspectionBCMI.read = ROLES.ADMIN_ROLES;
  damSafetyInspectionBCMI.write = [ROLES.SYSADMIN, ROLES.BCMIADMIN];

  // If incoming object has addRole: 'public' then read will look like ['sysadmin', 'public']
  if (incomingObj.addRole && incomingObj.addRole === 'public') {
    damSafetyInspectionBCMI.read.push('public');
    damSafetyInspectionBCMI.datePublished = new Date();
    damSafetyInspectionBCMI.publishedBy = args.swagger.params.auth_payload.displayName;
  }

  // set data
  incomingObj.recordName && (damSafetyInspectionBCMI.recordName = incomingObj.recordName);
  damSafetyInspectionBCMI.recordType = 'DamSafetyInspection';
  damSafetyInspectionBCMI.issuedTo.read = ROLES.ADMIN_ROLES;
  damSafetyInspectionBCMI.issuedTo.write = [ROLES.SYSADMIN, ROLES.BCMIADMIN];
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
  incomingObj.legislation && incomingObj.legislation.act && (damSafetyInspectionBCMI.legislation.act = incomingObj.legislation.act);
  incomingObj.legislation &&
    incomingObj.legislation.regulation &&
    (damSafetyInspectionBCMI.legislation.regulation = incomingObj.legislation.regulation);
  incomingObj.legislation &&
    incomingObj.legislation.section &&
    (damSafetyInspectionBCMI.legislation.section = incomingObj.legislation.section);
  incomingObj.legislation &&
    incomingObj.legislation.subSection &&
    (damSafetyInspectionBCMI.legislation.subSection = incomingObj.legislation.subSection);
  incomingObj.legislation &&
    incomingObj.legislation.paragraph &&
    (damSafetyInspectionBCMI.legislation.paragraph = incomingObj.legislation.paragraph);
  incomingObj.legislationDescription && (damSafetyInspectionBCMI.legislationDescription = incomingObj.legislationDescription);
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
  incomingObj.isBcmiPublished && (damSafetyInspectionBCMI.isBcmiPublished = incomingObj.isBcmiPublished);
  incomingObj.isNrcedPublished && (damSafetyInspectionBCMI.isNrcedPublished = incomingObj.isNrcedPublished);

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
  if (!userHasValidRoles([ROLES.SYSADMIN, ROLES.BCMIADMIN], args.swagger.params.auth_payload.realm_access.roles)) {
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
  damSafetyInspectionNRCED.read = ROLES.ADMIN_ROLES;
  damSafetyInspectionNRCED.write = [ROLES.SYSADMIN, ROLES.BCMIADMIN];

  // If incoming object has addRole: 'public' then read will look like ['sysadmin', 'public']
  if (incomingObj.addRole && incomingObj.addRole === 'public') {
    damSafetyInspectionNRCED.read.push('public');
    damSafetyInspectionNRCED.datePublished = new Date();
    damSafetyInspectionNRCED.publishedBy = args.swagger.params.auth_payload.displayName;
  }

  // set data
  incomingObj.recordName && (damSafetyInspectionNRCED.recordName = incomingObj.recordName);
  damSafetyInspectionNRCED.recordType = 'DamSafetyInspection';
  damSafetyInspectionNRCED.issuedTo.read = ROLES.ADMIN_ROLES;
  damSafetyInspectionNRCED.issuedTo.write = [ROLES.SYSADMIN, ROLES.BCMIADMIN];
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
  incomingObj.legislation && incomingObj.legislation.act && (damSafetyInspectionNRCED.legislation.act = incomingObj.legislation.act);
  incomingObj.legislation &&
    incomingObj.legislation.regulation &&
    (damSafetyInspectionNRCED.legislation.regulation = incomingObj.legislation.regulation);
  incomingObj.legislation &&
    incomingObj.legislation.section &&
    (damSafetyInspectionNRCED.legislation.section = incomingObj.legislation.section);
  incomingObj.legislation &&
    incomingObj.legislation.subSection &&
    (damSafetyInspectionNRCED.legislation.subSection = incomingObj.legislation.subSection);
  incomingObj.legislation &&
    incomingObj.legislation.paragraph &&
    (damSafetyInspectionNRCED.legislation.paragraph = incomingObj.legislation.paragraph);
  incomingObj.legislationDescription && (damSafetyInspectionNRCED.legislationDescription = incomingObj.legislationDescription);
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
  incomingObj.isBcmiPublished && (damSafetyInspectionNRCED.isBcmiPublished = incomingObj.isBcmiPublished);
  incomingObj.isNrcedPublished && (damSafetyInspectionNRCED.isNrcedPublished = incomingObj.isNrcedPublished);

  return damSafetyInspectionNRCED;
};
