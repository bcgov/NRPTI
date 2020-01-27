const mongoose = require('mongoose');
const ObjectId = require('mongoose').Types.ObjectId;
const RECORD_TYPE = require('../../utils/constants/record-type-enum');

/**
 * Create Master Permit record.
 *
 * Example of incomingObj:
 *
 * permit: [
 *   {
 *     recordName: 'test abc',
 *     recordType: 'whatever',
 *     ...
 *     PermitLNG: {
 *       description: 'lng description'
 *       addRole: 'public',
 *     }
 *   },
 *   ...
 * ]
 */
exports.createMaster = async function(args, res, next, incomingObj) {
  const Permit = mongoose.model(RECORD_TYPE.Permit._schemaName);
  const permit = new Permit();

  permit._schemaName = RECORD_TYPE.Permit._schemaName;
  incomingObj._epicProjectId &&
    ObjectId.isValid(incomingObj._epicProjectId) &&
    (permit._epicProjectId = new ObjectId(incomingObj._epicProjectId));
  incomingObj._sourceRefId &&
    ObjectId.isValid(incomingObj._sourceRefId) &&
    (permit._sourceRefId = new ObjectId(incomingObj._sourceRefId));
  incomingObj._epicMilestoneId &&
    ObjectId.isValid(incomingObj._epicMilestoneId) &&
    (permit._epicMilestoneId = new ObjectId(incomingObj._epicMilestoneId));

  incomingObj.recordName && (permit.recordName = incomingObj.recordName);
  permit.recordType = RECORD_TYPE.Permit.displayName;
  incomingObj.recordSubtype && (permit.recordName = incomingObj.recordSubtype);
  incomingObj.dateIssued && (permit.dateIssued = incomingObj.dateIssued);
  incomingObj.issuingAgency && (permit.issuingAgency = incomingObj.issuingAgency);
  incomingObj.legislation && (permit.legislation = incomingObj.legislation);
  incomingObj.issuedTo && (permit.issuedTo = incomingObj.issuedTo);
  incomingObj.projectName && (permit.projectName = incomingObj.projectName);
  incomingObj.location && (permit.location = incomingObj.location);
  incomingObj.centroid && (permit.centroid = incomingObj.centroid);

  permit.dateAdded = new Date();
  permit.publishedBy = args.swagger.params.auth_payload.displayName;

  incomingObj.sourceDateAdded && (permit.sourceDateAdded = incomingObj.sourceDateAdded);
  incomingObj.sourceDateUpdated && (permit.sourceDateUpdated = incomingObj.sourceDateUpdated);
  incomingObj.sourceSystemRef && (permit.sourceSystemRef = incomingObj.sourceSystemRef);

  permit.read = ['sysadmin'];
  permit.write = ['sysadmin'];

  let savedPermit = null;
  try {
    savedPermit = await permit.save();
  } catch (error) {
    return {
      status: 'failure',
      object: permit,
      errorMessage: error
    };
  }

  const observables = [];
  incomingObj.PermitLNG &&
    observables.push(this.createLNG(args, res, next, incomingObj.PermitLNG, savedPermit._id));

  let flavourRes = null;
  try {
    observables.length > 0 && (flavourRes = await Promise.all(observables));
  } catch (error) {
    flavourRes = {
      status: 'failure',
      object: observables,
      errorMessage: error
    };
  }

  return {
    status: 'success',
    object: savedPermit,
    flavours: flavourRes
  };
};

/**
 * Create LNG Permit record.
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

  const PermitLNG = mongoose.model(`${RECORD_TYPE.Permit._schemaName}LNG`);
  const inpsectionLNG = new PermitLNG();

  inpsectionLNG._schemaName = `${RECORD_TYPE.Permit._schemaName}LNG`;
  inpsectionLNG._master = new ObjectId(masterId);
  inpsectionLNG.read = ['sysadmin'];
  inpsectionLNG.write = ['sysadmin'];
  // If incoming object has addRole: 'public' then read will look like ['sysadmin', 'public']
  incomingObj.addRole &&
    incomingObj.addRole === 'public' &&
    inpsectionLNG.read.push('public') &&
    (inpsectionLNG.datePublished = new Date());

  incomingObj.description && (inpsectionLNG.description = incomingObj.description);

  inpsectionLNG.dateAdded = new Date();

  try {
    const savedPermitLNG = await inpsectionLNG.save();
    return {
      status: 'success',
      object: savedPermitLNG
    };
  } catch (error) {
    return {
      status: 'failure',
      object: inpsectionLNG,
      errorMessage: error
    };
  }
};
