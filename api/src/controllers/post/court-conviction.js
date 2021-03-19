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
  utils.ApplicationRoles.ADMIN_ENV_COS,
  utils.ApplicationRoles.ADMIN_ENV_BCPARKS,
  utils.ApplicationRoles.ADMIN_ALC
];
exports.ADDITIONAL_ROLES = ADDITIONAL_ROLES;

/**
 * Performs all operations necessary to create a master Court Conviction record and its associated flavour records.
 *
 * Example of incomingObj
 *
 *  courtConvictions: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'courtConviction',
 *      ...
 *      CourtConvictionLNG: {
 *        description: 'lng description'
 *        addRole: 'public',
 *        ...
 *      },
 *      CourtConvictionNRCED: {
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
    CourtConvictionLNG: this.createLNG,
    CourtConvictionNRCED: this.createNRCED
  };
  return await postUtils.createRecordWithFlavours(args, res, next, incomingObj, this.createMaster, flavourFunctions);
};

/**
 * Performs all operations necessary to create a master Court Conviction record.
 *
 * Example of incomingObj
 *
 *  courtConvictions: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'courtConviction',
 *      ...
 *      CourtConvictionLNG: {
 *        description: 'lng description'
 *        addRole: 'public',
 *        ...
 *      },
 *      CourtConvictionNRCED: {
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
 * @returns created master courtConviction record
 */
