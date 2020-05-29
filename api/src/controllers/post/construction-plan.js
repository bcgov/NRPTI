let mongoose = require('mongoose');
let ObjectId = require('mongoose').Types.ObjectId;
let mongodb = require('../../utils/mongodb');

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
  let flavours = [];
  let flavourIds = [];
  let observables = [];
  // We have this in case there's error and we need to clean up.
  let idsToDelete = [];

  // Prepare flavours
  incomingObj.ConstructionPlanLNG &&
    flavours.push(this.createLNG(args, res, next, { ...incomingObj, ...incomingObj.ConstructionPlanLNG }));

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
  constructionPlan.read = ['sysadmin'];
  constructionPlan.write = ['sysadmin'];

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
  constructionPlanLNG.read = ['sysadmin'];
  constructionPlanLNG.write = ['sysadmin'];

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
