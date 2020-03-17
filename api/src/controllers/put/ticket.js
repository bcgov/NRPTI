const mongoose = require('mongoose');
const ObjectID = require('mongodb').ObjectID;
const PutUtils = require('../../utils/put-utils');
const TicketPost = require('../post/ticket');

/**
 * Performs all operations necessary to edit a master Ticket record and its associated flavour records.
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
exports.editRecord = async function(args, res, next, incomingObj) {
  // save flavour records
  let observables = [];
  let savedFlavourTickets = [];
  let flavourIds = [];

  try {
    // make a copy of the incoming object for use by the flavours only
    const flavourIncomingObj = { ...incomingObj };
    // Remove fields that should not be inherited from the master record
    delete flavourIncomingObj._id;
    delete flavourIncomingObj._schemaName;
    delete flavourIncomingObj._flavourRecords;
    delete flavourIncomingObj.read;
    delete flavourIncomingObj.write;

    if (incomingObj.TicketLNG) {
      if (incomingObj.TicketLNG._id) {
        observables.push(this.editLNG(args, res, next, { ...flavourIncomingObj, ...incomingObj.TicketLNG }));
      } else {
        observables.push(TicketPost.createLNG(args, res, next, { ...flavourIncomingObj, ...incomingObj.TicketLNG }));
      }

      delete incomingObj.TicketLNG;
    }

    if (incomingObj.TicketNRCED) {
      if (incomingObj.TicketNRCED._id) {
        observables.push(this.editNRCED(args, res, next, { ...flavourIncomingObj, ...incomingObj.TicketNRCED }));
      } else {
        observables.push(
          TicketPost.createNRCED(args, res, next, { ...flavourIncomingObj, ...incomingObj.TicketNRCED })
        );
      }

      delete incomingObj.TicketNRCED;
    }

    if (observables.length > 0) {
      savedFlavourTickets = await Promise.all(observables);

      flavourIds = savedFlavourTickets.map(flavourTicket => flavourTicket._id);
    }
  } catch (e) {
    return {
      status: 'failure',
      object: savedFlavourTickets,
      errorMessage: e
    };
  }

  // save ticket record
  let savedTicket = null;

  try {
    savedTicket = await this.editMaster(args, res, next, incomingObj, flavourIds);

    return {
      status: 'success',
      object: savedTicket,
      flavours: savedFlavourTickets
    };
  } catch (e) {
    return {
      status: 'failure',
      object: savedTicket,
      errorMessage: e
    };
  }
};

/**
 * Performs all operations necessary to edit a master Ticket record.
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
 * @returns edited master ticket record
 */
exports.editMaster = async function(args, res, next, incomingObj, flavourIds) {
  if (!incomingObj || !incomingObj._id) {
    // skip, as there is no way to update the master record
    return;
  }

  const _id = incomingObj._id;
  delete incomingObj._id;

  // Reject any changes to master permissions
  delete incomingObj.read;
  delete incomingObj.write;

  const Ticket = mongoose.model('Ticket');

  const sanitizedObj = PutUtils.validateObjectAgainstModel(Ticket, incomingObj);

  if (!sanitizedObj || sanitizedObj === {}) {
    // skip, as there are no changes to master record
    return;
  }

  sanitizedObj.dateUpdated = new Date();
  sanitizedObj.updatedBy = args.swagger.params.auth_payload.displayName;

  let updateObj = { $set: sanitizedObj };

  if (flavourIds && flavourIds.length) {
    updateObj.$addToSet = { _flavourRecords: flavourIds.map(id => new ObjectID(id)) };
  }

  return await Ticket.findOneAndUpdate({ _schemaName: 'Ticket', _id: _id }, updateObj, { new: true });
};

/**
 * Performs all operations necessary to edit a lng Ticket record.
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
 * @returns edited lng ticket record
 */
exports.editLNG = async function(args, res, next, incomingObj) {
  if (!incomingObj || !incomingObj._id) {
    // skip, as there is no way to update the lng record
    return;
  }

  const _id = incomingObj._id;
  delete incomingObj._id;

  // Reject any changes to permissions
  // Publishing must be done via addRole or removeRole
  delete incomingObj.read;
  delete incomingObj.write;

  let TicketLNG = mongoose.model('TicketLNG');

  const sanitizedObj = PutUtils.validateObjectAgainstModel(TicketLNG, incomingObj);

  // If incoming object has addRole: 'public' then read will look like ['sysadmin', 'public']
  let updateObj = { $set: sanitizedObj };

  if (incomingObj.addRole && incomingObj.addRole === 'public') {
    updateObj['$addToSet'] = { read: 'public' };
    updateObj.$set['datePublished'] = new Date();
    updateObj.$set['publishedBy'] = args.swagger.params.auth_payload.displayName;
  } else if (incomingObj.removeRole && incomingObj.removeRole === 'public') {
    updateObj['$pull'] = { read: 'public' };
    updateObj.$set['datePublished'] = null;
    updateObj.$set['publishedBy'] = '';
  }

  updateObj.$set['dateUpdated'] = new Date();

  return await TicketLNG.findOneAndUpdate({ _schemaName: 'TicketLNG', _id: _id }, updateObj, { new: true });
};

/**
 * Performs all operations necessary to edit a nrced Ticket record.
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
 * @returns edited nrced ticket record
 */
exports.editNRCED = async function(args, res, next, incomingObj) {
  if (!incomingObj || !incomingObj._id) {
    // skip, as there is no way to update the NRCED record
    return;
  }

  const _id = incomingObj._id;
  delete incomingObj._id;

  // Reject any changes to permissions
  // Publishing must be done via addRole or removeRole
  delete incomingObj.read;
  delete incomingObj.write;

  let TicketNRCED = mongoose.model('TicketNRCED');

  const sanitizedObj = PutUtils.validateObjectAgainstModel(TicketNRCED, incomingObj);

  // If incoming object has addRole: 'public' then read will look like ['sysadmin', 'public']
  let updateObj = { $set: sanitizedObj };

  if (incomingObj.addRole && incomingObj.addRole === 'public') {
    updateObj['$addToSet'] = { read: 'public' };
    updateObj.$set['datePublished'] = new Date();
    updateObj.$set['publishedBy'] = args.swagger.params.auth_payload.displayName;
  } else if (incomingObj.removeRole && incomingObj.removeRole === 'public') {
    updateObj['$pull'] = { read: 'public' };
    updateObj.$set['datePublished'] = null;
    updateObj.$set['publishedBy'] = '';
  }

  updateObj.$set['dateUpdated'] = new Date();

  return await TicketNRCED.findOneAndUpdate({ _schemaName: 'TicketNRCED', _id: _id }, updateObj, { new: true });
};
