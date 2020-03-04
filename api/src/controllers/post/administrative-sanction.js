const mongoose = require('mongoose');
const ObjectId = require('mongoose').Types.ObjectId;
const RECORD_TYPE = require('../../utils/constants/record-type-enum');

/**
 * Create Master Administrative Sanction record.
 *
 * Example of incomingObj:
 *
 * administrativeSanction: [
 *   {
 *     recordName: 'test abc',
 *     recordType: 'whatever',
 *     ...
 *     AdministrativeSanctionLNG: {
 *       description: 'lng description'
 *       addRole: 'public',
 *     }
 *   },
 *   ...
 * ]
 */
exports.createMaster = async function(args, res, next, incomingObj) {
  const AdministrativeSanction = mongoose.model(RECORD_TYPE.AdministrativeSanction._schemaName);
  const administrativeSanction = new AdministrativeSanction();

  administrativeSanction._schemaName = RECORD_TYPE.AdministrativeSanction._schemaName;
  incomingObj._epicProjectId &&
    ObjectId.isValid(incomingObj._epicProjectId) &&
    (administrativeSanction._epicProjectId = new ObjectId(incomingObj._epicProjectId));
  incomingObj._sourceRefId &&
    ObjectId.isValid(incomingObj._sourceRefId) &&
    (administrativeSanction._sourceRefId = new ObjectId(incomingObj._sourceRefId));
  incomingObj._epicMilestoneId &&
    ObjectId.isValid(incomingObj._epicMilestoneId) &&
    (administrativeSanction._epicMilestoneId = new ObjectId(incomingObj._epicMilestoneId));

  incomingObj.recordName && (administrativeSanction.recordName = incomingObj.recordName);
  administrativeSanction.recordType = RECORD_TYPE.AdministrativeSanction.displayName;
  incomingObj.dateIssued && (administrativeSanction.dateIssued = incomingObj.dateIssued);
  incomingObj.issuingAgency && (administrativeSanction.issuingAgency = incomingObj.issuingAgency);
  incomingObj.author && (administrativeSanction.author = incomingObj.author);
  incomingObj.legislation &&
    incomingObj.legislation.act &&
    (administrativeSanction.legislation.act = incomingObj.legislation.act);
  incomingObj.legislation &&
    incomingObj.legislation.regulation &&
    (administrativeSanction.legislation.regulation = incomingObj.legislation.regulation);
  incomingObj.legislation &&
    incomingObj.legislation.section &&
    (administrativeSanction.legislation.section = incomingObj.legislation.section);
  incomingObj.legislation &&
    incomingObj.legislation.subSection &&
    (administrativeSanction.legislation.subSection = incomingObj.legislation.subSection);
  incomingObj.legislation &&
    incomingObj.legislation.paragraph &&
    (administrativeSanction.legislation.paragraph = incomingObj.legislation.paragraph);
  incomingObj.issuedTo && (administrativeSanction.issuedTo = incomingObj.issuedTo);
  incomingObj.projectName && (administrativeSanction.projectName = incomingObj.projectName);
  incomingObj.location && (administrativeSanction.location = incomingObj.location);
  incomingObj.centroid && (administrativeSanction.centroid = incomingObj.centroid);
  incomingObj.outcomeStatus && (administrativeSanction.outcomeStatus = incomingObj.outcomeStatus);
  incomingObj.outcomeDescription && (administrativeSanction.outcomeDescription = incomingObj.outcomeDescription);
  incomingObj.penalty && (administrativeSanction.penalty = incomingObj.penalty);

  administrativeSanction.dateAdded = new Date();
  administrativeSanction.publishedBy = args.swagger.params.auth_payload.displayName;

  incomingObj.sourceDateAdded && (administrativeSanction.sourceDateAdded = incomingObj.sourceDateAdded);
  incomingObj.sourceDateUpdated && (administrativeSanction.sourceDateUpdated = incomingObj.sourceDateUpdated);
  incomingObj.sourceSystemRef && (administrativeSanction.sourceSystemRef = incomingObj.sourceSystemRef);

  administrativeSanction.read = ['sysadmin'];
  administrativeSanction.write = ['sysadmin'];

  let savedAdministrativeSanction = null;
  try {
    savedAdministrativeSanction = await administrativeSanction.save();
  } catch (error) {
    return {
      status: 'failure',
      object: administrativeSanction,
      errorMessage: error.message
    };
  }

  const observables = [];
  incomingObj.AdministrativeSanctionLNG &&
    observables.push(
      this.createLNG(args, res, next, incomingObj.AdministrativeSanctionLNG, savedAdministrativeSanction._id)
    );
  incomingObj.AdministrativeSanctionNRCED &&
    observables.push(
      this.createNRCED(args, res, next, incomingObj.AdministrativeSanctionNRCED, savedAdministrativeSanction._id)
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
    object: savedAdministrativeSanction,
    flavours: flavourRes
  };
};

/**
 * Create LNG Administrative Sanction record.
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

  const AdministrativeSanctionLNG = mongoose.model(RECORD_TYPE.AdministrativeSanction.flavours.lng._schemaName);
  const inpsectionLNG = new AdministrativeSanctionLNG();

  inpsectionLNG._schemaName = RECORD_TYPE.AdministrativeSanction.flavours.lng._schemaName;
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
    const savedAdministrativeSanctionLNG = await inpsectionLNG.save();
    return {
      status: 'success',
      object: savedAdministrativeSanctionLNG
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
 * Create NRCED Administrative Sanction record.
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

  const AdministrativeSanctionNRCED = mongoose.model(RECORD_TYPE.AdministrativeSanction.flavours.nrced._schemaName);
  const inpsectionNRCED = new AdministrativeSanctionNRCED();

  inpsectionNRCED._schemaName = RECORD_TYPE.AdministrativeSanction.flavours.nrced._schemaName;
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
    const savedAdministrativeSanctionNRCED = await inpsectionNRCED.save();
    return {
      status: 'success',
      object: savedAdministrativeSanctionNRCED
    };
  } catch (error) {
    return {
      status: 'failure',
      object: inpsectionNRCED,
      errorMessage: error.message
    };
  }
};
