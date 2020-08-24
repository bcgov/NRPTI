const mongoose = require('mongoose');
const ObjectId = require('mongoose').Types.ObjectId;
const postUtils = require('../../utils/post-utils');
const { userHasValidRoles } = require('../../utils/auth-utils');
const utils = require('../../utils/constants/misc');

/**
 * Performs all operations necessary to create a master Management Plan record and its associated flavour records.
 *
 * Example of incomingObj
 *
 *  managementPlans: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'managementPlan',
 *      ...
 *      ManagementPlanLNG: {
 *        description: 'lng description'
 *        addRole: 'public',
 *        ...
 *      }
 *    }
 *  ]
 *
 * @param {*} args
 * @param {*} res
 * @param {*} next
 * @param {*} incomingObj see example
 * @returns object containing the operation's status and created records
 */
exports.createRecord = async function (args, res, next, incomingObj) {
  const flavourFunctions = {
    ManagementPlanLNG: this.createLNG,
    ManagementPlanBCMI: this.createBCMI
  }
  return await postUtils.createRecordWithFlavours(args, res, next, incomingObj, this.createMaster, flavourFunctions);
};

/**
 * Performs all operations necessary to create a master Management Plan record.
 *
 * Example of incomingObj
 *
 *  managementPlans: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'managementPlan',
 *      ...
 *      ManagementPlanLNG: {
 *        description: 'lng description'
 *        addRole: 'public',
 *        ...
 *      }
 *    }
 *  ]
 *
 * @param {*} args
 * @param {*} res
 * @param {*} next
 * @param {*} incomingObj see example
 * @param {*} flavourIds array of flavour record _ids
 * @returns created master managementPlan record
 */
exports.createMaster = function (args, res, next, incomingObj, flavourIds) {
  let ManagementPlan = mongoose.model('ManagementPlan');
  let managementPlan = new ManagementPlan();

  managementPlan._schemaName = 'ManagementPlan';

  // set integration references
  incomingObj._epicProjectId &&
    ObjectId.isValid(incomingObj._epicProjectId) &&
    (managementPlan._epicProjectId = new ObjectId(incomingObj._epicProjectId));
  incomingObj._sourceRefId &&
    ObjectId.isValid(incomingObj._sourceRefId) &&
    (managementPlan._sourceRefId = new ObjectId(incomingObj._sourceRefId));
  incomingObj._epicMilestoneId &&
    ObjectId.isValid(incomingObj._epicMilestoneId) &&
    (managementPlan._epicMilestoneId = new ObjectId(incomingObj._epicMilestoneId));
  incomingObj.collectionId &&
    ObjectId.isValid(incomingObj.collectionId) &&
    (managementPlan.collectionId = new ObjectId(incomingObj.collectionId));

  // set permissions
  managementPlan.read = utils.ApplicationAdminRoles;
  managementPlan.write = utils.ApplicationAdminRoles;

  // set forward references
  if (flavourIds && flavourIds.length) {
    flavourIds.forEach(id => {
      if (ObjectId.isValid(id)) {
        managementPlan._flavourRecords.push(new ObjectId(id));
      }
    });
  }

  // set data
  incomingObj.recordName && (managementPlan.recordName = incomingObj.recordName);
  managementPlan.recordType = 'Management Plan';
  incomingObj.dateIssued && (managementPlan.dateIssued = incomingObj.dateIssued);
  incomingObj.agency && (managementPlan.agency = incomingObj.agency);
  incomingObj.author && (managementPlan.author = incomingObj.author);
  incomingObj.projectName && (managementPlan.projectName = incomingObj.projectName);
  incomingObj.location && (managementPlan.location = incomingObj.location);
  incomingObj.centroid && (managementPlan.centroid = incomingObj.centroid);
  incomingObj.documents && (managementPlan.documents = incomingObj.documents);

  // set meta
  managementPlan.addedBy = args.swagger.params.auth_payload.displayName;
  managementPlan.dateAdded = new Date();

  // set data source references
  incomingObj.sourceDateAdded && (managementPlan.sourceDateAdded = incomingObj.sourceDateAdded);
  incomingObj.sourceDateUpdated && (managementPlan.sourceDateUpdated = incomingObj.sourceDateUpdated);
  incomingObj.sourceSystemRef && (managementPlan.sourceSystemRef = incomingObj.sourceSystemRef);
  incomingObj.isLngPublished && (managementPlan.isLngPublished = incomingObj.isLngPublished);

  return managementPlan;
};

