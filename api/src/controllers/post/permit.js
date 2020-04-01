let mongoose = require('mongoose');
let ObjectId = require('mongoose').Types.ObjectId;

/**
 * Performs all operations necessary to create a master Permit record and its associated flavour records.
 *
 * Example of incomingObj
 *
 *  permits: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'permit',
 *      ...
 *      PermitLNG: {
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
  // save flavour records
  let observables = [];
  let savedFlavourPermits = [];
  let flavourIds = [];

  try {
    incomingObj.PermitLNG &&
      observables.push(this.createLNG(args, res, next, { ...incomingObj, ...incomingObj.PermitLNG }));

    if (observables.length > 0) {
      savedFlavourPermits = await Promise.all(observables);

      flavourIds = savedFlavourPermits.map(flavourPermit => flavourPermit._id);
    }
  } catch (e) {
    return {
      status: 'failure',
      object: savedFlavourPermits,
      errorMessage: e.message
    };
  }

  // save permit record
  let savedPermit = null;

  try {
    savedPermit = await this.createMaster(args, res, next, incomingObj, flavourIds);

    return {
      status: 'success',
      object: savedPermit,
      flavours: savedFlavourPermits
    };
  } catch (e) {
    return {
      status: 'failure',
      object: savedPermit,
      errorMessage: e.message
    };
  }
};

/**
 * Performs all operations necessary to create a master Permit record.
 *
 * Example of incomingObj
 *
 *  permits: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'permit',
 *      ...
 *      PermitLNG: {
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
 * @returns created master permit record
 */
exports.createMaster = async function (args, res, next, incomingObj, flavourIds) {
  let Permit = mongoose.model('Permit');
  let permit = new Permit();

  permit._schemaName = 'Permit';

  // set integration references
  incomingObj._epicProjectId &&
    ObjectId.isValid(incomingObj._epicProjectId) &&
    (permit._epicProjectId = new ObjectId(incomingObj._epicProjectId));
  incomingObj._sourceRefId &&
    ObjectId.isValid(incomingObj._sourceRefId) &&
    (permit._sourceRefId = new ObjectId(incomingObj._sourceRefId));
  incomingObj._epicMilestoneId &&
    ObjectId.isValid(incomingObj._epicMilestoneId) &&
    (permit._epicMilestoneId = new ObjectId(incomingObj._epicMilestoneId));

  // set permissions
  permit.read = ['sysadmin'];
  permit.write = ['sysadmin'];

  // set forward references
  if (flavourIds && flavourIds.length) {
    flavourIds.forEach(id => {
      if (ObjectId.isValid(id)) {
        permit._flavourRecords.push(new ObjectId(id));
      }
    });
  }

  // set data
  incomingObj.recordName && (permit.recordName = incomingObj.recordName);
  permit.recordType = 'Permit';
  incomingObj.recordSubtype && (permit.recordSubtype = incomingObj.recordSubtype);
  incomingObj.dateIssued && (permit.dateIssued = incomingObj.dateIssued);
  incomingObj.issuingAgency && (permit.issuingAgency = incomingObj.issuingAgency);
  incomingObj.legislation && incomingObj.legislation.act && (permit.legislation.act = incomingObj.legislation.act);
  incomingObj.legislation &&
    incomingObj.legislation.regulation &&
    (permit.legislation.regulation = incomingObj.legislation.regulation);
  incomingObj.legislation &&
    incomingObj.legislation.section &&
    (permit.legislation.section = incomingObj.legislation.section);
  incomingObj.legislation &&
    incomingObj.legislation.subSection &&
    (permit.legislation.subSection = incomingObj.legislation.subSection);
  incomingObj.legislation &&
    incomingObj.legislation.paragraph &&
    (permit.legislation.paragraph = incomingObj.legislation.paragraph);
  incomingObj.legislationDescription && (permit.legislationDescription = incomingObj.legislationDescription);
  incomingObj.projectName && (permit.projectName = incomingObj.projectName);
  incomingObj.location && (permit.location = incomingObj.location);
  incomingObj.centroid && (permit.centroid = incomingObj.centroid);
  incomingObj.documents && (permit.documents = incomingObj.documents);

  // set meta
  permit.addedBy = args.swagger.params.auth_payload.displayName;
  permit.dateAdded = new Date();

  // set data source references
  incomingObj.sourceDateAdded && (permit.sourceDateAdded = incomingObj.sourceDateAdded);
  incomingObj.sourceDateUpdated && (permit.sourceDateUpdated = incomingObj.sourceDateUpdated);
  incomingObj.sourceSystemRef && (permit.sourceSystemRef = incomingObj.sourceSystemRef);

  return await permit.save();
};