exports.createMaster = function(args, res, next, incomingObj, flavourIds) {
  let CourtConviction = mongoose.model('CourtConviction');
  let courtConviction = new CourtConviction();

  courtConviction._schemaName = 'CourtConviction';

  // set integration references
  incomingObj._epicProjectId &&
    ObjectId.isValid(incomingObj._epicProjectId) &&
    (courtConviction._epicProjectId = new ObjectId(incomingObj._epicProjectId));
  incomingObj._sourceRefId &&
    ObjectId.isValid(incomingObj._sourceRefId) &&
    (courtConviction._sourceRefId = new ObjectId(incomingObj._sourceRefId));
  incomingObj._epicMilestoneId &&
    ObjectId.isValid(incomingObj._epicMilestoneId) &&
    (courtConviction._epicMilestoneId = new ObjectId(incomingObj._epicMilestoneId));
  incomingObj.collectionId &&
    ObjectId.isValid(incomingObj.collectionId) &&
    (courtConviction.collectionId = new ObjectId(incomingObj.collectionId));

  // set permissions
  courtConviction.read = utils.ApplicationAdminRoles;
  courtConviction.write = utils.ApplicationAdminRoles;

  // set forward references
  if (flavourIds && flavourIds.length) {
    flavourIds.forEach(id => {
      if (ObjectId.isValid(id)) {
        courtConviction._flavourRecords.push(new ObjectId(id));
      }
    });
  }

  // set data
  incomingObj.recordName && (courtConviction.recordName = incomingObj.recordName);
  courtConviction.recordType = 'Court Conviction';
  courtConviction.recordSubtype && (courtConviction.recordSubtype = incomingObj.recordSubtype);
  incomingObj.dateIssued && (courtConviction.dateIssued = incomingObj.dateIssued);
  incomingObj.issuingAgency && (courtConviction.issuingAgency = incomingObj.issuingAgency);
  incomingObj.author && (courtConviction.author = incomingObj.author);

  incomingObj.legislation &&
    incomingObj.legislation.act &&
    (courtConviction.legislation.act = incomingObj.legislation.act);
  incomingObj.legislation &&
    incomingObj.legislation.regulation &&
    (courtConviction.legislation.regulation = incomingObj.legislation.regulation);
  incomingObj.legislation &&
    incomingObj.legislation.section &&
    (courtConviction.legislation.section = incomingObj.legislation.section);
  incomingObj.legislation &&
    incomingObj.legislation.subSection &&
    (courtConviction.legislation.subSection = incomingObj.legislation.subSection);
  incomingObj.legislation &&
    incomingObj.legislation.paragraph &&
    (courtConviction.legislation.paragraph = incomingObj.legislation.paragraph);

  incomingObj.offence && (courtConviction.offence = incomingObj.offence);

  courtConviction.issuedTo.read = utils.ApplicationAdminRoles;
  courtConviction.issuedTo.write = utils.ApplicationAdminRoles;
  incomingObj.issuedTo && incomingObj.issuedTo.type && (courtConviction.issuedTo.type = incomingObj.issuedTo.type);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.companyName &&
    (courtConviction.issuedTo.companyName = incomingObj.issuedTo.companyName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.firstName &&
    (courtConviction.issuedTo.firstName = incomingObj.issuedTo.firstName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.middleName &&
    (courtConviction.issuedTo.middleName = incomingObj.issuedTo.middleName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.lastName &&
    (courtConviction.issuedTo.lastName = incomingObj.issuedTo.lastName);
  incomingObj.issuedTo &&
    (courtConviction.issuedTo.fullName = postUtils.getIssuedToFullNameValue(incomingObj.issuedTo));
  incomingObj.issuedTo &&
    incomingObj.issuedTo.dateOfBirth &&
    (courtConviction.issuedTo.dateOfBirth = incomingObj.issuedTo.dateOfBirth);

  incomingObj.projectName && (courtConviction.projectName = incomingObj.projectName);
  incomingObj.location && (courtConviction.location = incomingObj.location);
  incomingObj.centroid && (courtConviction.centroid = incomingObj.centroid);
  incomingObj.penalties && (courtConviction.penalties = incomingObj.penalties);
  incomingObj.documents && (courtConviction.documents = incomingObj.documents);

  // set meta
  courtConviction.addedBy = args.swagger.params.auth_payload.displayName;
  courtConviction.dateAdded = new Date();

  // set data source references
  incomingObj.sourceDateAdded && (courtConviction.sourceDateAdded = incomingObj.sourceDateAdded);
  incomingObj.sourceDateUpdated && (courtConviction.sourceDateUpdated = incomingObj.sourceDateUpdated);
  incomingObj.sourceSystemRef && (courtConviction.sourceSystemRef = incomingObj.sourceSystemRef);
  incomingObj._sourceRefCoorsId && (courtConviction._sourceRefCoorsId = incomingObj._sourceRefCoorsId);
  incomingObj.isNrcedPublished && (courtConviction.isNrcedPublished = incomingObj.isNrcedPublished);
  incomingObj.isLngPublished && (courtConviction.isLngPublished = incomingObj.isLngPublished);

  // Add limited-admin(such as admin:wf) read/write roles if user is a limited-admin user
  if (args) {
    postUtils.setAdditionalRoleOnRecord(
      courtConviction,
      args.swagger.params.auth_payload.realm_access.roles,
      ADDITIONAL_ROLES
    );
  }

  return courtConviction;
};

/**
 * Performs all operations necessary to create a LNG Court Conviction record.
 *
 * Example of incomingObj
 *
 *  courtConvictions: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'courtConviction',
 *      ...
 *      CourtConvictionLNG: {
 *        description: 'lng description'
 *        addRole: 'public',
 *        ...
 *      },
 *      CourtConvictionNRCED: {
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
 * @returns created lng courtConviction record
 */
exports.createLNG = function(args, res, next, incomingObj) {
  // Confirm user has correct role for this type of record.
  if (
    !userHasValidRoles(
      [utils.ApplicationRoles.ADMIN, utils.ApplicationRoles.ADMIN_LNG, ...ADDITIONAL_ROLES],
      args.swagger.params.auth_payload.realm_access.roles
    )
  ) {
    throw new Error('Missing valid user role.');
  }

  let CourtConvictionLNG = mongoose.model('CourtConvictionLNG');
  let courtConvictionLNG = new CourtConvictionLNG();

  courtConvictionLNG._schemaName = 'CourtConvictionLNG';

  // set integration references
  incomingObj._epicProjectId &&
    ObjectId.isValid(incomingObj._epicProjectId) &&
    (courtConvictionLNG._epicProjectId = new ObjectId(incomingObj._epicProjectId));
  incomingObj._sourceRefId &&
    ObjectId.isValid(incomingObj._sourceRefId) &&
    (courtConvictionLNG._sourceRefId = new ObjectId(incomingObj._sourceRefId));
  incomingObj._epicMilestoneId &&
    ObjectId.isValid(incomingObj._epicMilestoneId) &&
    (courtConvictionLNG._epicMilestoneId = new ObjectId(incomingObj._epicMilestoneId));

  // set permissions and meta
  courtConvictionLNG.read = utils.ApplicationAdminRoles;
  courtConvictionLNG.write = [utils.ApplicationRoles.ADMIN, utils.ApplicationRoles.ADMIN_LNG];

  courtConvictionLNG.addedBy = args.swagger.params.auth_payload.displayName;
  courtConvictionLNG.dateAdded = new Date();

  // set master data
  incomingObj.recordName && (courtConvictionLNG.recordName = incomingObj.recordName);
  courtConvictionLNG.recordType = 'Court Conviction';
  incomingObj.recordSubtype && (courtConvictionLNG.recordSubtype = incomingObj.recordSubtype);
  incomingObj.dateIssued && (courtConvictionLNG.dateIssued = incomingObj.dateIssued);
  incomingObj.issuingAgency && (courtConvictionLNG.issuingAgency = incomingObj.issuingAgency);
  incomingObj.author && (courtConvictionLNG.author = incomingObj.author);

  incomingObj.legislation &&
    incomingObj.legislation.act &&
    (courtConvictionLNG.legislation.act = incomingObj.legislation.act);
  incomingObj.legislation &&
    incomingObj.legislation.regulation &&
    (courtConvictionLNG.legislation.regulation = incomingObj.legislation.regulation);
  incomingObj.legislation &&
    incomingObj.legislation.section &&
    (courtConvictionLNG.legislation.section = incomingObj.legislation.section);
  incomingObj.legislation &&
    incomingObj.legislation.subSection &&
    (courtConvictionLNG.legislation.subSection = incomingObj.legislation.subSection);
  incomingObj.legislation &&
    incomingObj.legislation.paragraph &&
    (courtConvictionLNG.legislation.paragraph = incomingObj.legislation.paragraph);

  incomingObj.offence && (courtConvictionLNG.offence = incomingObj.offence);

  courtConvictionLNG.issuedTo.read = utils.ApplicationAdminRoles;
  courtConvictionLNG.issuedTo.write = [utils.ApplicationRoles.ADMIN, utils.ApplicationRoles.ADMIN_LNG];
  incomingObj.issuedTo && incomingObj.issuedTo.type && (courtConvictionLNG.issuedTo.type = incomingObj.issuedTo.type);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.companyName &&
    (courtConvictionLNG.issuedTo.companyName = incomingObj.issuedTo.companyName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.firstName &&
    (courtConvictionLNG.issuedTo.firstName = incomingObj.issuedTo.firstName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.middleName &&
    (courtConvictionLNG.issuedTo.middleName = incomingObj.issuedTo.middleName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.lastName &&
    (courtConvictionLNG.issuedTo.lastName = incomingObj.issuedTo.lastName);
  incomingObj.issuedTo &&
    (courtConvictionLNG.issuedTo.fullName = postUtils.getIssuedToFullNameValue(incomingObj.issuedTo));
  incomingObj.issuedTo &&
    incomingObj.issuedTo.dateOfBirth &&
    (courtConvictionLNG.issuedTo.dateOfBirth = incomingObj.issuedTo.dateOfBirth);

  incomingObj.projectName && (courtConvictionLNG.projectName = incomingObj.projectName);
  incomingObj.location && (courtConvictionLNG.location = incomingObj.location);
  incomingObj.centroid && (courtConvictionLNG.centroid = incomingObj.centroid);
  incomingObj.penalties && (courtConvictionLNG.penalties = incomingObj.penalties);
  incomingObj.documents && (courtConvictionLNG.documents = incomingObj.documents);

  // set flavour data
  incomingObj.description && (courtConvictionLNG.description = incomingObj.description);

  // set data source references
  incomingObj.sourceDateAdded && (courtConvictionLNG.sourceDateAdded = incomingObj.sourceDateAdded);
  incomingObj.sourceDateUpdated && (courtConvictionLNG.sourceDateUpdated = incomingObj.sourceDateUpdated);
  incomingObj.sourceSystemRef && (courtConvictionLNG.sourceSystemRef = incomingObj.sourceSystemRef);

  // Add limited-admin(such as admin:wf) read/write roles if user is a limited-admin user
  if (args) {
    postUtils.setAdditionalRoleOnRecord(
      courtConvictionLNG,
      args.swagger.params.auth_payload.realm_access.roles,
      ADDITIONAL_ROLES
    );
  }

  // If incoming object has addRole: 'public' then read will look like ['sysadmin', 'public']
  if (incomingObj.addRole && incomingObj.addRole === 'public') {
    courtConvictionLNG.read.push('public');
    courtConvictionLNG.datePublished = new Date();
    courtConvictionLNG.publishedBy = args.swagger.params.auth_payload.displayName;
  }

  courtConvictionLNG = BusinessLogicManager.applyBusinessLogicOnPost(courtConvictionLNG);

  return courtConvictionLNG;
};

/**
 * Performs all operations necessary to create a NRCED Court Conviction record.
 *
 * Example of incomingObj
 *
 *  courtConvictions: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'courtConviction',
 *      ...
 *      CourtConvictionLNG: {
 *        description: 'lng description'
 *        addRole: 'public',
 *        ...
 *      },
 *      CourtConvictionNRCED: {
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
 * @returns created nrced courtConviction record
 */
exports.createNRCED = function(args, res, next, incomingObj) {
  // Confirm user has correct role for this type of record.
  if (
    !userHasValidRoles(
      [utils.ApplicationRoles.ADMIN_NRCED, utils.ApplicationRoles.ADMIN, ...ADDITIONAL_ROLES],
      args.swagger.params.auth_payload.realm_access.roles
    )
  ) {
    throw new Error('Missing valid user role.');
  }

  let CourtConvictionNRCED = mongoose.model('CourtConvictionNRCED');
  let courtConvictionNRCED = new CourtConvictionNRCED();

  courtConvictionNRCED._schemaName = 'CourtConvictionNRCED';

  // set integration references
  incomingObj._epicProjectId &&
    ObjectId.isValid(incomingObj._epicProjectId) &&
    (courtConvictionNRCED._epicProjectId = new ObjectId(incomingObj._epicProjectId));
  incomingObj._sourceRefId &&
    ObjectId.isValid(incomingObj._sourceRefId) &&
    (courtConvictionNRCED._sourceRefId = new ObjectId(incomingObj._sourceRefId));
  incomingObj._epicMilestoneId &&
    ObjectId.isValid(incomingObj._epicMilestoneId) &&
    (courtConvictionNRCED._epicMilestoneId = new ObjectId(incomingObj._epicMilestoneId));

  // set permissions and meta
  courtConvictionNRCED.read = utils.ApplicationAdminRoles;
  courtConvictionNRCED.write = [utils.ApplicationRoles.ADMIN, utils.ApplicationRoles.ADMIN_NRCED];

  courtConvictionNRCED.addedBy = args.swagger.params.auth_payload.displayName;
  courtConvictionNRCED.dateAdded = new Date();

  // set master data
  incomingObj.recordName && (courtConvictionNRCED.recordName = incomingObj.recordName);
  courtConvictionNRCED.recordType = 'Court Conviction';
  incomingObj.recordSubtype && (courtConvictionNRCED.recordSubtype = incomingObj.recordSubtype);
  incomingObj.dateIssued && (courtConvictionNRCED.dateIssued = incomingObj.dateIssued);
  incomingObj.issuingAgency && (courtConvictionNRCED.issuingAgency = incomingObj.issuingAgency);
  incomingObj.author && (courtConvictionNRCED.author = incomingObj.author);

  incomingObj.legislation &&
    incomingObj.legislation.act &&
    (courtConvictionNRCED.legislation.act = incomingObj.legislation.act);
  incomingObj.legislation &&
    incomingObj.legislation.regulation &&
    (courtConvictionNRCED.legislation.regulation = incomingObj.legislation.regulation);
  incomingObj.legislation &&
    incomingObj.legislation.section &&
    (courtConvictionNRCED.legislation.section = incomingObj.legislation.section);
  incomingObj.legislation &&
    incomingObj.legislation.subSection &&
    (courtConvictionNRCED.legislation.subSection = incomingObj.legislation.subSection);
  incomingObj.legislation &&
    incomingObj.legislation.paragraph &&
    (courtConvictionNRCED.legislation.paragraph = incomingObj.legislation.paragraph);

  incomingObj.offence && (courtConvictionNRCED.offence = incomingObj.offence);

  courtConvictionNRCED.issuedTo.read = utils.ApplicationAdminRoles;
  courtConvictionNRCED.issuedTo.write = [utils.ApplicationRoles.ADMIN, utils.ApplicationRoles.ADMIN_NRCED];
  incomingObj.issuedTo && incomingObj.issuedTo.type && (courtConvictionNRCED.issuedTo.type = incomingObj.issuedTo.type);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.companyName &&
    (courtConvictionNRCED.issuedTo.companyName = incomingObj.issuedTo.companyName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.firstName &&
    (courtConvictionNRCED.issuedTo.firstName = incomingObj.issuedTo.firstName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.middleName &&
    (courtConvictionNRCED.issuedTo.middleName = incomingObj.issuedTo.middleName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.lastName &&
    (courtConvictionNRCED.issuedTo.lastName = incomingObj.issuedTo.lastName);
  incomingObj.issuedTo &&
    (courtConvictionNRCED.issuedTo.fullName = postUtils.getIssuedToFullNameValue(incomingObj.issuedTo));
  incomingObj.issuedTo &&
    incomingObj.issuedTo.dateOfBirth &&
    (courtConvictionNRCED.issuedTo.dateOfBirth = incomingObj.issuedTo.dateOfBirth);

  incomingObj.projectName && (courtConvictionNRCED.projectName = incomingObj.projectName);
  incomingObj.location && (courtConvictionNRCED.location = incomingObj.location);
  incomingObj.centroid && (courtConvictionNRCED.centroid = incomingObj.centroid);
  incomingObj.penalties && (courtConvictionNRCED.penalties = incomingObj.penalties);
  incomingObj.documents && (courtConvictionNRCED.documents = incomingObj.documents);

  // set flavour data
  incomingObj.summary && (courtConvictionNRCED.summary = incomingObj.summary);

  // set data source references
  incomingObj.sourceDateAdded && (courtConvictionNRCED.sourceDateAdded = incomingObj.sourceDateAdded);
  incomingObj.sourceDateUpdated && (courtConvictionNRCED.sourceDateUpdated = incomingObj.sourceDateUpdated);
  incomingObj.sourceSystemRef && (courtConvictionNRCED.sourceSystemRef = incomingObj.sourceSystemRef);

  // Add limited-admin(such as admin:wf) read/write roles if user is a limited-admin user
  if (args) {
    postUtils.setAdditionalRoleOnRecord(
      courtConvictionNRCED,
      args.swagger.params.auth_payload.realm_access.roles,
      ADDITIONAL_ROLES
    );
  }

  // If incoming object has addRole: 'public' then read will look like ['sysadmin', 'public']
  if (incomingObj.addRole && incomingObj.addRole === 'public') {
    courtConvictionNRCED.read.push('public');
    courtConvictionNRCED.datePublished = new Date();
    courtConvictionNRCED.publishedBy = args.swagger.params.auth_payload.displayName;
  }

  courtConvictionNRCED = BusinessLogicManager.applyBusinessLogicOnPost(courtConvictionNRCED);

  return courtConvictionNRCED;
};