/**
 * Performs all operations necessary to create a LNG Management Plan record.
 *
 * Example of incomingObj
 *
 *  managementPlans: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'managementPlan',
 *      ...
 *      ManagementPlanLNG: {
 *        description: 'lng description'
 *        addRole: 'public',
 *        ...
 *      }
 *    }
 *  ]
 *
 * @param {*} args
 * @param {*} res
 * @param {*} next
 * @param {*} incomingObj see example
 * @returns created lng managementPlan record
 */
exports.createLNG = function (args, res, next, incomingObj) {
  // Confirm user has correct role for this type of record.
  if (!userHasValidRoles([utils.ApplicationRoles.ADMIN, utils.ApplicationRoles.ADMIN_LNG], args.swagger.params.auth_payload.realm_access.roles)) {
    throw new Error('Missing valid user role.');
  }

  let ManagementPlanLNG = mongoose.model('ManagementPlanLNG');
  let managementPlanLNG = new ManagementPlanLNG();

  managementPlanLNG._schemaName = 'ManagementPlanLNG';

  // set integration references
  incomingObj._epicProjectId &&
    ObjectId.isValid(incomingObj._epicProjectId) &&
    (managementPlanLNG._epicProjectId = new ObjectId(incomingObj._epicProjectId));
  incomingObj._sourceRefId &&
    ObjectId.isValid(incomingObj._sourceRefId) &&
    (managementPlanLNG._sourceRefId = new ObjectId(incomingObj._sourceRefId));
  incomingObj._epicMilestoneId &&
    ObjectId.isValid(incomingObj._epicMilestoneId) &&
    (managementPlanLNG._epicMilestoneId = new ObjectId(incomingObj._epicMilestoneId));

  // set permissions and meta
  managementPlanLNG.read = utils.ApplicationAdminRoles;
  managementPlanLNG.write = [utils.ApplicationRoles.ADMIN, utils.ApplicationRoles.ADMIN_LNG];

  // If incoming object has addRole: 'public' then read will look like ['sysadmin', 'public']
  if (incomingObj.addRole && incomingObj.addRole === 'public') {
    managementPlanLNG.read.push('public');
    managementPlanLNG.datePublished = new Date();
    managementPlanLNG.publishedBy = args.swagger.params.auth_payload.displayName;
  }

  managementPlanLNG.addedBy = args.swagger.params.auth_payload.displayName;
  managementPlanLNG.dateAdded = new Date();

  // set master data
  incomingObj.recordName && (managementPlanLNG.recordName = incomingObj.recordName);
  managementPlanLNG.recordType = 'Management Plan';
  incomingObj.dateIssued && (managementPlanLNG.dateIssued = incomingObj.dateIssued);
  incomingObj.agency && (managementPlanLNG.agency = incomingObj.agency);
  incomingObj.author && (managementPlanLNG.author = incomingObj.author);
  incomingObj.projectName && (managementPlanLNG.projectName = incomingObj.projectName);
  incomingObj.location && (managementPlanLNG.location = incomingObj.location);
  incomingObj.centroid && (managementPlanLNG.centroid = incomingObj.centroid);
  incomingObj.documents && (managementPlanLNG.documents = incomingObj.documents);

  // set flavour data
  incomingObj.description && (managementPlanLNG.description = incomingObj.description);
  incomingObj.relatedPhase && (managementPlanLNG.relatedPhase = incomingObj.relatedPhase);

  // set data source references
  incomingObj.sourceDateAdded && (managementPlanLNG.sourceDateAdded = incomingObj.sourceDateAdded);
  incomingObj.sourceDateUpdated && (managementPlanLNG.sourceDateUpdated = incomingObj.sourceDateUpdated);
  incomingObj.sourceSystemRef && (managementPlanLNG.sourceSystemRef = incomingObj.sourceSystemRef);

  return managementPlanLNG;
};

