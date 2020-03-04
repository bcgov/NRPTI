const mongoose = require('mongoose');
const ObjectId = require('mongoose').Types.ObjectId;
const RECORD_TYPE = require('../../utils/constants/record-type-enum');

/**
 * Create Master SelfReport record.
 *
 * Example of incomingObj:
 *
 * selfReport: [
 *   {
 *     recordName: 'test abc',
 *     recordType: 'whatever',
 *     ...
 *     SelfReportLNG: {
 *       description: 'lng description'
 *       addRole: 'public',
 *     }
 *   },
 *   ...
 * ]
 */
exports.createMaster = async function(args, res, next, incomingObj) {
  const SelfReport = mongoose.model(RECORD_TYPE.SelfReport._schemaName);
  const selfReport = new SelfReport();

  selfReport._schemaName = RECORD_TYPE.SelfReport._schemaName;
  incomingObj._epicProjectId &&
    ObjectId.isValid(incomingObj._epicProjectId) &&
    (selfReport._epicProjectId = new ObjectId(incomingObj._epicProjectId));
  incomingObj._sourceRefId &&
    ObjectId.isValid(incomingObj._sourceRefId) &&
    (selfReport._sourceRefId = new ObjectId(incomingObj._sourceRefId));
  incomingObj._epicMilestoneId &&
    ObjectId.isValid(incomingObj._epicMilestoneId) &&
    (selfReport._epicMilestoneId = new ObjectId(incomingObj._epicMilestoneId));

  incomingObj.recordName && (selfReport.recordName = incomingObj.recordName);
  selfReport.recordType = RECORD_TYPE.SelfReport.displayName;
  incomingObj.dateIssued && (selfReport.dateIssued = incomingObj.dateIssued);
  incomingObj.issuingAgency && (selfReport.issuingAgency = incomingObj.issuingAgency);
  incomingObj.author && (selfReport.author = incomingObj.author);
  incomingObj.legislation && incomingObj.legislation.act && (selfReport.legislation.act = incomingObj.legislation.act);
  incomingObj.legislation &&
    incomingObj.legislation.regulation &&
    (selfReport.legislation.regulation = incomingObj.legislation.regulation);
  incomingObj.legislation &&
    incomingObj.legislation.section &&
    (selfReport.legislation.section = incomingObj.legislation.section);
  incomingObj.legislation &&
    incomingObj.legislation.subSection &&
    (selfReport.legislation.subSection = incomingObj.legislation.subSection);
  incomingObj.legislation &&
    incomingObj.legislation.paragraph &&
    (selfReport.legislation.paragraph = incomingObj.legislation.paragraph);
  incomingObj.projectName && (selfReport.projectName = incomingObj.projectName);
  incomingObj.location && (selfReport.location = incomingObj.location);
  incomingObj.centroid && (selfReport.centroid = incomingObj.centroid);

  selfReport.dateAdded = new Date();
  selfReport.publishedBy = args.swagger.params.auth_payload.displayName;

  incomingObj.sourceDateAdded && (selfReport.sourceDateAdded = incomingObj.sourceDateAdded);
  incomingObj.sourceDateUpdated && (selfReport.sourceDateUpdated = incomingObj.sourceDateUpdated);
  incomingObj.sourceSystemRef && (selfReport.sourceSystemRef = incomingObj.sourceSystemRef);

  selfReport.read = ['sysadmin'];
  selfReport.write = ['sysadmin'];

  let savedSelfReport = null;
  try {
    savedSelfReport = await selfReport.save();
  } catch (error) {
    return {
      status: 'failure',
      object: selfReport,
      errorMessage: error
    };
  }

  const observables = [];
  incomingObj.SelfReportLNG &&
    observables.push(this.createLNG(args, res, next, incomingObj.SelfReportLNG, savedSelfReport._id));

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
    object: savedSelfReport,
    flavours: flavourRes
  };
};

/**
 * Create LNG SelfReport record.
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

  const SelfReportLNG = mongoose.model(RECORD_TYPE.SelfReport.flavours.lng._schemaName);
  const inpsectionLNG = new SelfReportLNG();

  inpsectionLNG._schemaName = RECORD_TYPE.SelfReport.flavours.lng._schemaName;
  inpsectionLNG._master = new ObjectId(masterId);
  inpsectionLNG.read = ['sysadmin'];
  inpsectionLNG.write = ['sysadmin'];
  // If incoming object has addRole: 'public' then read will look like ['sysadmin', 'public']
  incomingObj.addRole &&
    incomingObj.addRole === 'public' &&
    inpsectionLNG.read.push('public') &&
    (inpsectionLNG.datePublished = new Date());

  incomingObj.relatedPhase && (inpsectionLNG.relatedPhase = incomingObj.relatedPhase);
  incomingObj.description && (inpsectionLNG.description = incomingObj.description);

  inpsectionLNG.dateAdded = new Date();

  try {
    const savedSelfReportLNG = await inpsectionLNG.save();
    return {
      status: 'success',
      object: savedSelfReportLNG
    };
  } catch (error) {
    return {
      status: 'failure',
      object: inpsectionLNG,
      errorMessage: error
    };
  }
};
