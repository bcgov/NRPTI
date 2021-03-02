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
 * Performs all operations necessary to create a master Ticket record and its associated flavour records.
 *
 * Example of incomingObj
 *
 *  tickets: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'ticket',
 *      ...
 *      TicketLNG: {
 *        description: 'lng description'
 *        addRole: 'public',
 *        ...
 *      },
 *      TicketNRCED: {
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
    TicketLNG: this.createLNG,
    TicketNRCED: this.createNRCED
  };
  return await postUtils.createRecordWithFlavours(args, res, next, incomingObj, this.createMaster, flavourFunctions);
};

/**
 * Performs all operations necessary to create a master Ticket record.
 *
 * Example of incomingObj
 *
 *  tickets: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'ticket',
 *      ...
 *      TicketLNG: {
 *        description: 'lng description'
 *        addRole: 'public',
 *        ...
 *      },
 *      TicketNRCED: {
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
 * @returns created master ticket record
 */
exports.createMaster = function(args, res, next, incomingObj, flavourIds) {
  let Ticket = mongoose.model('Ticket');
  let ticket = new Ticket();

  ticket._schemaName = 'Ticket';

  // set integration references
  incomingObj._epicProjectId &&
    ObjectId.isValid(incomingObj._epicProjectId) &&
    (ticket._epicProjectId = new ObjectId(incomingObj._epicProjectId));
  incomingObj._sourceRefId &&
    ObjectId.isValid(incomingObj._sourceRefId) &&
    (ticket._sourceRefId = new ObjectId(incomingObj._sourceRefId));
  incomingObj._epicMilestoneId &&
    ObjectId.isValid(incomingObj._epicMilestoneId) &&
    (ticket._epicMilestoneId = new ObjectId(incomingObj._epicMilestoneId));
  incomingObj._sourceRefCoorsId && (ticket._sourceRefCoorsId = incomingObj._sourceRefCoorsId);
  incomingObj.collectionId &&
    ObjectId.isValid(incomingObj.collectionId) &&
    (ticket.collectionId = new ObjectId(incomingObj.collectionId));
  incomingObj._sourceRefStringId && (ticket._sourceRefStringId = incomingObj._sourceRefStringId);

  // set permissions
  ticket.read = utils.ApplicationAdminRoles;
  ticket.write = utils.ApplicationAdminRoles;

  // set forward references
  if (flavourIds && flavourIds.length) {
    flavourIds.forEach(id => {
      if (ObjectId.isValid(id)) {
        ticket._flavourRecords.push(new ObjectId(id));
      }
    });
  }

  // set data
  incomingObj.recordName && (ticket.recordName = incomingObj.recordName);
  ticket.recordType = 'Ticket';
  incomingObj.dateIssued && (ticket.dateIssued = incomingObj.dateIssued);
  incomingObj.issuingAgency && (ticket.issuingAgency = incomingObj.issuingAgency);
  incomingObj.author && (ticket.author = incomingObj.author);

  incomingObj.legislation && incomingObj.legislation.act && (ticket.legislation.act = incomingObj.legislation.act);
  incomingObj.legislation &&
    incomingObj.legislation.regulation &&
    (ticket.legislation.regulation = incomingObj.legislation.regulation);
  incomingObj.legislation &&
    incomingObj.legislation.section &&
    (ticket.legislation.section = incomingObj.legislation.section);
  incomingObj.legislation &&
    incomingObj.legislation.subSection &&
    (ticket.legislation.subSection = incomingObj.legislation.subSection);
  incomingObj.legislation &&
    incomingObj.legislation.paragraph &&
    (ticket.legislation.paragraph = incomingObj.legislation.paragraph);

  incomingObj.offence && (ticket.offence = incomingObj.offence);

  ticket.issuedTo.read = utils.ApplicationAdminRoles;
  ticket.issuedTo.write = utils.ApplicationAdminRoles;
  incomingObj.issuedTo && incomingObj.issuedTo.type && (ticket.issuedTo.type = incomingObj.issuedTo.type);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.companyName &&
    (ticket.issuedTo.companyName = incomingObj.issuedTo.companyName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.firstName &&
    (ticket.issuedTo.firstName = incomingObj.issuedTo.firstName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.middleName &&
    (ticket.issuedTo.middleName = incomingObj.issuedTo.middleName);
  incomingObj.issuedTo && incomingObj.issuedTo.lastName && (ticket.issuedTo.lastName = incomingObj.issuedTo.lastName);
  incomingObj.issuedTo && (ticket.issuedTo.fullName = postUtils.getIssuedToFullNameValue(incomingObj.issuedTo));
  incomingObj.issuedTo &&
    incomingObj.issuedTo.dateOfBirth &&
    (ticket.issuedTo.dateOfBirth = incomingObj.issuedTo.dateOfBirth);

  incomingObj.projectName && (ticket.projectName = incomingObj.projectName);
  incomingObj.location && (ticket.location = incomingObj.location);
  incomingObj.centroid && (ticket.centroid = incomingObj.centroid);
  incomingObj.penalties && (ticket.penalties = incomingObj.penalties);
  incomingObj.documents && (ticket.documents = incomingObj.documents);

  // set meta
  ticket.addedBy = args.swagger.params.auth_payload.displayName;
  ticket.dateAdded = new Date();

  // set data source references
  incomingObj.sourceDateAdded && (ticket.sourceDateAdded = incomingObj.sourceDateAdded);
  incomingObj.sourceDateUpdated && (ticket.sourceDateUpdated = incomingObj.sourceDateUpdated);
  incomingObj.sourceSystemRef && (ticket.sourceSystemRef = incomingObj.sourceSystemRef);
  incomingObj.isNrcedPublished && (ticket.isNrcedPublished = incomingObj.isNrcedPublished);
  incomingObj.isLngPublished && (ticket.isLngPublished = incomingObj.isLngPublished);

  // Add limited-admin(such as admin:wf) read/write roles if user is a limited-admin user
  if (args) {
    postUtils.setAdditionalRoleOnRecord(ticket, args.swagger.params.auth_payload.realm_access.roles, ADDITIONAL_ROLES);
  }

  return ticket;
};

/**
 * Performs all operations necessary to create a LNG Ticket record.
 *
 * Example of incomingObj
 *
 *  tickets: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'ticket',
 *      ...
 *      TicketLNG: {
 *        description: 'lng description'
 *        addRole: 'public',
 *        ...
 *      },
 *      TicketNRCED: {
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
 * @returns created lng ticket record
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

  let TicketLNG = mongoose.model('TicketLNG');
  let ticketLNG = new TicketLNG();

  ticketLNG._schemaName = 'TicketLNG';

  // set integration references
  incomingObj._epicProjectId &&
    ObjectId.isValid(incomingObj._epicProjectId) &&
    (ticketLNG._epicProjectId = new ObjectId(incomingObj._epicProjectId));
  incomingObj._sourceRefId &&
    ObjectId.isValid(incomingObj._sourceRefId) &&
    (ticketLNG._sourceRefId = new ObjectId(incomingObj._sourceRefId));
  incomingObj._epicMilestoneId &&
    ObjectId.isValid(incomingObj._epicMilestoneId) &&
    (ticketLNG._epicMilestoneId = new ObjectId(incomingObj._epicMilestoneId));
  incomingObj._sourceRefCoorsId && (ticketLNG._sourceRefCoorsId = incomingObj._sourceRefCoorsId);
  incomingObj._sourceRefStringId && (ticketLNG._sourceRefStringId = incomingObj._sourceRefStringId);

  // set permissions and meta
  ticketLNG.read = utils.ApplicationAdminRoles;
  ticketLNG.write = [utils.ApplicationRoles.ADMIN, utils.ApplicationRoles.ADMIN_LNG];

  ticketLNG.addedBy = args.swagger.params.auth_payload.displayName;
  ticketLNG.dateAdded = new Date();

  // set master data
  incomingObj.recordName && (ticketLNG.recordName = incomingObj.recordName);
  ticketLNG.recordType = 'Ticket';
  incomingObj.dateIssued && (ticketLNG.dateIssued = incomingObj.dateIssued);
  incomingObj.issuingAgency && (ticketLNG.issuingAgency = incomingObj.issuingAgency);
  incomingObj.author && (ticketLNG.author = incomingObj.author);

  incomingObj.legislation && incomingObj.legislation.act && (ticketLNG.legislation.act = incomingObj.legislation.act);
  incomingObj.legislation &&
    incomingObj.legislation.regulation &&
    (ticketLNG.legislation.regulation = incomingObj.legislation.regulation);
  incomingObj.legislation &&
    incomingObj.legislation.section &&
    (ticketLNG.legislation.section = incomingObj.legislation.section);
  incomingObj.legislation &&
    incomingObj.legislation.subSection &&
    (ticketLNG.legislation.subSection = incomingObj.legislation.subSection);
  incomingObj.legislation &&
    incomingObj.legislation.paragraph &&
    (ticketLNG.legislation.paragraph = incomingObj.legislation.paragraph);

  incomingObj.offence && (ticketLNG.offence = incomingObj.offence);

  ticketLNG.issuedTo.read = utils.ApplicationAdminRoles;
  ticketLNG.issuedTo.write = [utils.ApplicationRoles.ADMIN, utils.ApplicationRoles.ADMIN_LNG];
  incomingObj.issuedTo && incomingObj.issuedTo.type && (ticketLNG.issuedTo.type = incomingObj.issuedTo.type);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.companyName &&
    (ticketLNG.issuedTo.companyName = incomingObj.issuedTo.companyName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.firstName &&
    (ticketLNG.issuedTo.firstName = incomingObj.issuedTo.firstName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.middleName &&
    (ticketLNG.issuedTo.middleName = incomingObj.issuedTo.middleName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.lastName &&
    (ticketLNG.issuedTo.lastName = incomingObj.issuedTo.lastName);
  incomingObj.issuedTo && (ticketLNG.issuedTo.fullName = postUtils.getIssuedToFullNameValue(incomingObj.issuedTo));
  incomingObj.issuedTo &&
    incomingObj.issuedTo.dateOfBirth &&
    (ticketLNG.issuedTo.dateOfBirth = incomingObj.issuedTo.dateOfBirth);

  incomingObj.projectName && (ticketLNG.projectName = incomingObj.projectName);
  incomingObj.location && (ticketLNG.location = incomingObj.location);
  incomingObj.centroid && (ticketLNG.centroid = incomingObj.centroid);
  incomingObj.penalties && (ticketLNG.penalties = incomingObj.penalties);
  incomingObj.documents && (ticketLNG.documents = incomingObj.documents);

  // set flavour data
  incomingObj.description && (ticketLNG.description = incomingObj.description);

  // set data source references
  incomingObj.sourceDateAdded && (ticketLNG.sourceDateAdded = incomingObj.sourceDateAdded);
  incomingObj.sourceDateUpdated && (ticketLNG.sourceDateUpdated = incomingObj.sourceDateUpdated);
  incomingObj.sourceSystemRef && (ticketLNG.sourceSystemRef = incomingObj.sourceSystemRef);

  // Add limited-admin(such as admin:wf) read/write roles if user is a limited-admin user
  if (args) {
    postUtils.setAdditionalRoleOnRecord(
      ticketLNG,
      args.swagger.params.auth_payload.realm_access.roles,
      ADDITIONAL_ROLES
    );
  }

  // If incoming object has addRole: 'public' then read will look like ['sysadmin', 'public']
  if (incomingObj.addRole && incomingObj.addRole === 'public') {
    ticketLNG.read.push('public');
    ticketLNG.datePublished = new Date();
    ticketLNG.publishedBy = args.swagger.params.auth_payload.displayName;
  }

  ticketLNG = BusinessLogicManager.applyBusinessLogicOnPost(ticketLNG);

  return ticketLNG;
};

/**
 * Performs all operations necessary to create a NRCED Ticket record.
 *
 * Example of incomingObj
 *
 *  tickets: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'ticket',
 *      ...
 *      TicketLNG: {
 *        description: 'lng description'
 *        addRole: 'public',
 *        ...
 *      },
 *      TicketNRCED: {
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
 * @returns created nrced ticket record
 */
exports.createNRCED = function(args, res, next, incomingObj) {
  // Confirm user has correct role for this type of record.
  if (
    !userHasValidRoles(
      [utils.ApplicationRoles.ADMIN, utils.ApplicationRoles.ADMIN_NRCED, ...ADDITIONAL_ROLES],
      args.swagger.params.auth_payload.realm_access.roles
    )
  ) {
    throw new Error('Missing valid user role.');
  }

  let TicketNRCED = mongoose.model('TicketNRCED');
  let ticketNRCED = new TicketNRCED();

  ticketNRCED._schemaName = 'TicketNRCED';

  // set integration references
  incomingObj._epicProjectId &&
    ObjectId.isValid(incomingObj._epicProjectId) &&
    (ticketNRCED._epicProjectId = new ObjectId(incomingObj._epicProjectId));
  incomingObj._sourceRefId &&
    ObjectId.isValid(incomingObj._sourceRefId) &&
    (ticketNRCED._sourceRefId = new ObjectId(incomingObj._sourceRefId));
  incomingObj._epicMilestoneId &&
    ObjectId.isValid(incomingObj._epicMilestoneId) &&
    (ticketNRCED._epicMilestoneId = new ObjectId(incomingObj._epicMilestoneId));
  incomingObj._sourceRefCoorsId && (ticketNRCED._sourceRefCoorsId = incomingObj._sourceRefCoorsId);
  incomingObj._sourceRefStringId && (ticketNRCED._sourceRefStringId = incomingObj._sourceRefStringId);

  // set permissions and meta
  ticketNRCED.read = utils.ApplicationAdminRoles;
  ticketNRCED.write = [utils.ApplicationRoles.ADMIN, utils.ApplicationRoles.ADMIN_NRCED];

  ticketNRCED.addedBy = args.swagger.params.auth_payload.displayName;
  ticketNRCED.dateAdded = new Date();

  // set master data
  incomingObj.recordName && (ticketNRCED.recordName = incomingObj.recordName);
  ticketNRCED.recordType = 'Ticket';
  incomingObj.dateIssued && (ticketNRCED.dateIssued = incomingObj.dateIssued);
  incomingObj.issuingAgency && (ticketNRCED.issuingAgency = incomingObj.issuingAgency);
  incomingObj.author && (ticketNRCED.author = incomingObj.author);

  incomingObj.legislation && incomingObj.legislation.act && (ticketNRCED.legislation.act = incomingObj.legislation.act);
  incomingObj.legislation &&
    incomingObj.legislation.regulation &&
    (ticketNRCED.legislation.regulation = incomingObj.legislation.regulation);
  incomingObj.legislation &&
    incomingObj.legislation.section &&
    (ticketNRCED.legislation.section = incomingObj.legislation.section);
  incomingObj.legislation &&
    incomingObj.legislation.subSection &&
    (ticketNRCED.legislation.subSection = incomingObj.legislation.subSection);
  incomingObj.legislation &&
    incomingObj.legislation.paragraph &&
    (ticketNRCED.legislation.paragraph = incomingObj.legislation.paragraph);

  incomingObj.offence && (ticketNRCED.offence = incomingObj.offence);

  ticketNRCED.issuedTo.read = utils.ApplicationAdminRoles;
  ticketNRCED.issuedTo.write = [utils.ApplicationRoles.ADMIN, utils.ApplicationRoles.ADMIN_NRCED];
  incomingObj.issuedTo && incomingObj.issuedTo.type && (ticketNRCED.issuedTo.type = incomingObj.issuedTo.type);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.companyName &&
    (ticketNRCED.issuedTo.companyName = incomingObj.issuedTo.companyName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.firstName &&
    (ticketNRCED.issuedTo.firstName = incomingObj.issuedTo.firstName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.middleName &&
    (ticketNRCED.issuedTo.middleName = incomingObj.issuedTo.middleName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.lastName &&
    (ticketNRCED.issuedTo.lastName = incomingObj.issuedTo.lastName);
  incomingObj.issuedTo && (ticketNRCED.issuedTo.fullName = postUtils.getIssuedToFullNameValue(incomingObj.issuedTo));
  incomingObj.issuedTo &&
    incomingObj.issuedTo.dateOfBirth &&
    (ticketNRCED.issuedTo.dateOfBirth = incomingObj.issuedTo.dateOfBirth);

  incomingObj.projectName && (ticketNRCED.projectName = incomingObj.projectName);
  incomingObj.location && (ticketNRCED.location = incomingObj.location);
  incomingObj.centroid && (ticketNRCED.centroid = incomingObj.centroid);
  incomingObj.penalties && (ticketNRCED.penalties = incomingObj.penalties);
  incomingObj.documents && (ticketNRCED.documents = incomingObj.documents);

  // set flavour data
  incomingObj.summary && (ticketNRCED.summary = incomingObj.summary);

  // set data source references
  incomingObj.sourceDateAdded && (ticketNRCED.sourceDateAdded = incomingObj.sourceDateAdded);
  incomingObj.sourceDateUpdated && (ticketNRCED.sourceDateUpdated = incomingObj.sourceDateUpdated);
  incomingObj.sourceSystemRef && (ticketNRCED.sourceSystemRef = incomingObj.sourceSystemRef);

  // Add limited-admin(such as admin:wf) read/write roles if user is a limited-admin user
  if (args) {
    postUtils.setAdditionalRoleOnRecord(
      ticketNRCED,
      args.swagger.params.auth_payload.realm_access.roles,
      ADDITIONAL_ROLES
    );
  }

  // If incoming object has addRole: 'public' then read will look like ['sysadmin', 'public']
  if (incomingObj.addRole && incomingObj.addRole === 'public') {
    ticketNRCED.read.push('public');
    ticketNRCED.datePublished = new Date();
    ticketNRCED.publishedBy = args.swagger.params.auth_payload.displayName;
  }

  ticketNRCED = BusinessLogicManager.applyBusinessLogicOnPost(ticketNRCED);

  return ticketNRCED;
};
