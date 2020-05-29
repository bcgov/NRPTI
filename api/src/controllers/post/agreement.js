const mongoose = require('mongoose');
const ObjectId = require('mongoose').Types.ObjectId;
const mongodb = require('../../utils/mongodb');

/**
 * Performs all operations necessary to create a master Agreement record and its associated flavour records.
 *
 * Example of incomingObj
 *
 *  agreements: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'agreement',
 *      ...
 *      AgreementLNG: {
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
  incomingObj.AgreementLNG &&
    flavours.push(this.createLNG(args, res, next, { ...incomingObj, ...incomingObj.AgreementLNG }));

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
 * Performs all operations necessary to create a master Agreement record.
 *
 * Example of incomingObj
 *
 *  agreements: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'agreement',
 *      ...
 *      AgreementLNG: {
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
 * @returns created master agreement record
 */
exports.createMaster = function (args, res, next, incomingObj, flavourIds) {
  let Agreement = mongoose.model('Agreement');
  let agreement = new Agreement();

  agreement._schemaName = 'Agreement';

  // set integration references
  incomingObj._epicProjectId &&
    ObjectId.isValid(incomingObj._epicProjectId) &&
    (agreement._epicProjectId = new ObjectId(incomingObj._epicProjectId));
  incomingObj._sourceRefId &&
    ObjectId.isValid(incomingObj._sourceRefId) &&
    (agreement._sourceRefId = new ObjectId(incomingObj._sourceRefId));
  incomingObj._epicMilestoneId &&
    ObjectId.isValid(incomingObj._epicMilestoneId) &&
    (agreement._epicMilestoneId = new ObjectId(incomingObj._epicMilestoneId));

  // set permissions
  agreement.read = ['sysadmin'];
  agreement.write = ['sysadmin'];

  // set forward references
  if (flavourIds && flavourIds.length) {
    flavourIds.forEach(id => {
      if (ObjectId.isValid(id)) {
        agreement._flavourRecords.push(new ObjectId(id));
      }
    });
  }

  // set data
  incomingObj.recordName && (agreement.recordName = incomingObj.recordName);
  agreement.recordType = 'Agreement';
  incomingObj.dateIssued && (agreement.dateIssued = incomingObj.dateIssued);
  incomingObj.nationName && (agreement.nationName = incomingObj.nationName);
  incomingObj.projectName && (agreement.projectName = incomingObj.projectName);
  incomingObj.documents && (agreement.documents = incomingObj.documents);

  // set meta
  agreement.addedBy = args.swagger.params.auth_payload.displayName;
  agreement.dateAdded = new Date();

  // set data source references
  incomingObj.sourceDateAdded && (agreement.sourceDateAdded = incomingObj.sourceDateAdded);
  incomingObj.sourceDateUpdated && (agreement.sourceDateUpdated = incomingObj.sourceDateUpdated);
  incomingObj.sourceSystemRef && (agreement.sourceSystemRef = incomingObj.sourceSystemRef);

  return agreement;
};

/**
 * Performs all operations necessary to create a LNG Agreement record.
 *
 * Example of incomingObj
 *
 *  agreements: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'agreement',
 *      ...
 *      AgreementLNG: {
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
 * @returns created lng agreement record
 */
exports.createLNG = function (args, res, next, incomingObj) {
  let AgreementLNG = mongoose.model('AgreementLNG');
  let agreementLNG = new AgreementLNG();

  agreementLNG._schemaName = 'AgreementLNG';

  // set integration references
  incomingObj._epicProjectId &&
    ObjectId.isValid(incomingObj._epicProjectId) &&
    (agreementLNG._epicProjectId = new ObjectId(incomingObj._epicProjectId));
  incomingObj._sourceRefId &&
    ObjectId.isValid(incomingObj._sourceRefId) &&
    (agreementLNG._sourceRefId = new ObjectId(incomingObj._sourceRefId));
  incomingObj._epicMilestoneId &&
    ObjectId.isValid(incomingObj._epicMilestoneId) &&
    (agreementLNG._epicMilestoneId = new ObjectId(incomingObj._epicMilestoneId));

  // set permissions and meta
  agreementLNG.read = ['sysadmin'];
  agreementLNG.write = ['sysadmin'];

  // If incoming object has addRole: 'public' then read will look like ['sysadmin', 'public']
  if (incomingObj.addRole && incomingObj.addRole === 'public') {
    agreementLNG.read.push('public');
    agreementLNG.datePublished = new Date();
    agreementLNG.publishedBy = args.swagger.params.auth_payload.displayName;
  }

  agreementLNG.addedBy = args.swagger.params.auth_payload.displayName;
  agreementLNG.dateAdded = new Date();

  // set master data
  incomingObj.recordName && (agreementLNG.recordName = incomingObj.recordName);
  agreementLNG.recordType = 'Agreement';
  incomingObj.dateIssued && (agreementLNG.dateIssued = incomingObj.dateIssued);
  incomingObj.nationName && (agreementLNG.nationName = incomingObj.nationName);
  incomingObj.projectName && (agreementLNG.projectName = incomingObj.projectName);
  incomingObj.documents && (agreementLNG.documents = incomingObj.documents);

  // set flavour data
  incomingObj.description && (agreementLNG.description = incomingObj.description);

  // set data source references
  incomingObj.sourceDateAdded && (agreementLNG.sourceDateAdded = incomingObj.sourceDateAdded);
  incomingObj.sourceDateUpdated && (agreementLNG.sourceDateUpdated = incomingObj.sourceDateUpdated);
  incomingObj.sourceSystemRef && (agreementLNG.sourceSystemRef = incomingObj.sourceSystemRef);

  return agreementLNG;
};
