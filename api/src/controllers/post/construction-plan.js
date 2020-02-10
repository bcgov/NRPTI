const mongoose = require('mongoose');
const ObjectId = require('mongoose').Types.ObjectId;
const RECORD_TYPE = require('../../utils/constants/record-type-enum');

/**
 * Create Master Construction Plan record.
 *
 * Example of incomingObj:
 *
 * constructionPlan: [
 *   {
 *     recordName: 'test abc',
 *     recordType: 'whatever',
 *     ...
 *     ConstructionPlanLNG: {
 *       description: 'lng description'
 *       addRole: 'public',
 *     }
 *   },
 *   ...
 * ]
 */
exports.createMaster = async function(args, res, next, incomingObj) {
  const ConstructionPlan = mongoose.model(RECORD_TYPE.ConstructionPlan._schemaName);
  const constructionPlan = new ConstructionPlan();

  constructionPlan._schemaName = RECORD_TYPE.ConstructionPlan._schemaName;
  incomingObj._epicProjectId &&
    ObjectId.isValid(incomingObj._epicProjectId) &&
    (constructionPlan._epicProjectId = new ObjectId(incomingObj._epicProjectId));
  incomingObj._sourceRefId &&
    ObjectId.isValid(incomingObj._sourceRefId) &&
    (constructionPlan._sourceRefId = new ObjectId(incomingObj._sourceRefId));
  incomingObj._epicMilestoneId &&
    ObjectId.isValid(incomingObj._epicMilestoneId) &&
    (constructionPlan._epicMilestoneId = new ObjectId(incomingObj._epicMilestoneId));

  incomingObj.recordName && (constructionPlan.recordName = incomingObj.recordName);
  constructionPlan.recordType = RECORD_TYPE.ConstructionPlan.displayName;
  incomingObj.dateIssued && (constructionPlan.dateIssued = incomingObj.dateIssued);
  incomingObj.agency && (constructionPlan.agency = incomingObj.agency);
  incomingObj.author && (constructionPlan.author = incomingObj.author);
  incomingObj.issuedTo && (constructionPlan.issuedTo = incomingObj.issuedTo);
  incomingObj.projectName && (constructionPlan.projectName = incomingObj.projectName);
  incomingObj.location && (constructionPlan.location = incomingObj.location);
  incomingObj.centroid && (constructionPlan.centroid = incomingObj.centroid);

  constructionPlan.dateAdded = new Date();
  constructionPlan.publishedBy = args.swagger.params.auth_payload.displayName;

  incomingObj.sourceDateAdded && (constructionPlan.sourceDateAdded = incomingObj.sourceDateAdded);
  incomingObj.sourceDateUpdated && (constructionPlan.sourceDateUpdated = incomingObj.sourceDateUpdated);
  incomingObj.sourceSystemRef && (constructionPlan.sourceSystemRef = incomingObj.sourceSystemRef);

  constructionPlan.read = ['sysadmin'];
  constructionPlan.write = ['sysadmin'];

  let savedConstructionPlan = null;
  try {
    savedConstructionPlan = await constructionPlan.save();
  } catch (error) {
    return {
      status: 'failure',
      object: constructionPlan,
      errorMessage: error
    };
  }

  const observables = [];
  incomingObj.ConstructionPlanLNG &&
    observables.push(this.createLNG(args, res, next, incomingObj.ConstructionPlanLNG, savedConstructionPlan._id));

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
    object: savedConstructionPlan,
    flavours: flavourRes
  };
};

/**
 * Create LNG Construction Plan record.
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

  const ConstructionPlanLNG = mongoose.model(RECORD_TYPE.ConstructionPlan.flavours.lng._schemaName);
  const inpsectionLNG = new ConstructionPlanLNG();

  inpsectionLNG._schemaName = RECORD_TYPE.ConstructionPlan.flavours.lng._schemaName;
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
    const savedConstructionPlanLNG = await inpsectionLNG.save();
    return {
      status: 'success',
      object: savedConstructionPlanLNG
    };
  } catch (error) {
    return {
      status: 'failure',
      object: inpsectionLNG,
      errorMessage: error
    };
  }
};
