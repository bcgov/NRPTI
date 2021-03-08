const mongoose = require('mongoose');
const ObjectId = require('mongoose').Types.ObjectId;
const postUtils = require('../../utils/post-utils');
const BusinessLogicManager = require('../../utils/business-logic-manager');
const { userHasValidRoles } = require('../../utils/auth-utils');
const utils = require('../../utils/constants/misc');

// Additional admin roles that can create this record, such as admin:wf or admin:flnro
const ADDITIONAL_ROLES = [
  utils.ApplicationRoles.ADMIN_WF,
  utils.ApplicationRoles.ADMIN_FLNRO,
  utils.ApplicationRoles.ADMIN_FLNR_NRO,
  utils.ApplicationRoles.ADMIN_AGRI,
  utils.ApplicationRoles.ADMIN_ENV_EPD,
  utils.ApplicationRoles.ADMIN_ALC
];
exports.ADDITIONAL_ROLES = ADDITIONAL_ROLES;

/**
 * Performs all operations necessary to create a master Administrative Penalty record and its associated flavour records.
 *
 * Example of incomingObj
 *
 *  administrativePenalties: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'administrativePenalty',
 *      ...
 *      AdministrativePenaltyLNG: {
 *        description: 'lng description'
 *        addRole: 'public',
 *        ...
 *      },
 *      AdministrativePenaltyNRCED: {
 *        summary: 'nrced summary',
 *        addRole: 'public'
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
    AdministrativePenaltyLNG: this.createLNG,
    AdministrativePenaltyNRCED: this.createNRCED
  };

  return await postUtils.createRecordWithFlavours(args, res, next, incomingObj, this.createMaster, flavourFunctions);
};

/**
 * Performs all operations necessary to create a master Administrative Penalty record.
 *
 * Example of incomingObj
 *
 *  administrativePenalties: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'administrativePenalty',
 *      ...
 *      AdministrativePenaltyLNG: {
 *        description: 'lng description'
 *        addRole: 'public',
 *        ...
 *      },
 *      AdministrativePenaltyNRCED: {
 *        summary: 'nrced summary',
 *        addRole: 'public'
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
 * @returns created master administrativePenalty record
 */
