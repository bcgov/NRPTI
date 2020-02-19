const mongoose = require('mongoose');
const ObjectId = require('mongoose').Types.ObjectId;
const RECORD_TYPE = require('../../utils/constants/record-type-enum');

/**
 * Create Master Administrative Penalty record.
 *
 * Example of incomingObj:
 *
 * administrativePenalty: [
 *   {
 *     recordName: 'test abc',
 *     recordType: 'whatever',
 *     ...
 *     AdministrativePenaltyLNG: {
 *       description: 'lng description'
 *       addRole: 'public',
 *     }
 *   },
 *   ...
 * ]
 */
exports.createMaster = async function(args, res, next, incomingObj) {
  const AdministrativePenalty = mongoose.model(RECORD_TYPE.AdministrativePenalty._schemaName);
  const administrativePenalty = new AdministrativePenalty();

  administrativePenalty._schemaName = RECORD_TYPE.AdministrativePenalty._schemaName;
  incomingObj._epicProjectId &&
    ObjectId.isValid(incomingObj._epicProjectId) &&
    (administrativePenalty._epicProjectId = new ObjectId(incomingObj._epicProjectId));
  incomingObj._sourceRefId &&
    ObjectId.isValid(incomingObj._sourceRefId) &&
    (administrativePenalty._sourceRefId = new ObjectId(incomingObj._sourceRefId));
  incomingObj._epicMilestoneId &&
    ObjectId.isValid(incomingObj._epicMilestoneId) &&
    (administrativePenalty._epicMilestoneId = new ObjectId(incomingObj._epicMilestoneId));

  incomingObj.recordName && (administrativePenalty.recordName = incomingObj.recordName);
  administrativePenalty.recordType = RECORD_TYPE.AdministrativePenalty.displayName;
  incomingObj.dateIssued && (administrativePenalty.dateIssued = incomingObj.dateIssued);
  incomingObj.issuingAgency && (administrativePenalty.issuingAgency = incomingObj.issuingAgency);
  incomingObj.author && (administrativePenalty.author = incomingObj.author);
  incomingObj.legislation &&
    incomingObj.legislation.act &&
    (administrativePenalty.legislation.act = incomingObj.legislation.act);
  incomingObj.legislation &&
    incomingObj.legislation.regulation &&
    (administrativePenalty.legislation.regulation = incomingObj.legislation.regulation);
  incomingObj.legislation &&
    incomingObj.legislation.section &&
    (administrativePenalty.legislation.section = incomingObj.legislation.section);
  incomingObj.legislation &&
    incomingObj.legislation.subSection &&
    (administrativePenalty.legislation.subSection = incomingObj.legislation.subSection);
  incomingObj.legislation &&
    incomingObj.legislation.paragraph &&
    (administrativePenalty.legislation.paragraph = incomingObj.legislation.paragraph);
  incomingObj.issuedTo && (administrativePenalty.issuedTo = incomingObj.issuedTo);
  incomingObj.projectName && (administrativePenalty.projectName = incomingObj.projectName);
  incomingObj.location && (administrativePenalty.location = incomingObj.location);
  incomingObj.centroid && (administrativePenalty.centroid = incomingObj.centroid);
  incomingObj.outcomeStatus && (administrativePenalty.outcomeStatus = incomingObj.outcomeStatus);
  incomingObj.outcomeDescription && (administrativePenalty.outcomeDescription = incomingObj.outcomeDescription);
  incomingObj.penalty && (administrativePenalty.penalty = incomingObj.penalty);

  administrativePenalty.dateAdded = new Date();
  administrativePenalty.publishedBy = args.swagger.params.auth_payload.displayName;

  incomingObj.sourceDateAdded && (administrativePenalty.sourceDateAdded = incomingObj.sourceDateAdded);
  incomingObj.sourceDateUpdated && (administrativePenalty.sourceDateUpdated = incomingObj.sourceDateUpdated);
  incomingObj.sourceSystemRef && (administrativePenalty.sourceSystemRef = incomingObj.sourceSystemRef);

  administrativePenalty.read = ['sysadmin'];
  administrativePenalty.write = ['sysadmin'];

  let savedAdministrativePenalty = null;
  try {
    savedAdministrativePenalty = await administrativePenalty.save();
  } catch (error) {
    return {
      status: 'failure',
      object: administrativePenalty,
      errorMessage: error.message
    };
  }

  const observables = [];
  incomingObj.AdministrativePenaltyLNG &&
    observables.push(
      this.createLNG(args, res, next, incomingObj.AdministrativePenaltyLNG, savedAdministrativePenalty._id)
    );
  incomingObj.AdministrativePenaltyNRCED &&
    observables.push(
      this.createNRCED(args, res, next, incomingObj.AdministrativePenaltyNRCED, savedAdministrativePenalty._id)
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
    object: savedAdministrativePenalty,
    flavours: flavourRes
  };
};

/**
 * Create LNG Administrative Penalty record.
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

  const AdministrativePenaltyLNG = mongoose.model(RECORD_TYPE.AdministrativePenalty.flavours.lng._schemaName);
  const inpsectionLNG = new AdministrativePenaltyLNG();

  inpsectionLNG._schemaName = RECORD_TYPE.AdministrativePenalty.flavours.lng._schemaName;
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
    const savedAdministrativePenaltyLNG = await inpsectionLNG.save();
    return {
      status: 'success',
      object: savedAdministrativePenaltyLNG
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
 * Create NRCED Administrative Penalty record.
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

  const AdministrativePenaltyNRCED = mongoose.model(RECORD_TYPE.AdministrativePenalty.flavours.nrced._schemaName);
  const inpsectionNRCED = new AdministrativePenaltyNRCED();

  inpsectionNRCED._schemaName = RECORD_TYPE.AdministrativePenalty.flavours.nrced._schemaName;
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
    const savedAdministrativePenaltyNRCED = await inpsectionNRCED.save();
    return {
      status: 'success',
      object: savedAdministrativePenaltyNRCED
    };
  } catch (error) {
    return {
      status: 'failure',
      object: inpsectionNRCED,
      errorMessage: error.message
    };
  }
};
