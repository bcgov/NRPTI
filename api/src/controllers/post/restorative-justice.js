const mongoose = require('mongoose');
const ObjectId = require('mongoose').Types.ObjectId;
const postUtils = require('../../utils/post-utils');
const BusinessLogicManager = require('../../utils/business-logic-manager');
const { userHasValidRoles } = require('../../utils/auth-utils');
const utils = require('../../utils/constants/misc');

// Additional admin roles that can create this record, such as admin:wf or admin:flnro
const ADDITIONAL_ROLES = [
  utils.ApplicationRoles.ADMIN_FLNRO,
  utils.ApplicationRoles.ADMIN_FLNR_NRO,
  utils.ApplicationRoles.ADMIN_AGRI,
  utils.ApplicationRoles.ADMIN_ENV_EPD,
  utils.ApplicationRoles.ADMIN_ALC
];
exports.ADDITIONAL_ROLES = ADDITIONAL_ROLES;

/**
 * Performs all operations necessary to create a master Restorative Justice record and its associated flavour records.
 *
 * Example of incomingObj
 *
 *  restorativeJustices: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'restorativeJustice',
 *      ...
 *      RestorativeJusticeLNG: {
 *        description: 'lng description'
 *        addRole: 'public',
 *        ...
 *      },
 *      RestorativeJusticeNRCED: {
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
    RestorativeJusticeLNG: this.createLNG,
    RestorativeJusticeNRCED: this.createNRCED
  };
  return await postUtils.createRecordWithFlavours(args, res, next, incomingObj, this.createMaster, flavourFunctions);
};

/**
 * Performs all operations necessary to create a master Restorative Justice record.
 *
 * Example of incomingObj
 *
 *  restorativeJustices: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'restorativeJustice',
 *      ...
 *      RestorativeJusticeLNG: {
 *        description: 'lng description'
 *        addRole: 'public',
 *        ...
 *      },
 *      RestorativeJusticeNRCED: {
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
 * @returns created master restorativeJustice record
 */
