const mongoose = require('mongoose');
const ObjectId = require('mongoose').Types.ObjectId;

const postUtils = require('../../utils/post-utils');
const { userHasValidRoles } = require('../../utils/auth-utils');
const { ROLES } = require('../../utils/constants/misc');

/**
 * Create a new Mine Permit record.
 *
 * @param {*} args
 * @param {*} res
 * @param {*} next
 * @param {*} incomingObj Mine Permit record to create
 * @returns {MinePermit} new Mine Permit record
 */
exports.createRecord = async function (args, res, next, incomingObj) {
  const flavourFunctions = {
    PermitAmendmentBCMI: this.createBCMI,
  };
  return await postUtils.createRecordWithFlavours(args, res, next, incomingObj, this.createMaster, flavourFunctions);
};

/**
 * Performs all operations necessary to create a master Mine Permit record.
 *
 * @param {*} args
 * @param {*} res
 * @param {*} next
 * @param {*} incomingObj Mine Permit record to create
 * @param {*} flavourIds array of flavour record _ids
 * @returns {MinePermit} created master Mine Permit record
 */
exports.createMaster = function (args, res, next, incomingObj, flavourIds) {
  let PermitAmendment = mongoose.model('PermitAmendment');
  let permitAmendment = new PermitAmendment();

  permitAmendment._schemaName = 'PermitAmendment';

  // set forward references
  if (flavourIds && flavourIds.length) {
    flavourIds.forEach(id => {
      if (ObjectId.isValid(id)) {
        permitAmendment._flavourRecords.push(new ObjectId(id));
      }
    });
  }

  // Set permissions
  permitAmendment.read = ROLES.ADMIN_ROLES;
  permitAmendment.write = ROLES.ADMIN_ROLES;

  // Set data
  incomingObj.statusCode && (permitAmendment.statusCode = incomingObj.statusCode);
  incomingObj.typeCode && (permitAmendment.typeCode = incomingObj.typeCode);
  incomingObj.receivedDate && (permitAmendment.receivedDate = incomingObj.receivedDate);
  incomingObj.issueDate && (permitAmendment.issueDate = incomingObj.issueDate);
  incomingObj.authorizedEndDate && (permitAmendment.authorizedEndDate = incomingObj.authorizedEndDate);
  incomingObj.description && (permitAmendment.description = incomingObj.description);
  (incomingObj.amendmentDocuments && incomingObj.amendmentDocuments.length) && (permitAmendment.amendmentDocuments = incomingObj.amendmentDocuments);

  // Set meta.
  permitAmendment.addedBy = args && args.swagger.params.auth_payload.displayName || incomingObj.addedBy;
  permitAmendment.updatedBy = args && args.swagger.params.auth_payload.displayName || incomingObj.updatedBy;
  permitAmendment.dateAdded = new Date();
  permitAmendment.dateUpdated = new Date();

  // Set data source reference
  incomingObj.sourceSystemRef && (permitAmendment.sourceSystemRef = incomingObj.sourceSystemRef);
  incomingObj._sourceRefId && (permitAmendment._sourceRefId = incomingObj._sourceRefId);

  return permitAmendment;
};

/**
 * Creates the BCMI flavour of a permit amendment.
 * 
 * @param {*} args
 * @param {*} res
 * @param {*} next
 * @param {*} incomingObj
 * @returns created BCMI permit amendment
 */ 
exports.createBCMI = function (args, res, next, incomingObj) {
  // Confirm user has correct role for this type of record.
  if (!userHasValidRoles([ROLES.SYSADMIN, ROLES.BCMIADMIN], args.swagger.params.auth_payload.realm_access.roles)) {
    throw new Error('Missing valid user role.');
  }

  let PermitAmendmentBCMI = mongoose.model('PermitAmendmentBCMI');
  let permitAmendmentBCMI = new PermitAmendmentBCMI();

  permitAmendmentBCMI._schemaName = 'PermitAmendmentBCMI';

  // set integration references
  incomingObj._sourceRefId && (permitAmendmentBCMI._sourceRefId = incomingObj._sourceRefId);

  // set permissions and meta
  permitAmendmentBCMI.read = ROLES.ADMIN_ROLES;
  permitAmendmentBCMI.write = [ROLES.SYSADMIN, ROLES.BCMIADMIN];

  // Set data
  incomingObj.statusCode && (permitAmendmentBCMI.mineGuid = incomingObj.statusCode);
  incomingObj.typeCode && (permitAmendmentBCMI.typeCode = incomingObj.typeCode);
  incomingObj.receivedDate && (permitAmendmentBCMI.receivedDate = incomingObj.receivedDate);
  incomingObj.issueDate && (permitAmendmentBCMI.issueDate = incomingObj.issueDate);
  incomingObj.authorizedEndDate && (permitAmendmentBCMI.authorizedEndDate = incomingObj.authorizedEndDate);
  incomingObj.description && (permitAmendmentBCMI.description = incomingObj.description);
  (incomingObj.amendmentDocuments && incomingObj.amendmentDocuments.length) && (permitAmendmentBCMI.amendmentDocuments = incomingObj.amendmentDocuments);
  // Set meta.
  permitAmendmentBCMI.addedBy = args && args.swagger.params.auth_payload.displayName || incomingObj.addedBy;
  permitAmendmentBCMI.updatedBy = args && args.swagger.params.auth_payload.displayName || incomingObj.updatedBy;
  permitAmendmentBCMI.dateAdded = new Date();
  permitAmendmentBCMI.dateUpdated = new Date();

  // Set data source reference
  incomingObj.sourceSystemRef && (permitAmendmentBCMI.sourceSystemRef = incomingObj.sourceSystemRef);
  incomingObj._sourceRefId && (permitAmendmentBCMI._sourceRefId = incomingObj._sourceRefId);

  return permitAmendmentBCMI;
};
