const mongoose = require('mongoose');
const ObjectId = require('mongoose').Types.ObjectId;
const RECORD_TYPE = require('../../utils/constants/record-type-enum');

/**
 * Create Master Agreement record.
 *
 * Example of incomingObj:
 *
 * agreement: [
 *   {
 *     recordName: 'test abc',
 *     recordType: 'whatever',
 *     ...
 *     AgreementLNG: {
 *       description: 'lng description'
 *       addRole: 'public',
 *     }
 *   },
 *   ...
 * ]
 */
exports.createMaster = async function(args, res, next, incomingObj) {
  const Agreement = mongoose.model(RECORD_TYPE.Agreement._schemaName);
  const agreement = new Agreement();

  agreement._schemaName = RECORD_TYPE.Agreement._schemaName;
  incomingObj._epicProjectId &&
    ObjectId.isValid(incomingObj._epicProjectId) &&
    (agreement._epicProjectId = new ObjectId(incomingObj._epicProjectId));
  incomingObj._sourceRefId &&
    ObjectId.isValid(incomingObj._sourceRefId) &&
    (agreement._sourceRefId = new ObjectId(incomingObj._sourceRefId));
  incomingObj._epicMilestoneId &&
    ObjectId.isValid(incomingObj._epicMilestoneId) &&
    (agreement._epicMilestoneId = new ObjectId(incomingObj._epicMilestoneId));

  incomingObj.recordName && (agreement.recordName = incomingObj.recordName);
  agreement.recordType = RECORD_TYPE.Agreement.displayName;
  incomingObj.dateIssued && (agreement.dateIssued = incomingObj.dateIssued);
  incomingObj.nationName && (agreement.nationName = incomingObj.nationName);
  incomingObj.projectName && (agreement.projectName = incomingObj.projectName);

  agreement.dateAdded = new Date();
  agreement.publishedBy = args.swagger.params.auth_payload.displayName;

  incomingObj.sourceDateAdded && (agreement.sourceDateAdded = incomingObj.sourceDateAdded);
  incomingObj.sourceDateUpdated && (agreement.sourceDateUpdated = incomingObj.sourceDateUpdated);
  incomingObj.sourceSystemRef && (agreement.sourceSystemRef = incomingObj.sourceSystemRef);

  agreement.read = ['sysadmin'];
  agreement.write = ['sysadmin'];

  let savedAgreement = null;
  try {
    savedAgreement = await agreement.save();
  } catch (error) {
    return {
      status: 'failure',
      object: agreement,
      errorMessage: error.message
    };
  }

  const observables = [];
  incomingObj.AgreementLNG &&
    observables.push(this.createLNG(args, res, next, incomingObj.AgreementLNG, savedAgreement._id));

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
    object: savedAgreement,
    flavours: flavourRes
  };
};

/**
 * Create LNG Agreement record.
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

  const AgreementLNG = mongoose.model(RECORD_TYPE.Agreement.flavours.lng._schemaName);
  const agreementLNG = new AgreementLNG();

  agreementLNG._schemaName = RECORD_TYPE.Agreement.flavours.lng._schemaName;
  agreementLNG._master = new ObjectId(masterId);
  agreementLNG.read = ['sysadmin'];
  agreementLNG.write = ['sysadmin'];
  // If incoming object has addRole: 'public' then read will look like ['sysadmin', 'public']
  incomingObj.addRole &&
    incomingObj.addRole === 'public' &&
    agreementLNG.read.push('public') &&
    (agreementLNG.datePublished = new Date());

  incomingObj.description && (agreementLNG.description = incomingObj.description);

  agreementLNG.dateAdded = new Date();

  try {
    const savedAgreementLNG = await agreementLNG.save();
    return {
      status: 'success',
      object: savedAgreementLNG
    };
  } catch (error) {
    return {
      status: 'failure',
      object: agreementLNG,
      errorMessage: error.message
    };
  }
};