exports.createMaster = function(args, res, next, incomingObj, flavourIds) {
  let RestorativeJustice = mongoose.model('RestorativeJustice');
  let restorativeJustice = new RestorativeJustice();

  restorativeJustice._schemaName = 'RestorativeJustice';

  // set integration references
  incomingObj._epicProjectId &&
    ObjectId.isValid(incomingObj._epicProjectId) &&
    (restorativeJustice._epicProjectId = new ObjectId(incomingObj._epicProjectId));
  incomingObj._sourceRefId &&
    ObjectId.isValid(incomingObj._sourceRefId) &&
    (restorativeJustice._sourceRefId = new ObjectId(incomingObj._sourceRefId));
  incomingObj._epicMilestoneId &&
    ObjectId.isValid(incomingObj._epicMilestoneId) &&
    (restorativeJustice._epicMilestoneId = new ObjectId(incomingObj._epicMilestoneId));
  incomingObj.collectionId &&
    ObjectId.isValid(incomingObj.collectionId) &&
    (restorativeJustice.collectionId = new ObjectId(incomingObj.collectionId));

  // set permissions
  restorativeJustice.read = utils.ApplicationAdminRoles;
  restorativeJustice.write = utils.ApplicationAdminRoles;

  // set forward references
  if (flavourIds && flavourIds.length) {
    flavourIds.forEach(id => {
      if (ObjectId.isValid(id)) {
        restorativeJustice._flavourRecords.push(new ObjectId(id));
      }
    });
  }

  // set data
  incomingObj.recordName && (restorativeJustice.recordName = incomingObj.recordName);
  restorativeJustice.recordType = 'Restorative Justice';
  incomingObj.dateIssued && (restorativeJustice.dateIssued = incomingObj.dateIssued);
  incomingObj.issuingAgency && (restorativeJustice.issuingAgency = incomingObj.issuingAgency);
  incomingObj.author && (restorativeJustice.author = incomingObj.author);

  incomingObj.legislation &&
    incomingObj.legislation.act &&
    (restorativeJustice.legislation.act = incomingObj.legislation.act);
  incomingObj.legislation &&
    incomingObj.legislation.regulation &&
    (restorativeJustice.legislation.regulation = incomingObj.legislation.regulation);
  incomingObj.legislation &&
    incomingObj.legislation.section &&
    (restorativeJustice.legislation.section = incomingObj.legislation.section);
  incomingObj.legislation &&
    incomingObj.legislation.subSection &&
    (restorativeJustice.legislation.subSection = incomingObj.legislation.subSection);
  incomingObj.legislation &&
    incomingObj.legislation.paragraph &&
    (restorativeJustice.legislation.paragraph = incomingObj.legislation.paragraph);

  incomingObj.offence && (restorativeJustice.offence = incomingObj.offence);

  restorativeJustice.issuedTo.read = utils.ApplicationAdminRoles;
  restorativeJustice.issuedTo.write = utils.ApplicationAdminRoles;
  incomingObj.issuedTo && incomingObj.issuedTo.type && (restorativeJustice.issuedTo.type = incomingObj.issuedTo.type);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.companyName &&
    (restorativeJustice.issuedTo.companyName = incomingObj.issuedTo.companyName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.firstName &&
    (restorativeJustice.issuedTo.firstName = incomingObj.issuedTo.firstName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.middleName &&
    (restorativeJustice.issuedTo.middleName = incomingObj.issuedTo.middleName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.lastName &&
    (restorativeJustice.issuedTo.lastName = incomingObj.issuedTo.lastName);
  incomingObj.issuedTo &&
    (restorativeJustice.issuedTo.fullName = postUtils.getIssuedToFullNameValue(incomingObj.issuedTo));
  incomingObj.issuedTo &&
    incomingObj.issuedTo.dateOfBirth &&
    (restorativeJustice.issuedTo.dateOfBirth = incomingObj.issuedTo.dateOfBirth);

  incomingObj.projectName && (restorativeJustice.projectName = incomingObj.projectName);
  incomingObj.location && (restorativeJustice.location = incomingObj.location);
  incomingObj.centroid && (restorativeJustice.centroid = incomingObj.centroid);
  incomingObj.penalties && (restorativeJustice.penalties = incomingObj.penalties);
  incomingObj.documents && (restorativeJustice.documents = incomingObj.documents);

  // set meta
  restorativeJustice.addedBy = args.swagger.params.auth_payload.displayName;
  restorativeJustice.dateAdded = new Date();

  // set data source references
  incomingObj.sourceDateAdded && (restorativeJustice.sourceDateAdded = incomingObj.sourceDateAdded);
  incomingObj.sourceDateUpdated && (restorativeJustice.sourceDateUpdated = incomingObj.sourceDateUpdated);
  incomingObj.sourceSystemRef && (restorativeJustice.sourceSystemRef = incomingObj.sourceSystemRef);
  incomingObj.isNrcedPublished && (restorativeJustice.isNrcedPublished = incomingObj.isNrcedPublished);
  incomingObj.isLngPublished && (restorativeJustice.isLngPublished = incomingObj.isLngPublished);

  // Add limited-admin(such as admin:wf) read/write roles if user is a limited-admin user
  if (args) {
    postUtils.setAdditionalRoleOnRecord(
      restorativeJustice,
      args.swagger.params.auth_payload.realm_access.roles,
      ADDITIONAL_ROLES
    );
  }

  return restorativeJustice;
};

/**
 * Performs all operations necessary to create a LNG Restorative Justice record.
 *
 * Example of incomingObj
 *
 *  restorativeJustices: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'restorativeJustice',
 *      ...
 *      RestorativeJusticeLNG: {
 *        description: 'lng description'
 *        addRole: 'public',
 *        ...
 *      },
 *      RestorativeJusticeNRCED: {
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
 * @returns created lng restorativeJustice record
 */
exports.createLNG = function(args, res, next, incomingObj) {
  // Confirm user has correct role.
  if (
    !userHasValidRoles(
      [utils.ApplicationRoles.ADMIN, utils.ApplicationRoles.ADMIN_LNG, ...ADDITIONAL_ROLES],
      args.swagger.params.auth_payload.realm_access.roles
    )
  ) {
    throw new Error('Missing valid user role.');
  }

  let RestorativeJusticeLNG = mongoose.model('RestorativeJusticeLNG');
  let restorativeJusticeLNG = new RestorativeJusticeLNG();

  restorativeJusticeLNG._schemaName = 'RestorativeJusticeLNG';

  // set integration references
  incomingObj._epicProjectId &&
    ObjectId.isValid(incomingObj._epicProjectId) &&
    (restorativeJusticeLNG._epicProjectId = new ObjectId(incomingObj._epicProjectId));
  incomingObj._sourceRefId &&
    ObjectId.isValid(incomingObj._sourceRefId) &&
    (restorativeJusticeLNG._sourceRefId = new ObjectId(incomingObj._sourceRefId));
  incomingObj._epicMilestoneId &&
    ObjectId.isValid(incomingObj._epicMilestoneId) &&
    (restorativeJusticeLNG._epicMilestoneId = new ObjectId(incomingObj._epicMilestoneId));

  // set permissions and meta
  restorativeJusticeLNG.read = utils.ApplicationAdminRoles;
  restorativeJusticeLNG.write = [utils.ApplicationRoles.ADMIN, utils.ApplicationRoles.ADMIN_LNG];

  restorativeJusticeLNG.addedBy = args.swagger.params.auth_payload.displayName;
  restorativeJusticeLNG.dateAdded = new Date();

  // set master data
  incomingObj.recordName && (restorativeJusticeLNG.recordName = incomingObj.recordName);
  restorativeJusticeLNG.recordType = 'Restorative Justice';
  incomingObj.dateIssued && (restorativeJusticeLNG.dateIssued = incomingObj.dateIssued);
  incomingObj.issuingAgency && (restorativeJusticeLNG.issuingAgency = incomingObj.issuingAgency);
  incomingObj.author && (restorativeJusticeLNG.author = incomingObj.author);

  incomingObj.legislation &&
    incomingObj.legislation.act &&
    (restorativeJusticeLNG.legislation.act = incomingObj.legislation.act);
  incomingObj.legislation &&
    incomingObj.legislation.regulation &&
    (restorativeJusticeLNG.legislation.regulation = incomingObj.legislation.regulation);
  incomingObj.legislation &&
    incomingObj.legislation.section &&
    (restorativeJusticeLNG.legislation.section = incomingObj.legislation.section);
  incomingObj.legislation &&
    incomingObj.legislation.subSection &&
    (restorativeJusticeLNG.legislation.subSection = incomingObj.legislation.subSection);
  incomingObj.legislation &&
    incomingObj.legislation.paragraph &&
    (restorativeJusticeLNG.legislation.paragraph = incomingObj.legislation.paragraph);

  incomingObj.offence && (restorativeJusticeLNG.offence = incomingObj.offence);

  restorativeJusticeLNG.issuedTo.read = utils.ApplicationAdminRoles;
  restorativeJusticeLNG.issuedTo.write = [utils.ApplicationRoles.ADMIN, utils.ApplicationRoles.ADMIN_LNG];
  incomingObj.issuedTo &&
    incomingObj.issuedTo.type &&
    (restorativeJusticeLNG.issuedTo.type = incomingObj.issuedTo.type);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.companyName &&
    (restorativeJusticeLNG.issuedTo.companyName = incomingObj.issuedTo.companyName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.firstName &&
    (restorativeJusticeLNG.issuedTo.firstName = incomingObj.issuedTo.firstName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.middleName &&
    (restorativeJusticeLNG.issuedTo.middleName = incomingObj.issuedTo.middleName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.lastName &&
    (restorativeJusticeLNG.issuedTo.lastName = incomingObj.issuedTo.lastName);
  incomingObj.issuedTo &&
    (restorativeJusticeLNG.issuedTo.fullName = postUtils.getIssuedToFullNameValue(incomingObj.issuedTo));
  incomingObj.issuedTo &&
    incomingObj.issuedTo.dateOfBirth &&
    (restorativeJusticeLNG.issuedTo.dateOfBirth = incomingObj.issuedTo.dateOfBirth);

  incomingObj.projectName && (restorativeJusticeLNG.projectName = incomingObj.projectName);
  incomingObj.location && (restorativeJusticeLNG.location = incomingObj.location);
  incomingObj.centroid && (restorativeJusticeLNG.centroid = incomingObj.centroid);
  incomingObj.penalties && (restorativeJusticeLNG.penalties = incomingObj.penalties);
  incomingObj.documents && (restorativeJusticeLNG.documents = incomingObj.documents);

  // set flavour data
  incomingObj.description && (restorativeJusticeLNG.description = incomingObj.description);

  // set data source references
  incomingObj.sourceDateAdded && (restorativeJusticeLNG.sourceDateAdded = incomingObj.sourceDateAdded);
  incomingObj.sourceDateUpdated && (restorativeJusticeLNG.sourceDateUpdated = incomingObj.sourceDateUpdated);
  incomingObj.sourceSystemRef && (restorativeJusticeLNG.sourceSystemRef = incomingObj.sourceSystemRef);

  // Add limited-admin(such as admin:wf) read/write roles if user is a limited-admin user
  if (args) {
    postUtils.setAdditionalRoleOnRecord(
      restorativeJusticeLNG,
      args.swagger.params.auth_payload.realm_access.roles,
      ADDITIONAL_ROLES
    );
  }

  // If incoming object has addRole: 'public' then read will look like ['sysadmin', 'public']
  if (incomingObj.addRole && incomingObj.addRole === 'public') {
    restorativeJusticeLNG.read.push('public');
    restorativeJusticeLNG.datePublished = new Date();
    restorativeJusticeLNG.publishedBy = args.swagger.params.auth_payload.displayName;
  }

  restorativeJusticeLNG = BusinessLogicManager.applyBusinessLogicOnPost(restorativeJusticeLNG);

  return restorativeJusticeLNG;
};

/**
 * Performs all operations necessary to create a NRCED Restorative Justice record.
 *
 * Example of incomingObj
 *
 *  restorativeJustices: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'restorativeJustice',
 *      ...
 *      RestorativeJusticeLNG: {
 *        description: 'lng description'
 *        addRole: 'public',
 *        ...
 *      },
 *      RestorativeJusticeNRCED: {
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
 * @returns created nrced restorativeJustice record
 */
exports.createNRCED = function(args, res, next, incomingObj) {
  // Confirm user has correct role.
  if (
    !userHasValidRoles(
      [utils.ApplicationRoles.ADMIN, utils.ApplicationRoles.ADMIN_NRCED, ...ADDITIONAL_ROLES],
      args.swagger.params.auth_payload.realm_access.roles
    )
  ) {
    throw new Error('Missing valid user role.');
  }

  let RestorativeJusticeNRCED = mongoose.model('RestorativeJusticeNRCED');
  let restorativeJusticeNRCED = new RestorativeJusticeNRCED();

  restorativeJusticeNRCED._schemaName = 'RestorativeJusticeNRCED';

  // set integration references
  incomingObj._epicProjectId &&
    ObjectId.isValid(incomingObj._epicProjectId) &&
    (restorativeJusticeNRCED._epicProjectId = new ObjectId(incomingObj._epicProjectId));
  incomingObj._sourceRefId &&
    ObjectId.isValid(incomingObj._sourceRefId) &&
    (restorativeJusticeNRCED._sourceRefId = new ObjectId(incomingObj._sourceRefId));
  incomingObj._epicMilestoneId &&
    ObjectId.isValid(incomingObj._epicMilestoneId) &&
    (restorativeJusticeNRCED._epicMilestoneId = new ObjectId(incomingObj._epicMilestoneId));

  // set permissions and meta
  restorativeJusticeNRCED.read = utils.ApplicationAdminRoles;
  restorativeJusticeNRCED.write = [utils.ApplicationRoles.ADMIN, utils.ApplicationRoles.ADMIN_NRCED];

  restorativeJusticeNRCED.addedBy = args.swagger.params.auth_payload.displayName;
  restorativeJusticeNRCED.dateAdded = new Date();

  // set master data
  incomingObj.recordName && (restorativeJusticeNRCED.recordName = incomingObj.recordName);
  restorativeJusticeNRCED.recordType = 'Restorative Justice';
  incomingObj.dateIssued && (restorativeJusticeNRCED.dateIssued = incomingObj.dateIssued);
  incomingObj.issuingAgency && (restorativeJusticeNRCED.issuingAgency = incomingObj.issuingAgency);
  incomingObj.author && (restorativeJusticeNRCED.author = incomingObj.author);

  incomingObj.legislation &&
    incomingObj.legislation.act &&
    (restorativeJusticeNRCED.legislation.act = incomingObj.legislation.act);
  incomingObj.legislation &&
    incomingObj.legislation.regulation &&
    (restorativeJusticeNRCED.legislation.regulation = incomingObj.legislation.regulation);
  incomingObj.legislation &&
    incomingObj.legislation.section &&
    (restorativeJusticeNRCED.legislation.section = incomingObj.legislation.section);
  incomingObj.legislation &&
    incomingObj.legislation.subSection &&
    (restorativeJusticeNRCED.legislation.subSection = incomingObj.legislation.subSection);
  incomingObj.legislation &&
    incomingObj.legislation.paragraph &&
    (restorativeJusticeNRCED.legislation.paragraph = incomingObj.legislation.paragraph);

  incomingObj.offence && (restorativeJusticeNRCED.offence = incomingObj.offence);

  restorativeJusticeNRCED.issuedTo.read = utils.ApplicationAdminRoles;
  restorativeJusticeNRCED.issuedTo.write = [utils.ApplicationRoles.ADMIN, utils.ApplicationRoles.ADMIN_NRCED];
  incomingObj.issuedTo &&
    incomingObj.issuedTo.type &&
    (restorativeJusticeNRCED.issuedTo.type = incomingObj.issuedTo.type);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.companyName &&
    (restorativeJusticeNRCED.issuedTo.companyName = incomingObj.issuedTo.companyName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.firstName &&
    (restorativeJusticeNRCED.issuedTo.firstName = incomingObj.issuedTo.firstName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.middleName &&
    (restorativeJusticeNRCED.issuedTo.middleName = incomingObj.issuedTo.middleName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.lastName &&
    (restorativeJusticeNRCED.issuedTo.lastName = incomingObj.issuedTo.lastName);
  incomingObj.issuedTo &&
    (restorativeJusticeNRCED.issuedTo.fullName = postUtils.getIssuedToFullNameValue(incomingObj.issuedTo));
  incomingObj.issuedTo &&
    incomingObj.issuedTo.dateOfBirth &&
    (restorativeJusticeNRCED.issuedTo.dateOfBirth = incomingObj.issuedTo.dateOfBirth);

  incomingObj.projectName && (restorativeJusticeNRCED.projectName = incomingObj.projectName);
  incomingObj.location && (restorativeJusticeNRCED.location = incomingObj.location);
  incomingObj.centroid && (restorativeJusticeNRCED.centroid = incomingObj.centroid);
  incomingObj.penalties && (restorativeJusticeNRCED.penalties = incomingObj.penalties);
  incomingObj.documents && (restorativeJusticeNRCED.documents = incomingObj.documents);

  // set flavour data
  incomingObj.summary && (restorativeJusticeNRCED.summary = incomingObj.summary);

  // set data source references
  incomingObj.sourceDateAdded && (restorativeJusticeNRCED.sourceDateAdded = incomingObj.sourceDateAdded);
  incomingObj.sourceDateUpdated && (restorativeJusticeNRCED.sourceDateUpdated = incomingObj.sourceDateUpdated);
  incomingObj.sourceSystemRef && (restorativeJusticeNRCED.sourceSystemRef = incomingObj.sourceSystemRef);

  // Add limited-admin(such as admin:wf) read/write roles if user is a limited-admin user
  if (args) {
    postUtils.setAdditionalRoleOnRecord(
      restorativeJusticeNRCED,
      args.swagger.params.auth_payload.realm_access.roles,
      ADDITIONAL_ROLES
    );
  }

  // If incoming object has addRole: 'public' then read will look like ['sysadmin', 'public']
  if (incomingObj.addRole && incomingObj.addRole === 'public') {
    restorativeJusticeNRCED.read.push('public');
    restorativeJusticeNRCED.datePublished = new Date();
    restorativeJusticeNRCED.publishedBy = args.swagger.params.auth_payload.displayName;
  }

  restorativeJusticeNRCED = BusinessLogicManager.applyBusinessLogicOnPost(restorativeJusticeNRCED);

  return restorativeJusticeNRCED;
};
