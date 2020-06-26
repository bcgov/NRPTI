const mongoose = require('mongoose');

const postUtils = require('../../utils/post-utils');
const { ROLES } = require('../../utils/constants/misc');

/**
 * Create a new Mine record.
 *
 * @param {*} args
 * @param {*} res
 * @param {*} next
 * @param {*} incomingObj Mine record to create
 * @returns new Mine record
 */
exports.createRecord = async function (args, res, next, incomingObj) {
  // TODO: Populate if needed.
  const flavourFunctions = {};
  return await postUtils.createRecordWithFlavours(args, res, next, incomingObj, this.createMaster, flavourFunctions);
};

/**
 * Performs all operations necessary to create a master Mine record.
 *
 * @param {*} args
 * @param {*} res
 * @param {*} next
 * @param {*} incomingObj Mine record to create
 * @param {*} flavourIds array of flavour record _ids
 * @returns created master Mine record
 */
exports.createMaster = function (args, res, next, incomingObj, flavourIds) {
  let Mine = mongoose.model('Mine');
  let mine = new Mine();

  mine._schemaName = 'Mine';

  // set permissions
  mine.read = ROLES.ADMIN_ROLES;
  mine.write = ROLES.ADMIN_ROLES;

  // set data
  incomingObj.name && (mine.name = incomingObj.name);
  incomingObj.permitNumber && (mine.permitNumber = incomingObj.permitNumber);
  incomingObj.status && (mine.status = incomingObj.status);
  incomingObj.commodities.length && (mine.commodities = incomingObj.commodities);
  incomingObj.region && (mine.region = incomingObj.region);
  incomingObj.location && (mine.location = incomingObj.location);
  incomingObj.permittee && (mine.permittee = incomingObj.permittee);
  incomingObj.type && (mine.type = incomingObj.type);
  incomingObj.summary && (mine.summary = incomingObj.summary);
  incomingObj.description && (mine.description = incomingObj.description);
  incomingObj.links && incomingObj.links.length && (mine.links = incomingObj.links);

  // Not checking value as it could be 0 which would fail the falsey check.
  mine.tailingImpoundments = incomingObj.tailingImpoundments;

  // Set meta. If the args exist then use the auth otherwise check the incoming object. This occurs if 
  // the system is creating the record.
  mine.addedBy = args && args.swagger.params.auth_payload.displayName || incomingObj.addedBy;
  mine.updatedBy = args && args.swagger.params.auth_payload.displayName || incomingObj.updatedBy;
  mine.dateAdded = new Date();
  mine.dateUpdated = new Date();

  // set data source reference
  incomingObj.sourceSystemRef && (mine.sourceSystemRef = incomingObj.sourceSystemRef);
  incomingObj._sourceRefId && (mine._sourceRefId = incomingObj._sourceRefId);

  return mine;
};
