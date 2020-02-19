let mongoose = require('mongoose');
let ObjectId = require('mongoose').Types.ObjectId;

// Example of incomingObj
/**
 *    inpsections: [
 *     {
 *       recordName: 'test abc',
 *       recordType: 'whatever',
 *       ...
 *       InspectionLNG: {
 *          description: 'lng description'
 *          addRole: 'public',
 *       }
 *     },
 */
exports.createMaster = async function(args, res, next, incomingObj) {
  let Inspection = mongoose.model('Inspection');
  let inpsection = new Inspection();

  inpsection._schemaName = 'Inspection';
  incomingObj._epicProjectId &&
    ObjectId.isValid(incomingObj._epicProjectId) &&
    (inpsection._epicProjectId = new ObjectId(incomingObj._epicProjectId));
  incomingObj._sourceRefId &&
    ObjectId.isValid(incomingObj._sourceRefId) &&
    (inpsection._sourceRefId = new ObjectId(incomingObj._sourceRefId));
  incomingObj._epicMilestoneId &&
    ObjectId.isValid(incomingObj._epicMilestoneId) &&
    (inpsection._epicMilestoneId = new ObjectId(incomingObj._epicMilestoneId));

  incomingObj.recordName && (inpsection.recordName = incomingObj.recordName);
  inpsection.recordType = 'Inspection';
  incomingObj.dateIssued && (inpsection.dateIssued = incomingObj.dateIssued);
  incomingObj.issuingAgency && (inpsection.issuingAgency = incomingObj.issuingAgency);
  incomingObj.author && (inpsection.author = incomingObj.author);
  incomingObj.legislation && incomingObj.legislation.act && (inpsection.legislation.act = incomingObj.legislation.act);
  incomingObj.legislation &&
    incomingObj.legislation.regulation &&
    (inpsection.legislation.regulation = incomingObj.legislation.regulation);
  incomingObj.legislation &&
    incomingObj.legislation.section &&
    (inpsection.legislation.section = incomingObj.legislation.section);
  incomingObj.legislation &&
    incomingObj.legislation.subSection &&
    (inpsection.legislation.subSection = incomingObj.legislation.subSection);
  incomingObj.legislation &&
    incomingObj.legislation.paragraph &&
    (inpsection.legislation.paragraph = incomingObj.legislation.paragraph);
  incomingObj.issuedTo && (inpsection.issuedTo = incomingObj.issuedTo);
  incomingObj.projectName && (inpsection.projectName = incomingObj.projectName);
  incomingObj.location && (inpsection.location = incomingObj.location);
  incomingObj.centroid && (inpsection.centroid = incomingObj.centroid);
  incomingObj.outcomeStatus && (inpsection.outcomeStatus = incomingObj.outcomeStatus);
  incomingObj.outcomeDescription && (inpsection.outcomeDescription = incomingObj.outcomeDescription);

  inpsection.dateAdded = new Date();
  inpsection.publishedBy = args.swagger.params.auth_payload.displayName;

  incomingObj.sourceDateAdded && (inpsection.sourceDateAdded = incomingObj.sourceDateAdded);
  incomingObj.sourceDateUpdated && (inpsection.sourceDateUpdated = incomingObj.sourceDateUpdated);
  incomingObj.sourceSystemRef && (inpsection.sourceSystemRef = incomingObj.sourceSystemRef);

  inpsection.read = ['sysadmin'];
  inpsection.write = ['sysadmin'];

  let savedInspection = null;
  try {
    savedInspection = await inpsection.save();
  } catch (e) {
    return {
      status: 'failure',
      object: inpsection,
      errorMessage: e
    };
  }

  let observables = [];
  incomingObj.InspectionLNG &&
    observables.push(this.createLNG(args, res, next, incomingObj.InspectionLNG, savedInspection._id));
  incomingObj.InspectionNRCED &&
    observables.push(this.createNRCED(args, res, next, incomingObj.InspectionNRCED, savedInspection._id));

  let flavourRes = null;
  try {
    observables.length > 0 && (flavourRes = await Promise.all(observables));
  } catch (e) {
    flavourRes = {
      status: 'failure',
      object: observables,
      errorMessage: e
    };
  }

  return {
    status: 'success',
    object: savedInspection,
    flavours: flavourRes
  };
};

// Example of incomingObj
/**
 *  {
 *      _master: '5e1e7fcd20e4167bcfc3daa7'
 *      description: 'lng description',
 *      ...
 *      addRole: 'public'
 *  }
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

  let InspectionLNG = mongoose.model('InspectionLNG');
  let inpsectionLNG = new InspectionLNG();

  inpsectionLNG._schemaName = 'InspectionLNG';
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
    let savedInspectionLNG = await inpsectionLNG.save();
    return {
      status: 'success',
      object: savedInspectionLNG
    };
  } catch (e) {
    return {
      status: 'failure',
      object: inpsectionLNG,
      errorMessage: e
    };
  }
};

// Example of incomingObj
/**
 *  {
 *      _master: '5e1e7fcd20e4167bcfc3daa7'
 *      description: 'nrced description',
 *      ...
 *      addRole: 'public'
 *  }
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

  let InspectionNRCED = mongoose.model('InspectionNRCED');
  let inpsectionNRCED = new InspectionNRCED();

  inpsectionNRCED._schemaName = 'InspectionNRCED';
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
    let savedInspectionNRCED = await inpsectionNRCED.save();
    return {
      status: 'success',
      object: savedInspectionNRCED
    };
  } catch (e) {
    return {
      status: 'failure',
      object: inpsectionNRCED,
      errorMessage: e
    };
  }
};
