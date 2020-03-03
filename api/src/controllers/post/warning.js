const mongoose = require('mongoose');
const ObjectId = require('mongoose').Types.ObjectId;
const RECORD_TYPE = require('../../utils/constants/record-type-enum');

/**
 * Create Master Warning record.
 *
 * Example of incomingObj:
 *
 * warning: [
 *   {
 *     recordName: 'test abc',
 *     recordType: 'whatever',
 *     ...
 *     WarningLNG: {
 *       description: 'lng description'
 *       addRole: 'public',
 *     }
 *   },
 *   ...
 * ]
 */
exports.createMaster = async function(args, res, next, incomingObj) {
  const Warning = mongoose.model(RECORD_TYPE.Warning._schemaName);
  const warning = new Warning();

  warning._schemaName = RECORD_TYPE.Warning._schemaName;
  incomingObj._epicProjectId &&
    ObjectId.isValid(incomingObj._epicProjectId) &&
    (warning._epicProjectId = new ObjectId(incomingObj._epicProjectId));
  incomingObj._sourceRefId &&
    ObjectId.isValid(incomingObj._sourceRefId) &&
    (warning._sourceRefId = new ObjectId(incomingObj._sourceRefId));
  incomingObj._epicMilestoneId &&
    ObjectId.isValid(incomingObj._epicMilestoneId) &&
    (warning._epicMilestoneId = new ObjectId(incomingObj._epicMilestoneId));

  incomingObj.recordName && (warning.recordName = incomingObj.recordName);
  warning.recordType = RECORD_TYPE.Warning.displayName;
  incomingObj.dateIssued && (warning.dateIssued = incomingObj.dateIssued);
  incomingObj.issuingAgency && (warning.issuingAgency = incomingObj.issuingAgency);
  incomingObj.author && (warning.author = incomingObj.author);
  incomingObj.issuedTo && (warning.issuedTo = incomingObj.issuedTo);
  incomingObj.projectName && (warning.projectName = incomingObj.projectName);
  incomingObj.location && (warning.location = incomingObj.location);
  incomingObj.centroid && (warning.centroid = incomingObj.centroid);
  incomingObj.outcomeStatus && (warning.outcomeStatus = incomingObj.outcomeStatus);
  incomingObj.outcomeDescription && (warning.outcomeDescription = incomingObj.outcomeDescription);

  warning.dateAdded = new Date();
  warning.publishedBy = args.swagger.params.auth_payload.displayName;

  incomingObj.sourceDateAdded && (warning.sourceDateAdded = incomingObj.sourceDateAdded);
  incomingObj.sourceDateUpdated && (warning.sourceDateUpdated = incomingObj.sourceDateUpdated);
  incomingObj.sourceSystemRef && (warning.sourceSystemRef = incomingObj.sourceSystemRef);

  warning.read = ['sysadmin'];
  warning.write = ['sysadmin'];

  let savedWarning = null;
  try {
    savedWarning = await warning.save();
  } catch (error) {
    return {
      status: 'failure',
      object: warning,
      errorMessage: error.message
    };
  }

  const observables = [];
  incomingObj.WarningLNG && observables.push(this.createLNG(args, res, next, incomingObj.WarningLNG, savedWarning._id));
  incomingObj.WarningNRCED &&
    observables.push(this.createNRCED(args, res, next, incomingObj.WarningNRCED, savedWarning._id));

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
    object: savedWarning,
    flavours: flavourRes
  };
};

/**
 * Create LNG Warning record.
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

  const WarningLNG = mongoose.model(RECORD_TYPE.Warning.flavours.lng._schemaName);
  const inpsectionLNG = new WarningLNG();

  inpsectionLNG._schemaName = RECORD_TYPE.Warning.flavours.lng._schemaName;
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
    const savedWarningLNG = await inpsectionLNG.save();
    return {
      status: 'success',
      object: savedWarningLNG
    };
  } catch (error) {
    return {
      status: 'failure',
      object: inpsectionLNG,
      errorMessage: error.message
    };
  }
};

/**
 * Create NRCED Warning record.
 *
 * Example of incomingObj:
 *
 * {
 *   _master: '5e1e7fcd20e4167bcfc3daa7'
 *   summary: 'nrced description',
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

  const WarningNRCED = mongoose.model(RECORD_TYPE.Warning.flavours.nrced._schemaName);
  const inpsectionNRCED = new WarningNRCED();

  inpsectionNRCED._schemaName = RECORD_TYPE.Warning.flavours.nrced._schemaName;
  inpsectionNRCED._master = new ObjectId(masterId);
  inpsectionNRCED.read = ['sysadmin'];
  inpsectionNRCED.write = ['sysadmin'];
  // If incoming object has addRole: 'public' then read will look like ['sysadmin', 'public']
  incomingObj.addRole &&
    incomingObj.addRole === 'public' &&
    inpsectionNRCED.read.push('public') &&
    (inpsectionNRCED.datePublished = new Date());

  incomingObj.summary && (inpsectionNRCED.summary = incomingObj.summary);

  inpsectionNRCED.dateAdded = new Date();

  try {
    const savedWarningNRCED = await inpsectionNRCED.save();
    return {
      status: 'success',
      object: savedWarningNRCED
    };
  } catch (error) {
    return {
      status: 'failure',
      object: inpsectionNRCED,
      errorMessage: error.message
    };
  }
};
