const mongoose = require('mongoose');
const ObjectId = require('mongoose').Types.ObjectId;
const RECORD_TYPE = require('../../utils/constants/record-type-enum');

/**
 * Create Master Restorative Justice record.
 *
 * Example of incomingObj:
 *
 * restorativeJustice: [
 *   {
 *     recordName: 'test abc',
 *     recordType: 'whatever',
 *     ...
 *     RestorativeJusticeLNG: {
 *       description: 'lng description'
 *       addRole: 'public',
 *     }
 *   },
 *   ...
 * ]
 */
exports.createMaster = async function(args, res, next, incomingObj) {
  const RestorativeJustice = mongoose.model(RECORD_TYPE.RestorativeJustice._schemaName);
  const restorativeJustice = new RestorativeJustice();

  restorativeJustice._schemaName = RECORD_TYPE.RestorativeJustice._schemaName;
  incomingObj._epicProjectId &&
    ObjectId.isValid(incomingObj._epicProjectId) &&
    (restorativeJustice._epicProjectId = new ObjectId(incomingObj._epicProjectId));
  incomingObj._sourceRefId &&
    ObjectId.isValid(incomingObj._sourceRefId) &&
    (restorativeJustice._sourceRefId = new ObjectId(incomingObj._sourceRefId));
  incomingObj._epicMilestoneId &&
    ObjectId.isValid(incomingObj._epicMilestoneId) &&
    (restorativeJustice._epicMilestoneId = new ObjectId(incomingObj._epicMilestoneId));

  incomingObj.recordName && (restorativeJustice.recordName = incomingObj.recordName);
  restorativeJustice.recordType = RECORD_TYPE.RestorativeJustice.displayName;
  incomingObj.dateIssued && (restorativeJustice.dateIssued = incomingObj.dateIssued);
  incomingObj.issuingAgency && (restorativeJustice.issuingAgency = incomingObj.issuingAgency);
  incomingObj.author && (restorativeJustice.author = incomingObj.author);
  incomingObj.legislation &&
    incomingObj.legislation.act &&
    (restorativeJustice.legislation.act = incomingObj.legislation.act);
  incomingObj.legislation &&
    incomingObj.legislation.regulation &&
    (restorativeJustice.legislation.regulation = incomingObj.legislation.regulation);
  incomingObj.legislation &&
    incomingObj.legislation.section &&
    (restorativeJustice.legislation.section = incomingObj.legislation.section);
  incomingObj.legislation &&
    incomingObj.legislation.subSection &&
    (restorativeJustice.legislation.subSection = incomingObj.legislation.subSection);
  incomingObj.legislation &&
    incomingObj.legislation.paragraph &&
    (restorativeJustice.legislation.paragraph = incomingObj.legislation.paragraph);
  incomingObj.issuedTo && (restorativeJustice.issuedTo = incomingObj.issuedTo);
  incomingObj.projectName && (restorativeJustice.projectName = incomingObj.projectName);
  incomingObj.location && (restorativeJustice.location = incomingObj.location);
  incomingObj.centroid && (restorativeJustice.centroid = incomingObj.centroid);
  incomingObj.outcomeStatus && (restorativeJustice.outcomeStatus = incomingObj.outcomeStatus);
  incomingObj.outcomeDescription && (restorativeJustice.outcomeDescription = incomingObj.outcomeDescription);
  incomingObj.penalty && (restorativeJustice.penalty = incomingObj.penalty);

  restorativeJustice.dateAdded = new Date();
  restorativeJustice.publishedBy = args.swagger.params.auth_payload.displayName;

  incomingObj.sourceDateAdded && (restorativeJustice.sourceDateAdded = incomingObj.sourceDateAdded);
  incomingObj.sourceDateUpdated && (restorativeJustice.sourceDateUpdated = incomingObj.sourceDateUpdated);
  incomingObj.sourceSystemRef && (restorativeJustice.sourceSystemRef = incomingObj.sourceSystemRef);

  restorativeJustice.read = ['sysadmin'];
  restorativeJustice.write = ['sysadmin'];

  let savedRestorativeJustice = null;
  try {
    savedRestorativeJustice = await restorativeJustice.save();
  } catch (error) {
    return {
      status: 'failure',
      object: restorativeJustice,
      errorMessage: error.message
    };
  }

  const observables = [];
  incomingObj.RestorativeJusticeLNG &&
    observables.push(this.createLNG(args, res, next, incomingObj.RestorativeJusticeLNG, savedRestorativeJustice._id));
  incomingObj.RestorativeJusticeNRCED &&
    observables.push(
      this.createNRCED(args, res, next, incomingObj.RestorativeJusticeNRCED, savedRestorativeJustice._id)
    );

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
    object: savedRestorativeJustice,
    flavours: flavourRes
  };
};

/**
 * Create LNG Restorative Justice record.
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

  const RestorativeJusticeLNG = mongoose.model(RECORD_TYPE.RestorativeJustice.flavours.lng._schemaName);
  const inpsectionLNG = new RestorativeJusticeLNG();

  inpsectionLNG._schemaName = RECORD_TYPE.RestorativeJustice.flavours.lng._schemaName;
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
    const savedRestorativeJusticeLNG = await inpsectionLNG.save();
    return {
      status: 'success',
      object: savedRestorativeJusticeLNG
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
 * Create NRCED Restorative Justice record.
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

  const RestorativeJusticeNRCED = mongoose.model(RECORD_TYPE.RestorativeJustice.flavours.nrced._schemaName);
  const inpsectionNRCED = new RestorativeJusticeNRCED();

  inpsectionNRCED._schemaName = RECORD_TYPE.RestorativeJustice.flavours.nrced._schemaName;
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
    const savedRestorativeJusticeNRCED = await inpsectionNRCED.save();
    return {
      status: 'success',
      object: savedRestorativeJusticeNRCED
    };
  } catch (error) {
    return {
      status: 'failure',
      object: inpsectionNRCED,
      errorMessage: error.message
    };
  }
};