/**
 * Performs all operations necessary to create a BCMI Management Plan record.
 *
 * Example of incomingObj
 *
 *  managementPlans: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'managementPlan',
 *      ...
 *      ManagementPlanLNG: {
 *        description: 'lng description'
 *        addRole: 'public',
 *        ...
 *      }
 *    }
 *  ]
 *
 * @param {*} args
 * @param {*} res
 * @param {*} next
 * @param {*} incomingObj see example
 * @returns created bcmi managementPlan record
 */
 exports.createBCMI = function (args, res, next, incomingObj) {
  // Confirm user has correct role for this type of record.
  if (!userHasValidRoles([utils.ApplicationRoles.ADMIN, utils.ApplicationRoles.ADMIN_BCMI], args.swagger.params.auth_payload.realm_access.roles)) {
    throw new Error('Missing valid user role.');
  }

  let ManagementPlanLNG = mongoose.model('ManagementPlanBCMI');
  let managementPlanBCMI = new ManagementPlanLNG();

  managementPlanBCMI._schemaName = 'ManagementPlanBCMI';

  // set integration references
  incomingObj._epicProjectId &&
    ObjectId.isValid(incomingObj._epicProjectId) &&
    (managementPlanBCMI._epicProjectId = new ObjectId(incomingObj._epicProjectId));
  incomingObj._sourceRefId &&
    ObjectId.isValid(incomingObj._sourceRefId) &&
    (managementPlanBCMI._sourceRefId = new ObjectId(incomingObj._sourceRefId));
  incomingObj._epicMilestoneId &&
    ObjectId.isValid(incomingObj._epicMilestoneId) &&
    (managementPlanBCMI._epicMilestoneId = new ObjectId(incomingObj._epicMilestoneId));
  incomingObj.collectionId &&
    ObjectId.isValid(incomingObj.collectionId) &&
    (managementPlanBCMI.collectionId = new ObjectId(incomingObj.collectionId));

  // set permissions and meta
  managementPlanBCMI.read = utils.ApplicationAdminRoles;
  managementPlanBCMI.write = [utils.ApplicationRoles.ADMIN, utils.ApplicationRoles.ADMIN_BCMI];

  // If incoming object has addRole: 'public' then read will look like ['sysadmin', 'public']
  if (incomingObj.addRole && incomingObj.addRole === 'public') {
    managementPlanBCMI.read.push('public');
    managementPlanBCMI.datePublished = new Date();
    managementPlanBCMI.publishedBy = args.swagger.params.auth_payload.displayName;
  }

  managementPlanBCMI.addedBy = args.swagger.params.auth_payload.displayName;
  managementPlanBCMI.dateAdded = new Date();

  // set master data
  incomingObj.recordName && (managementPlanBCMI.recordName = incomingObj.recordName);
  managementPlanBCMI.recordType = 'Management Plan';
  incomingObj.dateIssued && (managementPlanBCMI.dateIssued = incomingObj.dateIssued);
  incomingObj.agency && (managementPlanBCMI.agency = incomingObj.agency);
  incomingObj.author && (managementPlanBCMI.author = incomingObj.author);
  incomingObj.projectName && (managementPlanBCMI.projectName = incomingObj.projectName);
  incomingObj.location && (managementPlanBCMI.location = incomingObj.location);
  incomingObj.centroid && (managementPlanBCMI.centroid = incomingObj.centroid);
  incomingObj.documents && (managementPlanBCMI.documents = incomingObj.documents);

  // set flavour data
  incomingObj.description && (managementPlanBCMI.description = incomingObj.description);
  incomingObj.relatedPhase && (managementPlanBCMI.relatedPhase = incomingObj.relatedPhase);

  // set data source references
  incomingObj.sourceDateAdded && (managementPlanBCMI.sourceDateAdded = incomingObj.sourceDateAdded);
  incomingObj.sourceDateUpdated && (managementPlanBCMI.sourceDateUpdated = incomingObj.sourceDateUpdated);
  incomingObj.sourceSystemRef && (managementPlanBCMI.sourceSystemRef = incomingObj.sourceSystemRef);

  return managementPlanBCMI;
};