exports.createMaster = function(args, res, next, incomingObj, flavourIds) {
  let AdministrativePenalty = mongoose.model('AdministrativePenalty');
  let administrativePenalty = new AdministrativePenalty();

  administrativePenalty._schemaName = 'AdministrativePenalty';

  // set integration references
  incomingObj._epicProjectId &&
    ObjectId.isValid(incomingObj._epicProjectId) &&
    (administrativePenalty._epicProjectId = new ObjectId(incomingObj._epicProjectId));
  incomingObj._sourceRefId &&
    ObjectId.isValid(incomingObj._sourceRefId) &&
    (administrativePenalty._sourceRefId = new ObjectId(incomingObj._sourceRefId));
  incomingObj._epicMilestoneId &&
    ObjectId.isValid(incomingObj._epicMilestoneId) &&
    (administrativePenalty._epicMilestoneId = new ObjectId(incomingObj._epicMilestoneId));
  incomingObj.collectionId &&
    ObjectId.isValid(incomingObj.collectionId) &&
    (administrativePenalty.collectionId = new ObjectId(incomingObj.collectionId));

  incomingObj._sourceRefOgcPenaltyId &&
    (administrativePenalty._sourceRefOgcPenaltyId = incomingObj._sourceRefOgcPenaltyId);

  // set permissions
  administrativePenalty.read = utils.ApplicationAdminRoles;
  administrativePenalty.write = utils.ApplicationAdminRoles;

  // set forward references
  if (flavourIds && flavourIds.length) {
    flavourIds.forEach(id => {
      if (ObjectId.isValid(id)) {
        administrativePenalty._flavourRecords.push(new ObjectId(id));
      }
    });
  }

  // set data
  incomingObj.recordName && (administrativePenalty.recordName = incomingObj.recordName);
  administrativePenalty.recordType = 'Administrative Penalty';
  incomingObj.dateIssued && (administrativePenalty.dateIssued = incomingObj.dateIssued);
  incomingObj.issuingAgency && (administrativePenalty.issuingAgency = incomingObj.issuingAgency);
  incomingObj.author && (administrativePenalty.author = incomingObj.author);

  incomingObj.legislation &&
    incomingObj.legislation.act &&
    (administrativePenalty.legislation.act = incomingObj.legislation.act);
  incomingObj.legislation &&
    incomingObj.legislation.regulation &&
    (administrativePenalty.legislation.regulation = incomingObj.legislation.regulation);
  incomingObj.legislation &&
    incomingObj.legislation.section &&
    (administrativePenalty.legislation.section = incomingObj.legislation.section);
  incomingObj.legislation &&
    incomingObj.legislation.subSection &&
    (administrativePenalty.legislation.subSection = incomingObj.legislation.subSection);
  incomingObj.legislation &&
    incomingObj.legislation.paragraph &&
    (administrativePenalty.legislation.paragraph = incomingObj.legislation.paragraph);

  incomingObj.offence && (administrativePenalty.offence = incomingObj.offence);

  administrativePenalty.issuedTo.read = utils.ApplicationAdminRoles;
  administrativePenalty.issuedTo.write = utils.ApplicationAdminRoles;
  incomingObj.issuedTo &&
    incomingObj.issuedTo.type &&
    (administrativePenalty.issuedTo.type = incomingObj.issuedTo.type);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.companyName &&
    (administrativePenalty.issuedTo.companyName = incomingObj.issuedTo.companyName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.firstName &&
    (administrativePenalty.issuedTo.firstName = incomingObj.issuedTo.firstName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.middleName &&
    (administrativePenalty.issuedTo.middleName = incomingObj.issuedTo.middleName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.lastName &&
    (administrativePenalty.issuedTo.lastName = incomingObj.issuedTo.lastName);
  incomingObj.issuedTo &&
    (administrativePenalty.issuedTo.fullName = postUtils.getIssuedToFullNameValue(incomingObj.issuedTo));
  incomingObj.issuedTo &&
    incomingObj.issuedTo.dateOfBirth &&
    (administrativePenalty.issuedTo.dateOfBirth = incomingObj.issuedTo.dateOfBirth);

  incomingObj.projectName && (administrativePenalty.projectName = incomingObj.projectName);
  incomingObj.location && (administrativePenalty.location = incomingObj.location);
  incomingObj.centroid && (administrativePenalty.centroid = incomingObj.centroid);
  incomingObj.penalties && (administrativePenalty.penalties = incomingObj.penalties);
  incomingObj.documents && (administrativePenalty.documents = incomingObj.documents);

  // set meta
  administrativePenalty.addedBy = args.swagger.params.auth_payload.displayName;
  administrativePenalty.dateAdded = new Date();

  // set data source references
  incomingObj.sourceDateAdded && (administrativePenalty.sourceDateAdded = incomingObj.sourceDateAdded);
  incomingObj.sourceDateUpdated && (administrativePenalty.sourceDateUpdated = incomingObj.sourceDateUpdated);
  incomingObj.sourceSystemRef && (administrativePenalty.sourceSystemRef = incomingObj.sourceSystemRef);
  incomingObj.isNrcedPublished && (administrativePenalty.isNrcedPublished = incomingObj.isNrcedPublished);
  incomingObj.isLngPublished && (administrativePenalty.isLngPublished = incomingObj.isLngPublished);

  // Add limited-admin(such as admin:wf) read/write roles if user is a limited-admin user
  if (args) {
    postUtils.setAdditionalRoleOnRecord(
      administrativePenalty,
      args.swagger.params.auth_payload.realm_access.roles,
      ADDITIONAL_ROLES
    );
  }

  return administrativePenalty;
};

/**
 * Performs all operations necessary to create a LNG Administrative Penalty record.
 *
 * Example of incomingObj
 *
 *  administrativePenalties: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'administrativePenalty',
 *      ...
 *      AdministrativePenaltyLNG: {
 *        description: 'lng description'
 *        addRole: 'public',
 *        ...
 *      },
 *      AdministrativePenaltyNRCED: {
 *        summary: 'nrced summary',
 *        addRole: 'public'
 *        ...
 *      }
 *    }
 *  ]
 *
 * @param {*} args
 * @param {*} res
 * @param {*} next
 * @param {*} incomingObj see example
 * @returns created lng administrativePenalty record
 */
exports.createLNG = function(args, res, next, incomingObj) {
  // Confirm user has correct role to create this type of record.
  if (
    !userHasValidRoles(
      [utils.ApplicationRoles.ADMIN, utils.ApplicationRoles.ADMIN_LNG, ...ADDITIONAL_ROLES],
      args.swagger.params.auth_payload.realm_access.roles
    )
  ) {
    throw new Error('Missing valid user role.');
  }

  let AdministrativePenaltyLNG = mongoose.model('AdministrativePenaltyLNG');
  let administrativePenaltyLNG = new AdministrativePenaltyLNG();

  administrativePenaltyLNG._schemaName = 'AdministrativePenaltyLNG';

  // set integration references
  incomingObj._epicProjectId &&
    ObjectId.isValid(incomingObj._epicProjectId) &&
    (administrativePenaltyLNG._epicProjectId = new ObjectId(incomingObj._epicProjectId));
  incomingObj._sourceRefId &&
    ObjectId.isValid(incomingObj._sourceRefId) &&
    (administrativePenaltyLNG._sourceRefId = new ObjectId(incomingObj._sourceRefId));
  incomingObj._epicMilestoneId &&
    ObjectId.isValid(incomingObj._epicMilestoneId) &&
    (administrativePenaltyLNG._epicMilestoneId = new ObjectId(incomingObj._epicMilestoneId));

  incomingObj._sourceRefOgcPenaltyId &&
    (administrativePenaltyLNG._sourceRefOgcPenaltyId = incomingObj._sourceRefOgcPenaltyId);

  // set permissions and meta
  administrativePenaltyLNG.read = utils.ApplicationAdminRoles;
  administrativePenaltyLNG.write = [utils.ApplicationRoles.ADMIN, utils.ApplicationRoles.ADMIN_LNG];

  administrativePenaltyLNG.addedBy = args.swagger.params.auth_payload.displayName;
  administrativePenaltyLNG.dateAdded = new Date();

  // set master data
  incomingObj.recordName && (administrativePenaltyLNG.recordName = incomingObj.recordName);
  administrativePenaltyLNG.recordType = 'Administrative Penalty';
  incomingObj.dateIssued && (administrativePenaltyLNG.dateIssued = incomingObj.dateIssued);
  incomingObj.issuingAgency && (administrativePenaltyLNG.issuingAgency = incomingObj.issuingAgency);
  incomingObj.author && (administrativePenaltyLNG.author = incomingObj.author);

  incomingObj.legislation &&
    incomingObj.legislation.act &&
    (administrativePenaltyLNG.legislation.act = incomingObj.legislation.act);
  incomingObj.legislation &&
    incomingObj.legislation.regulation &&
    (administrativePenaltyLNG.legislation.regulation = incomingObj.legislation.regulation);
  incomingObj.legislation &&
    incomingObj.legislation.section &&
    (administrativePenaltyLNG.legislation.section = incomingObj.legislation.section);
  incomingObj.legislation &&
    incomingObj.legislation.subSection &&
    (administrativePenaltyLNG.legislation.subSection = incomingObj.legislation.subSection);
  incomingObj.legislation &&
    incomingObj.legislation.paragraph &&
    (administrativePenaltyLNG.legislation.paragraph = incomingObj.legislation.paragraph);

  incomingObj.offence && (administrativePenaltyLNG.offence = incomingObj.offence);

  administrativePenaltyLNG.issuedTo.read = utils.ApplicationAdminRoles;
  administrativePenaltyLNG.issuedTo.write = [utils.ApplicationRoles.ADMIN, utils.ApplicationRoles.ADMIN_LNG];
  incomingObj.issuedTo &&
    incomingObj.issuedTo.type &&
    (administrativePenaltyLNG.issuedTo.type = incomingObj.issuedTo.type);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.companyName &&
    (administrativePenaltyLNG.issuedTo.companyName = incomingObj.issuedTo.companyName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.firstName &&
    (administrativePenaltyLNG.issuedTo.firstName = incomingObj.issuedTo.firstName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.middleName &&
    (administrativePenaltyLNG.issuedTo.middleName = incomingObj.issuedTo.middleName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.lastName &&
    (administrativePenaltyLNG.issuedTo.lastName = incomingObj.issuedTo.lastName);
  incomingObj.issuedTo &&
    (administrativePenaltyLNG.issuedTo.fullName = postUtils.getIssuedToFullNameValue(incomingObj.issuedTo));
  incomingObj.issuedTo &&
    incomingObj.issuedTo.dateOfBirth &&
    (administrativePenaltyLNG.issuedTo.dateOfBirth = incomingObj.issuedTo.dateOfBirth);

  incomingObj.projectName && (administrativePenaltyLNG.projectName = incomingObj.projectName);
  incomingObj.location && (administrativePenaltyLNG.location = incomingObj.location);
  incomingObj.centroid && (administrativePenaltyLNG.centroid = incomingObj.centroid);
  incomingObj.penalties && (administrativePenaltyLNG.penalties = incomingObj.penalties);
  incomingObj.documents && (administrativePenaltyLNG.documents = incomingObj.documents);

  // set flavour data
  incomingObj.description && (administrativePenaltyLNG.description = incomingObj.description);

  // set data source references
  incomingObj.sourceDateAdded && (administrativePenaltyLNG.sourceDateAdded = incomingObj.sourceDateAdded);
  incomingObj.sourceDateUpdated && (administrativePenaltyLNG.sourceDateUpdated = incomingObj.sourceDateUpdated);
  incomingObj.sourceSystemRef && (administrativePenaltyLNG.sourceSystemRef = incomingObj.sourceSystemRef);

  // Add limited-admin(such as admin:wf) read/write roles if user is a limited-admin user
  if (args) {
    postUtils.setAdditionalRoleOnRecord(
      administrativePenaltyLNG,
      args.swagger.params.auth_payload.realm_access.roles,
      ADDITIONAL_ROLES
    );
  }

  // If incoming object has addRole: 'public' then read will look like ['sysadmin', 'public']
  if (incomingObj.addRole && incomingObj.addRole === 'public') {
    administrativePenaltyLNG.read.push('public');
    administrativePenaltyLNG.datePublished = new Date();
    administrativePenaltyLNG.publishedBy = args.swagger.params.auth_payload.displayName;
  }

  administrativePenaltyLNG = BusinessLogicManager.applyBusinessLogicOnPost(administrativePenaltyLNG);

  return administrativePenaltyLNG;
};

/**
 * Performs all operations necessary to create a NRCED Administrative Penalty record.
 *
 * Example of incomingObj
 *
 *  administrativePenalties: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'administrativePenalty',
 *      ...
 *      AdministrativePenaltyLNG: {
 *        description: 'lng description'
 *        addRole: 'public',
 *        ...
 *      },
 *      AdministrativePenaltyNRCED: {
 *        summary: 'nrced summary',
 *        addRole: 'public'
 *        ...
 *      }
 *    }
 *  ]
 *
 * @param {*} args
 * @param {*} res
 * @param {*} next
 * @param {*} incomingObj see example
 * @returns created nrced administrativePenalty record
 */
exports.createNRCED = function(args, res, next, incomingObj) {
  // Confirm user has correct role to create this type of record.
  if (
    !userHasValidRoles(
      [utils.ApplicationRoles.ADMIN, utils.ApplicationRoles.ADMIN_NRCED, ...ADDITIONAL_ROLES],
      args.swagger.params.auth_payload.realm_access.roles
    )
  ) {
    throw new Error('Missing valid user role.');
  }

  let AdministrativePenaltyNRCED = mongoose.model('AdministrativePenaltyNRCED');
  let administrativePenaltyNRCED = new AdministrativePenaltyNRCED();

  administrativePenaltyNRCED._schemaName = 'AdministrativePenaltyNRCED';

  // set integration references
  incomingObj._epicProjectId &&
    ObjectId.isValid(incomingObj._epicProjectId) &&
    (administrativePenaltyNRCED._epicProjectId = new ObjectId(incomingObj._epicProjectId));
  incomingObj._sourceRefId &&
    ObjectId.isValid(incomingObj._sourceRefId) &&
    (administrativePenaltyNRCED._sourceRefId = new ObjectId(incomingObj._sourceRefId));
  incomingObj._epicMilestoneId &&
    ObjectId.isValid(incomingObj._epicMilestoneId) &&
    (administrativePenaltyNRCED._epicMilestoneId = new ObjectId(incomingObj._epicMilestoneId));

  incomingObj._sourceRefOgcPenaltyId &&
    (administrativePenaltyNRCED._sourceRefOgcPenaltyId = incomingObj._sourceRefOgcPenaltyId);

  // set permissions and meta
  administrativePenaltyNRCED.read = utils.ApplicationAdminRoles;
  administrativePenaltyNRCED.write = [utils.ApplicationRoles.ADMIN, utils.ApplicationRoles.ADMIN_NRCED];

  administrativePenaltyNRCED.addedBy = args.swagger.params.auth_payload.displayName;
  administrativePenaltyNRCED.dateAdded = new Date();

  // set master data
  incomingObj.recordName && (administrativePenaltyNRCED.recordName = incomingObj.recordName);
  administrativePenaltyNRCED.recordType = 'Administrative Penalty';
  incomingObj.dateIssued && (administrativePenaltyNRCED.dateIssued = incomingObj.dateIssued);
  incomingObj.issuingAgency && (administrativePenaltyNRCED.issuingAgency = incomingObj.issuingAgency);
  incomingObj.author && (administrativePenaltyNRCED.author = incomingObj.author);

  incomingObj.legislation &&
    incomingObj.legislation.act &&
    (administrativePenaltyNRCED.legislation.act = incomingObj.legislation.act);
  incomingObj.legislation &&
    incomingObj.legislation.regulation &&
    (administrativePenaltyNRCED.legislation.regulation = incomingObj.legislation.regulation);
  incomingObj.legislation &&
    incomingObj.legislation.section &&
    (administrativePenaltyNRCED.legislation.section = incomingObj.legislation.section);
  incomingObj.legislation &&
    incomingObj.legislation.subSection &&
    (administrativePenaltyNRCED.legislation.subSection = incomingObj.legislation.subSection);
  incomingObj.legislation &&
    incomingObj.legislation.paragraph &&
    (administrativePenaltyNRCED.legislation.paragraph = incomingObj.legislation.paragraph);

  incomingObj.offence && (administrativePenaltyNRCED.offence = incomingObj.offence);

  administrativePenaltyNRCED.issuedTo.read = utils.ApplicationAdminRoles;
  administrativePenaltyNRCED.issuedTo.write = [utils.ApplicationRoles.ADMIN, utils.ApplicationRoles.ADMIN_NRCED];
  incomingObj.issuedTo &&
    incomingObj.issuedTo.type &&
    (administrativePenaltyNRCED.issuedTo.type = incomingObj.issuedTo.type);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.companyName &&
    (administrativePenaltyNRCED.issuedTo.companyName = incomingObj.issuedTo.companyName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.firstName &&
    (administrativePenaltyNRCED.issuedTo.firstName = incomingObj.issuedTo.firstName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.middleName &&
    (administrativePenaltyNRCED.issuedTo.middleName = incomingObj.issuedTo.middleName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.lastName &&
    (administrativePenaltyNRCED.issuedTo.lastName = incomingObj.issuedTo.lastName);
  incomingObj.issuedTo &&
    (administrativePenaltyNRCED.issuedTo.fullName = postUtils.getIssuedToFullNameValue(incomingObj.issuedTo));
  incomingObj.issuedTo &&
    incomingObj.issuedTo.dateOfBirth &&
    (administrativePenaltyNRCED.issuedTo.dateOfBirth = incomingObj.issuedTo.dateOfBirth);

  incomingObj.projectName && (administrativePenaltyNRCED.projectName = incomingObj.projectName);
  incomingObj.location && (administrativePenaltyNRCED.location = incomingObj.location);
  incomingObj.centroid && (administrativePenaltyNRCED.centroid = incomingObj.centroid);
  incomingObj.penalties && (administrativePenaltyNRCED.penalties = incomingObj.penalties);
  incomingObj.documents && (administrativePenaltyNRCED.documents = incomingObj.documents);

  // set flavour data
  incomingObj.summary && (administrativePenaltyNRCED.summary = incomingObj.summary);

  // set data source references
  incomingObj.sourceDateAdded && (administrativePenaltyNRCED.sourceDateAdded = incomingObj.sourceDateAdded);
  incomingObj.sourceDateUpdated && (administrativePenaltyNRCED.sourceDateUpdated = incomingObj.sourceDateUpdated);
  incomingObj.sourceSystemRef && (administrativePenaltyNRCED.sourceSystemRef = incomingObj.sourceSystemRef);

  // Add limited-admin(such as admin:wf) read/write roles if user is a limited-admin user
  if (args) {
    postUtils.setAdditionalRoleOnRecord(
      administrativePenaltyNRCED,
      args.swagger.params.auth_payload.realm_access.roles,
      ADDITIONAL_ROLES
    );
  }

  // If incoming object has addRole: 'public' then read will look like ['sysadmin', 'public']
  if (incomingObj.addRole && incomingObj.addRole === 'public') {
    administrativePenaltyNRCED.read.push('public');
    administrativePenaltyNRCED.datePublished = new Date();
    administrativePenaltyNRCED.publishedBy = args.swagger.params.auth_payload.displayName;
  }

  administrativePenaltyNRCED = BusinessLogicManager.applyBusinessLogicOnPost(administrativePenaltyNRCED);

  return administrativePenaltyNRCED;
};