/**
 * Performs all operations necessary to create a LNG Permit record.
 *
 * Example of incomingObj
 *
 *  permits: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'permit',
 *      ...
 *      PermitLNG: {
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
 * @returns created lng permit record
 */
exports.createLNG = async function (args, res, next, incomingObj) {
  let PermitLNG = mongoose.model('PermitLNG');
  let permitLNG = new PermitLNG();

  permitLNG._schemaName = 'PermitLNG';

  // set integration references
  incomingObj._epicProjectId &&
    ObjectId.isValid(incomingObj._epicProjectId) &&
    (permitLNG._epicProjectId = new ObjectId(incomingObj._epicProjectId));
  incomingObj._sourceRefId &&
    ObjectId.isValid(incomingObj._sourceRefId) &&
    (permitLNG._sourceRefId = new ObjectId(incomingObj._sourceRefId));
  incomingObj._epicMilestoneId &&
    ObjectId.isValid(incomingObj._epicMilestoneId) &&
    (permitLNG._epicMilestoneId = new ObjectId(incomingObj._epicMilestoneId));

  // set permissions and meta
  permitLNG.read = ['sysadmin'];
  permitLNG.write = ['sysadmin'];

  // If incoming object has addRole: 'public' then read will look like ['sysadmin', 'public']
  if (incomingObj.addRole && incomingObj.addRole === 'public') {
    permitLNG.read.push('public');
    permitLNG.datePublished = new Date();
    permitLNG.publishedBy = args.swagger.params.auth_payload.displayName;
  }

  permitLNG.addedBy = args.swagger.params.auth_payload.displayName;
  permitLNG.dateAdded = new Date();

  // set master data
  incomingObj.recordName && (permitLNG.recordName = incomingObj.recordName);
  permitLNG.recordType = 'Permit';
  incomingObj.recordSubtype && (permitLNG.recordSubtype = incomingObj.recordSubtype);
  incomingObj.dateIssued && (permitLNG.dateIssued = incomingObj.dateIssued);
  incomingObj.issuingAgency && (permitLNG.issuingAgency = incomingObj.issuingAgency);
  incomingObj.legislation && incomingObj.legislation.act && (permitLNG.legislation.act = incomingObj.legislation.act);
  incomingObj.legislation &&
    incomingObj.legislation.regulation &&
    (permitLNG.legislation.regulation = incomingObj.legislation.regulation);
  incomingObj.legislation &&
    incomingObj.legislation.section &&
    (permitLNG.legislation.section = incomingObj.legislation.section);
  incomingObj.legislation &&
    incomingObj.legislation.subSection &&
    (permitLNG.legislation.subSection = incomingObj.legislation.subSection);
  incomingObj.legislation &&
    incomingObj.legislation.paragraph &&
    (permitLNG.legislation.paragraph = incomingObj.legislation.paragraph);
  incomingObj.legislationDescription && (permitLNG.legislationDescription = incomingObj.legislationDescription);
  incomingObj.projectName && (permitLNG.projectName = incomingObj.projectName);
  incomingObj.location && (permitLNG.location = incomingObj.location);
  incomingObj.centroid && (permitLNG.centroid = incomingObj.centroid);
  incomingObj.documents && (permitLNG.documents = incomingObj.documents);

  // set flavour data
  incomingObj.description && (permitLNG.description = incomingObj.description);

  // set data source references
  incomingObj.sourceDateAdded && (permitLNG.sourceDateAdded = incomingObj.sourceDateAdded);
  incomingObj.sourceDateUpdated && (permitLNG.sourceDateUpdated = incomingObj.sourceDateUpdated);
  incomingObj.sourceSystemRef && (permitLNG.sourceSystemRef = incomingObj.sourceSystemRef);

  return await permitLNG.save();
};
