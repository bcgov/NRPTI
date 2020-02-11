const mongoose = require('mongoose');
const ObjectId = require('mongoose').Types.ObjectId;
const RECORD_TYPE = require('../../utils/constants/record-type-enum');

/**
 * Create Master Management Plan record.
 *
 * Example of incomingObj:
 *
 * managementPlan: [
 *   {
 *     recordName: 'test abc',
 *     recordType: 'whatever',
 *     ...
 *     ManagementPlanLNG: {
 *       description: 'lng description'
 *       addRole: 'public',
 *     }
 *   },
 *   ...
 * ]
 */
exports.createMaster = async function(args, res, next, incomingObj) {
  const ManagementPlan = mongoose.model(RECORD_TYPE.ManagementPlan._schemaName);
  const managementPlan = new ManagementPlan();

  managementPlan._schemaName = RECORD_TYPE.ManagementPlan._schemaName;
  incomingObj._epicProjectId &&
    ObjectId.isValid(incomingObj._epicProjectId) &&
    (managementPlan._epicProjectId = new ObjectId(incomingObj._epicProjectId));
  incomingObj._sourceRefId &&
    ObjectId.isValid(incomingObj._sourceRefId) &&
    (managementPlan._sourceRefId = new ObjectId(incomingObj._sourceRefId));
  incomingObj._epicMilestoneId &&
    ObjectId.isValid(incomingObj._epicMilestoneId) &&
    (managementPlan._epicMilestoneId = new ObjectId(incomingObj._epicMilestoneId));

  incomingObj.recordName && (managementPlan.recordName = incomingObj.recordName);
  managementPlan.recordType = RECORD_TYPE.ManagementPlan.displayName;
  incomingObj.dateIssued && (managementPlan.dateIssued = incomingObj.dateIssued);
  incomingObj.agency && (managementPlan.agency = incomingObj.agency);
  incomingObj.author && (managementPlan.author = incomingObj.author);
  incomingObj.issuedTo && (managementPlan.issuedTo = incomingObj.issuedTo);
  incomingObj.projectName && (managementPlan.projectName = incomingObj.projectName);
  incomingObj.location && (managementPlan.location = incomingObj.location);
  incomingObj.centroid && (managementPlan.centroid = incomingObj.centroid);

  managementPlan.dateAdded = new Date();
  managementPlan.publishedBy = args.swagger.params.auth_payload.displayName;

  incomingObj.sourceDateAdded && (managementPlan.sourceDateAdded = incomingObj.sourceDateAdded);
  incomingObj.sourceDateUpdated && (managementPlan.sourceDateUpdated = incomingObj.sourceDateUpdated);
  incomingObj.sourceSystemRef && (managementPlan.sourceSystemRef = incomingObj.sourceSystemRef);

  managementPlan.read = ['sysadmin'];
  managementPlan.write = ['sysadmin'];

  let savedManagementPlan = null;
  try {
    savedManagementPlan = await managementPlan.save();
  } catch (error) {
    return {
      status: 'failure',
      object: managementPlan,
      errorMessage: error
    };
  }

  const observables = [];
  incomingObj.ManagementPlanLNG &&
    observables.push(this.createLNG(args, res, next, incomingObj.ManagementPlanLNG, savedManagementPlan._id));

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
    object: savedManagementPlan,
    flavours: flavourRes
  };
};

/**
 * Create LNG Management Plan record.
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

  const ManagementPlanLNG = mongoose.model(RECORD_TYPE.ManagementPlan.flavours.lng._schemaName);
  const inpsectionLNG = new ManagementPlanLNG();

  inpsectionLNG._schemaName = RECORD_TYPE.ManagementPlan.flavours.lng._schemaName;
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
    const savedManagementPlanLNG = await inpsectionLNG.save();
    return {
      status: 'success',
      object: savedManagementPlanLNG
    };
  } catch (error) {
    return {
      status: 'failure',
      object: inpsectionLNG,
      errorMessage: error
    };
  }
};
