const mongoose = require('mongoose');
const ObjectId = require('mongoose').Types.ObjectId;
const postUtils = require('../../utils/post-utils');
const { userHasValidRoles } = require('../../utils/auth-utils');
const utils = require('../../utils/constants/misc');

/**
 * Performs all operations necessary to create a master Agreement record and its associated flavour records.
 *
 * Example of incomingObj
 *
 *  agreements: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'agreement',
 *      ...
 *      AgreementLNG: {
 *        description: 'lng description'
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
    AgreementLNG: this.createLNG
  }
  return await postUtils.createRecordWithFlavours(args, res, next, incomingObj, this.createMaster, flavourFunctions);
};

/**
 * Performs all operations necessary to create a master Agreement record.
 *
 * Example of incomingObj
 *
 *  agreements: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'agreement',
 *      ...
 *      AgreementLNG: {
 *        description: 'lng description'
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
 * @returns created master agreement record
 */
exports.createMaster = function (args, res, next, incomingObj, flavourIds) {
  let Agreement = mongoose.model('Agreement');
  let agreement = new Agreement();

  agreement._schemaName = 'Agreement';

  // set integration references
  incomingObj._epicProjectId &&
    ObjectId.isValid(incomingObj._epicProjectId) &&
    (agreement._epicProjectId = new ObjectId(incomingObj._epicProjectId));
  incomingObj._sourceRefId &&
    ObjectId.isValid(incomingObj._sourceRefId) &&
    (agreement._sourceRefId = new ObjectId(incomingObj._sourceRefId));
  incomingObj._epicMilestoneId &&
    ObjectId.isValid(incomingObj._epicMilestoneId) &&
    (agreement._epicMilestoneId = new ObjectId(incomingObj._epicMilestoneId));

  // set permissions
  agreement.read = utils.ApplicationAdminRoles;
  agreement.write = utils.ApplicationAdminRoles;

  // set forward references
  if (flavourIds && flavourIds.length) {
    flavourIds.forEach(id => {
      if (ObjectId.isValid(id)) {
        agreement._flavourRecords.push(new ObjectId(id));
      }
    });
  }

  // set data
  incomingObj.recordName && (agreement.recordName = incomingObj.recordName);
  agreement.recordType = 'Agreement';
  incomingObj.dateIssued && (agreement.dateIssued = incomingObj.dateIssued);
  incomingObj.nationName && (agreement.nationName = incomingObj.nationName);
  incomingObj.projectName && (agreement.projectName = incomingObj.projectName);
  incomingObj.documents && (agreement.documents = incomingObj.documents);

  // set meta
  agreement.addedBy = args.swagger.params.auth_payload.displayName;
  agreement.dateAdded = new Date();

  // set data source references
  incomingObj.sourceDateAdded && (agreement.sourceDateAdded = incomingObj.sourceDateAdded);
  incomingObj.sourceDateUpdated && (agreement.sourceDateUpdated = incomingObj.sourceDateUpdated);
  incomingObj.isLngPublished && (agreement.isLngPublished = incomingObj.isLngPublished);

  return agreement;
};

/**
 * Performs all operations necessary to create a LNG Agreement record.
 *
 * Example of incomingObj
 *
 *  agreements: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'agreement',
 *      ...
 *      AgreementLNG: {
 *        description: 'lng description'
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
 * @returns created lng agreement record
 */
exports.createLNG = function (args, res, next, incomingObj) {
  // Confirm user has correct role for this type of record.
  if (!userHasValidRoles([utils.ApplicationRoles.ADMIN, utils.ApplicationRoles.ADMIN_LNG], args.swagger.params.auth_payload.realm_access.roles)) {
    throw new Error('Missing valid user role.');
  } 

  let AgreementLNG = mongoose.model('AgreementLNG');
  let agreementLNG = new AgreementLNG();

  agreementLNG._schemaName = 'AgreementLNG';

  // set integration references
  incomingObj._epicProjectId &&
    ObjectId.isValid(incomingObj._epicProjectId) &&
    (agreementLNG._epicProjectId = new ObjectId(incomingObj._epicProjectId));
  incomingObj._sourceRefId &&
    ObjectId.isValid(incomingObj._sourceRefId) &&
    (agreementLNG._sourceRefId = new ObjectId(incomingObj._sourceRefId));
  incomingObj._epicMilestoneId &&
    ObjectId.isValid(incomingObj._epicMilestoneId) &&
    (agreementLNG._epicMilestoneId = new ObjectId(incomingObj._epicMilestoneId));

  // set permissions and meta
  agreementLNG.read = utils.ApplicationAdminRoles;
  agreementLNG.write = [utils.ApplicationRoles.ADMIN, utils.ApplicationRoles.ADMIN_LNG];

  // If incoming object has addRole: 'public' then read will look like ['sysadmin', 'public']
  if (incomingObj.addRole && incomingObj.addRole === 'public') {
    agreementLNG.read.push('public');
    agreementLNG.datePublished = new Date();
    agreementLNG.publishedBy = args.swagger.params.auth_payload.displayName;
  }

  agreementLNG.addedBy = args.swagger.params.auth_payload.displayName;
  agreementLNG.dateAdded = new Date();

  // set master data
  incomingObj.recordName && (agreementLNG.recordName = incomingObj.recordName);
  agreementLNG.recordType = 'Agreement';
  incomingObj.dateIssued && (agreementLNG.dateIssued = incomingObj.dateIssued);
  incomingObj.nationName && (agreementLNG.nationName = incomingObj.nationName);
  incomingObj.projectName && (agreementLNG.projectName = incomingObj.projectName);
  incomingObj.documents && (agreementLNG.documents = incomingObj.documents);

  // set flavour data
  incomingObj.description && (agreementLNG.description = incomingObj.description);

  // set data source references
  incomingObj.sourceDateAdded && (agreementLNG.sourceDateAdded = incomingObj.sourceDateAdded);
  incomingObj.sourceDateUpdated && (agreementLNG.sourceDateUpdated = incomingObj.sourceDateUpdated);
  incomingObj.sourceSystemRef && (agreementLNG.sourceSystemRef = incomingObj.sourceSystemRef);

  return agreementLNG;
};
