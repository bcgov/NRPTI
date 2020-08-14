const mongoose = require('mongoose');
const ObjectId = require('mongoose').Types.ObjectId;
const postUtils = require('../../utils/post-utils');
const { userHasValidRoles } = require('../../utils/auth-utils');
const utils = require('../../utils/constants/misc');

/**
 * Performs all operations necessary to create a master Construction Plan record and its associated flavour records.
 *
 * Example of incomingObj
 *
 *  constructionPlans: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'constructionPlan',
 *      ...
 *      ConstructionPlanLNG: {
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
    ConstructionPlanLNG: this.createLNG
  }
  return await postUtils.createRecordWithFlavours(args, res, next, incomingObj, this.createMaster, flavourFunctions);
};

/**
 * Performs all operations necessary to create a master Construction Plan record.
 *
 * Example of incomingObj
 *
 *  constructionPlans: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'constructionPlan',
 *      ...
 *      ConstructionPlanLNG: {
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
 * @returns created master constructionPlan record
 */
exports.createMaster = function (args, res, next, incomingObj, flavourIds) {
  let ConstructionPlan = mongoose.model('ConstructionPlan');
  let constructionPlan = new ConstructionPlan();

  constructionPlan._schemaName = 'ConstructionPlan';

  // set integration references
  incomingObj._epicProjectId &&
    ObjectId.isValid(incomingObj._epicProjectId) &&
    (constructionPlan._epicProjectId = new ObjectId(incomingObj._epicProjectId));
  incomingObj._sourceRefId &&
    ObjectId.isValid(incomingObj._sourceRefId) &&
    (constructionPlan._sourceRefId = new ObjectId(incomingObj._sourceRefId));
  incomingObj._epicMilestoneId &&
    ObjectId.isValid(incomingObj._epicMilestoneId) &&
    (constructionPlan._epicMilestoneId = new ObjectId(incomingObj._epicMilestoneId));

  // set permissions
  constructionPlan.read = utils.ApplicationAdminRoles;
  constructionPlan.write = utils.ApplicationAdminRoles;

  // set forward references
  if (flavourIds && flavourIds.length) {
    flavourIds.forEach(id => {
      if (ObjectId.isValid(id)) {
        constructionPlan._flavourRecords.push(new ObjectId(id));
      }
    });
  }

  // set data
  incomingObj.recordName && (constructionPlan.recordName = incomingObj.recordName);
  constructionPlan.recordType = 'Construction Plan';
  incomingObj.dateIssued && (constructionPlan.dateIssued = incomingObj.dateIssued);
  incomingObj.agency && (constructionPlan.agency = incomingObj.agency);
  incomingObj.author && (constructionPlan.author = incomingObj.author);
  incomingObj.projectName && (constructionPlan.projectName = incomingObj.projectName);
  incomingObj.location && (constructionPlan.location = incomingObj.location);
  incomingObj.centroid && (constructionPlan.centroid = incomingObj.centroid);
  incomingObj.documents && (constructionPlan.documents = incomingObj.documents);

  // set meta
  constructionPlan.addedBy = args.swagger.params.auth_payload.displayName;
  constructionPlan.dateAdded = new Date();

  // set data source references
  incomingObj.sourceDateAdded && (constructionPlan.sourceDateAdded = incomingObj.sourceDateAdded);
  incomingObj.sourceDateUpdated && (constructionPlan.sourceDateUpdated = incomingObj.sourceDateUpdated);
  incomingObj.sourceSystemRef && (constructionPlan.sourceSystemRef = incomingObj.sourceSystemRef);
  incomingObj.isLngPublished && (constructionPlan.isLngPublished = incomingObj.isLngPublished);

  return constructionPlan;
};

/**
 * Performs all operations necessary to create a LNG Construction Plan record.
 *
 * Example of incomingObj
 *
 *  constructionPlans: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'constructionPlan',
 *      ...
 *      ConstructionPlanLNG: {
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
 * @returns created lng constructionPlan record
 */
exports.createLNG = function (args, res, next, incomingObj) {
  // Confirm user has correct role for this type of record.
  if (!userHasValidRoles([utils.ApplicationRoles.ADMIN, utils.ApplicationRoles.ADMIN_LNG], args.swagger.params.auth_payload.realm_access.roles)) {
    throw new Error('Missing valid user role.');
  }
  
  let ConstructionPlanLNG = mongoose.model('ConstructionPlanLNG');
  let constructionPlanLNG = new ConstructionPlanLNG();

  constructionPlanLNG._schemaName = 'ConstructionPlanLNG';

  // set integration references
  incomingObj._epicProjectId &&
    ObjectId.isValid(incomingObj._epicProjectId) &&
    (constructionPlanLNG._epicProjectId = new ObjectId(incomingObj._epicProjectId));
  incomingObj._sourceRefId &&
    ObjectId.isValid(incomingObj._sourceRefId) &&
    (constructionPlanLNG._sourceRefId = new ObjectId(incomingObj._sourceRefId));
  incomingObj._epicMilestoneId &&
    ObjectId.isValid(incomingObj._epicMilestoneId) &&
    (constructionPlanLNG._epicMilestoneId = new ObjectId(incomingObj._epicMilestoneId));

  // set permissions and meta
  constructionPlanLNG.read = utils.ApplicationAdminRoles;
  constructionPlanLNG.write = [utils.ApplicationRoles.ADMIN, utils.ApplicationRoles.ADMIN_LNG];

  // If incoming object has addRole: 'public' then read will look like ['sysadmin', 'public']
  if (incomingObj.addRole && incomingObj.addRole === 'public') {
    constructionPlanLNG.read.push('public');
    constructionPlanLNG.datePublished = new Date();
    constructionPlanLNG.publishedBy = args.swagger.params.auth_payload.displayName;
  }

  constructionPlanLNG.addedBy = args.swagger.params.auth_payload.displayName;
  constructionPlanLNG.dateAdded = new Date();

  // set master data
  incomingObj.recordName && (constructionPlanLNG.recordName = incomingObj.recordName);
  constructionPlanLNG.recordType = 'Construction Plan';
  incomingObj.dateIssued && (constructionPlanLNG.dateIssued = incomingObj.dateIssued);
  incomingObj.agency && (constructionPlanLNG.agency = incomingObj.agency);
  incomingObj.author && (constructionPlanLNG.author = incomingObj.author);
  incomingObj.projectName && (constructionPlanLNG.projectName = incomingObj.projectName);
  incomingObj.location && (constructionPlanLNG.location = incomingObj.location);
  incomingObj.centroid && (constructionPlanLNG.centroid = incomingObj.centroid);
  incomingObj.documents && (constructionPlanLNG.documents = incomingObj.documents);

  // set flavour data
  incomingObj.description && (constructionPlanLNG.description = incomingObj.description);
  incomingObj.relatedPhase && (constructionPlanLNG.relatedPhase = incomingObj.relatedPhase);

  // set data source references
  incomingObj.sourceDateAdded && (constructionPlanLNG.sourceDateAdded = incomingObj.sourceDateAdded);
  incomingObj.sourceDateUpdated && (constructionPlanLNG.sourceDateUpdated = incomingObj.sourceDateUpdated);
  incomingObj.sourceSystemRef && (constructionPlanLNG.sourceSystemRef = incomingObj.sourceSystemRef);

  return constructionPlanLNG;
};
