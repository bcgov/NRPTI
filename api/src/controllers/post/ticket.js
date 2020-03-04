const mongoose = require('mongoose');
const ObjectId = require('mongoose').Types.ObjectId;
const RECORD_TYPE = require('../../utils/constants/record-type-enum');

/**
 * Create Master Ticket record.
 *
 * Example of incomingObj:
 *
 * ticket: [
 *   {
 *     recordName: 'test abc',
 *     recordType: 'whatever',
 *     ...
 *     TicketLNG: {
 *       description: 'lng description'
 *       addRole: 'public',
 *     }
 *   },
 *   ...
 * ]
 */
exports.createMaster = async function(args, res, next, incomingObj) {
  const Ticket = mongoose.model(RECORD_TYPE.Ticket._schemaName);
  const ticket = new Ticket();

  ticket._schemaName = RECORD_TYPE.Ticket._schemaName;
  incomingObj._epicProjectId &&
    ObjectId.isValid(incomingObj._epicProjectId) &&
    (ticket._epicProjectId = new ObjectId(incomingObj._epicProjectId));
  incomingObj._sourceRefId &&
    ObjectId.isValid(incomingObj._sourceRefId) &&
    (ticket._sourceRefId = new ObjectId(incomingObj._sourceRefId));
  incomingObj._epicMilestoneId &&
    ObjectId.isValid(incomingObj._epicMilestoneId) &&
    (ticket._epicMilestoneId = new ObjectId(incomingObj._epicMilestoneId));

  incomingObj.recordName && (ticket.recordName = incomingObj.recordName);
  ticket.recordType = RECORD_TYPE.Ticket.displayName;
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
  incomingObj.issuedTo && (ticket.issuedTo = incomingObj.issuedTo);
  incomingObj.projectName && (ticket.projectName = incomingObj.projectName);
  incomingObj.location && (ticket.location = incomingObj.location);
  incomingObj.centroid && (ticket.centroid = incomingObj.centroid);
  incomingObj.outcomeStatus && (ticket.outcomeStatus = incomingObj.outcomeStatus);
  incomingObj.outcomeDescription && (ticket.outcomeDescription = incomingObj.outcomeDescription);
  incomingObj.penalty && (ticket.penalty = incomingObj.penalty);

  ticket.dateAdded = new Date();
  ticket.publishedBy = args.swagger.params.auth_payload.displayName;

  incomingObj.sourceDateAdded && (ticket.sourceDateAdded = incomingObj.sourceDateAdded);
  incomingObj.sourceDateUpdated && (ticket.sourceDateUpdated = incomingObj.sourceDateUpdated);
  incomingObj.sourceSystemRef && (ticket.sourceSystemRef = incomingObj.sourceSystemRef);

  ticket.read = ['sysadmin'];
  ticket.write = ['sysadmin'];

  let savedTicket = null;
  try {
    savedTicket = await ticket.save();
  } catch (error) {
    return {
      status: 'failure',
      object: ticket,
      errorMessage: error
    };
  }

  const observables = [];
  incomingObj.TicketLNG && observables.push(this.createLNG(args, res, next, incomingObj.TicketLNG, savedTicket._id));
  incomingObj.TicketNRCED &&
    observables.push(this.createNRCED(args, res, next, incomingObj.TicketNRCED, savedTicket._id));

  let flavourRes = null;
  try {
    observables.length > 0 && (flavourRes = await Promise.all(observables));
  } catch (error) {
    flavourRes = {
      status: 'failure',
      object: observables,
      errorMessage: error.message
    };
  }

  return {
    status: 'success',
    object: savedTicket,
    flavours: flavourRes
  };
};

/**
 * Create LNG Ticket record.
 *
 * Example of incomingObj:
 *
 * {
 *   _master: '5e1e7fcd20e4167bcfc3daa7'
 *   description: 'lng description',
 *   ...
 *   addRole: 'public'
 * }
 */
exports.createLNG = async function(args, res, next, incomingObj, masterId) {
  // We must have a valid master ObjectID to continue.
  if (!masterId || !ObjectId.isValid(masterId)) {
    return {
      status: 'failure',
      object: incomingObj,
      errorMessage: 'incomingObj._master was not valid ObjectId'
    };
  }

  const TicketLNG = mongoose.model(RECORD_TYPE.Ticket.flavours.lng._schemaName);
  const ticketLNG = new TicketLNG();

  ticketLNG._schemaName = RECORD_TYPE.Ticket.flavours.lng._schemaName;
  ticketLNG._master = new ObjectId(masterId);
  ticketLNG.read = ['sysadmin'];
  ticketLNG.write = ['sysadmin'];
  // If incoming object has addRole: 'public' then read will look like ['sysadmin', 'public']
  incomingObj.addRole &&
    incomingObj.addRole === 'public' &&
    ticketLNG.read.push('public') &&
    (ticketLNG.datePublished = new Date());

  incomingObj.description && (ticketLNG.description = incomingObj.description);

  ticketLNG.dateAdded = new Date();

  try {
    const savedTicketLNG = await ticketLNG.save();
    return {
      status: 'success',
      object: savedTicketLNG
    };
  } catch (error) {
    return {
      status: 'failure',
      object: ticketLNG,
      errorMessage: error.message
    };
  }
};

/**
 * Create NRCED Ticket record.
 *
 * Example of incomingObj:
 *
 * {
 *   _master: '5e1e7fcd20e4167bcfc3daa7'
 *   description: 'nrced description',
 *   ...
 *   addRole: 'public'
 * }
 */
exports.createNRCED = async function(args, res, next, incomingObj, masterId) {
  // We must have a valid master ObjectID to continue.
  if (!masterId || !ObjectId.isValid(masterId)) {
    return {
      status: 'failure',
      object: incomingObj,
      errorMessage: 'incomingObj._master was not valid ObjectId'
    };
  }

  console.log(RECORD_TYPE.Ticket.flavours.nrced._schemaName);
  const TicketNRCED = mongoose.model(RECORD_TYPE.Ticket.flavours.nrced._schemaName);
  const ticketNRCED = new TicketNRCED();

  ticketNRCED._schemaName = RECORD_TYPE.Ticket.flavours.nrced._schemaName;
  ticketNRCED._master = new ObjectId(masterId);
  ticketNRCED.read = ['sysadmin'];
  ticketNRCED.write = ['sysadmin'];
  // If incoming object has addRole: 'public' then read will look like ['sysadmin', 'public']
  incomingObj.addRole &&
    incomingObj.addRole === 'public' &&
    ticketNRCED.read.push('public') &&
    (ticketNRCED.datePublished = new Date());

  incomingObj.summary && (ticketNRCED.summary = incomingObj.summary);

  ticketNRCED.dateAdded = new Date();

  console.log(ticketNRCED);
  try {
    const savedTicketNRCED = await ticketNRCED.save();
    console.log(savedTicketNRCED);
    return {
      status: 'success',
      object: savedTicketNRCED
    };
  } catch (error) {
    return {
      status: 'failure',
      object: ticketNRCED,
      errorMessage: error.message
    };
  }
};
