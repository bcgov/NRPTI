let mongoose = require('mongoose');
let ObjectId = require('mongoose').Types.ObjectId;
let mongodb = require('../../utils/mongodb');

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
  let flavours = [];
  let flavourIds = [];
  let observables = [];
  // We have this in case there's error and we need to clean up.
  let idsToDelete = [];

  // Prepare flavours
  incomingObj.ManagementPlanLNG &&
    flavours.push(this.createLNG(args, res, next, { ...incomingObj, ...incomingObj.ManagementPlanLNG }));

  // Get flavour ids for master
  if (flavours.length > 0) {
    flavourIds = flavours.map(
      flavour => flavour._id
    );
    idsToDelete = [...flavourIds];
  }

  // Prepare master
  let masterRecord = this.createMaster(args, res, next, incomingObj, flavourIds);
  idsToDelete.push(masterRecord._id);

  // Set master back ref to flavours get ready to save
  for (let i = 0; i < flavours.length; i++) {
    flavours[i]._master = new ObjectId(masterRecord._id);
    observables.push(flavours[i].save());
  }
  observables.push(masterRecord.save());

  // Attempt to save everything.

  let result = null;
  try {
    result = await Promise.all(observables);
  } catch (e) {
    // Something went wrong. Attempt to clean up
    const db = mongodb.connection.db(process.env.MONGODB_DATABASE || 'nrpti-dev');
    const collection = db.collection('nrpti');
    let orArray = [];
    for (let i = 0; i < idsToDelete.length; i++) {
      orArray.push({ _id: new ObjectId(idsToDelete[i]) });
    }
    await collection.deleteMany({
      $or: orArray
    });

    return {
      status: 'failure',
      object: result,
      errorMessage: e.message
    };
  }
  return {
    status: 'success',
    object: result
  };
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

  // set permissions
  managementPlan.read = ['sysadmin'];
  managementPlan.write = ['sysadmin'];

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
  managementPlanLNG.read = ['sysadmin'];
  managementPlanLNG.write = ['sysadmin'];

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
