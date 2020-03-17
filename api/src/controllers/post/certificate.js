let mongoose = require('mongoose');
let ObjectId = require('mongoose').Types.ObjectId;

/**
 * Performs all operations necessary to create a master Certificate record and its associated flavour records.
 *
 * Example of incomingObj
 *
 *  certificates: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'certificate',
 *      ...
 *      CertificateLNG: {
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
exports.createRecord = async function(args, res, next, incomingObj) {
  // save flavour records
  let observables = [];
  let savedFlavourCertificates = [];
  let flavourIds = [];

  try {
    incomingObj.CertificateLNG &&
      observables.push(this.createLNG(args, res, next, { ...incomingObj, ...incomingObj.CertificateLNG }));

    if (observables.length > 0) {
      savedFlavourCertificates = await Promise.all(observables);

      flavourIds = savedFlavourCertificates.map(flavourCertificate => flavourCertificate._id);
    }
  } catch (e) {
    return {
      status: 'failure',
      object: savedFlavourCertificates,
      errorMessage: e
    };
  }

  // save certificate record
  let savedCertificate = null;

  try {
    savedCertificate = await this.createMaster(args, res, next, incomingObj, flavourIds);

    return {
      status: 'success',
      object: savedCertificate,
      flavours: savedFlavourCertificates
    };
  } catch (e) {
    return {
      status: 'failure',
      object: savedCertificate,
      errorMessage: e
    };
  }
};

/**
 * Performs all operations necessary to create a master Certificate record.
 *
 * Example of incomingObj
 *
 *  certificates: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'certificate',
 *      ...
 *      CertificateLNG: {
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
 * @returns created master certificate record
 */
exports.createMaster = async function(args, res, next, incomingObj, flavourIds) {
  let Certificate = mongoose.model('Certificate');
  let certificate = new Certificate();

  certificate._schemaName = 'Certificate';

  // set integration references
  incomingObj._epicProjectId &&
    ObjectId.isValid(incomingObj._epicProjectId) &&
    (certificate._epicProjectId = new ObjectId(incomingObj._epicProjectId));
  incomingObj._sourceRefId &&
    ObjectId.isValid(incomingObj._sourceRefId) &&
    (certificate._sourceRefId = new ObjectId(incomingObj._sourceRefId));
  incomingObj._epicMilestoneId &&
    ObjectId.isValid(incomingObj._epicMilestoneId) &&
    (certificate._epicMilestoneId = new ObjectId(incomingObj._epicMilestoneId));

  // set permissions
  certificate.read = ['sysadmin'];
  certificate.write = ['sysadmin'];

  // set forward references
  if (flavourIds && flavourIds.length) {
    flavourIds.forEach(id => {
      if (ObjectId.isValid(id)) {
        certificate._flavourRecords.push(new ObjectId(id));
      }
    });
  }

  // set data
  incomingObj.recordName && (certificate.recordName = incomingObj.recordName);
  certificate.recordType = 'Certificate';
  incomingObj.recordSubtype && (certificate.recordSubtype = incomingObj.recordSubtype);
  incomingObj.dateIssued && (certificate.dateIssued = incomingObj.dateIssued);
  incomingObj.issuingAgency && (certificate.issuingAgency = incomingObj.issuingAgency);
  incomingObj.legislation && incomingObj.legislation.act && (certificate.legislation.act = incomingObj.legislation.act);
  incomingObj.legislation &&
    incomingObj.legislation.regulation &&
    (certificate.legislation.regulation = incomingObj.legislation.regulation);
  incomingObj.legislation &&
    incomingObj.legislation.section &&
    (certificate.legislation.section = incomingObj.legislation.section);
  incomingObj.legislation &&
    incomingObj.legislation.subSection &&
    (certificate.legislation.subSection = incomingObj.legislation.subSection);
  incomingObj.legislation &&
    incomingObj.legislation.paragraph &&
    (certificate.legislation.paragraph = incomingObj.legislation.paragraph);
  incomingObj.projectName && (certificate.projectName = incomingObj.projectName);
  incomingObj.location && (certificate.location = incomingObj.location);
  incomingObj.centroid && (certificate.centroid = incomingObj.centroid);

  // set meta
  certificate.addedBy = args.swagger.params.auth_payload.displayName;
  certificate.dateAdded = new Date();

  // set data source references
  incomingObj.sourceDateAdded && (certificate.sourceDateAdded = incomingObj.sourceDateAdded);
  incomingObj.sourceDateUpdated && (certificate.sourceDateUpdated = incomingObj.sourceDateUpdated);
  incomingObj.sourceSystemRef && (certificate.sourceSystemRef = incomingObj.sourceSystemRef);

  return await certificate.save();
};

/**
 * Performs all operations necessary to create a LNG Certificate record.
 *
 * Example of incomingObj
 *
 *  certificates: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'certificate',
 *      ...
 *      CertificateLNG: {
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
 * @returns created lng certificate record
 */
exports.createLNG = async function(args, res, next, incomingObj) {
  let CertificateLNG = mongoose.model('CertificateLNG');
  let certificateLNG = new CertificateLNG();

  certificateLNG._schemaName = 'CertificateLNG';

  // set integration references
  incomingObj._epicProjectId &&
    ObjectId.isValid(incomingObj._epicProjectId) &&
    (certificateLNG._epicProjectId = new ObjectId(incomingObj._epicProjectId));
  incomingObj._sourceRefId &&
    ObjectId.isValid(incomingObj._sourceRefId) &&
    (certificateLNG._sourceRefId = new ObjectId(incomingObj._sourceRefId));
  incomingObj._epicMilestoneId &&
    ObjectId.isValid(incomingObj._epicMilestoneId) &&
    (certificateLNG._epicMilestoneId = new ObjectId(incomingObj._epicMilestoneId));

  // set permissions and meta
  certificateLNG.read = ['sysadmin'];
  certificateLNG.write = ['sysadmin'];

  // If incoming object has addRole: 'public' then read will look like ['sysadmin', 'public']
  if (incomingObj.addRole && incomingObj.addRole === 'public') {
    certificateLNG.read.push('public');
    certificateLNG.datePublished = new Date();
    certificateLNG.publishedBy = args.swagger.params.auth_payload.displayName;
  }

  certificateLNG.addedBy = args.swagger.params.auth_payload.displayName;
  certificateLNG.dateAdded = new Date();

  // set master data
  incomingObj.recordName && (certificateLNG.recordName = incomingObj.recordName);
  certificateLNG.recordType = 'Certificate';
  incomingObj.recordSubtype && (certificateLNG.recordSubtype = incomingObj.recordSubtype);
  incomingObj.dateIssued && (certificateLNG.dateIssued = incomingObj.dateIssued);
  incomingObj.issuingAgency && (certificateLNG.issuingAgency = incomingObj.issuingAgency);
  incomingObj.legislation &&
    incomingObj.legislation.act &&
    (certificateLNG.legislation.act = incomingObj.legislation.act);
  incomingObj.legislation &&
    incomingObj.legislation.regulation &&
    (certificateLNG.legislation.regulation = incomingObj.legislation.regulation);
  incomingObj.legislation &&
    incomingObj.legislation.section &&
    (certificateLNG.legislation.section = incomingObj.legislation.section);
  incomingObj.legislation &&
    incomingObj.legislation.subSection &&
    (certificateLNG.legislation.subSection = incomingObj.legislation.subSection);
  incomingObj.legislation &&
    incomingObj.legislation.paragraph &&
    (certificateLNG.legislation.paragraph = incomingObj.legislation.paragraph);
  incomingObj.projectName && (certificateLNG.projectName = incomingObj.projectName);
  incomingObj.location && (certificateLNG.location = incomingObj.location);
  incomingObj.centroid && (certificateLNG.centroid = incomingObj.centroid);

  // set flavour data
  incomingObj.description && (certificateLNG.description = incomingObj.description);

  // set data source references
  incomingObj.sourceDateAdded && (certificateLNG.sourceDateAdded = incomingObj.sourceDateAdded);
  incomingObj.sourceDateUpdated && (certificateLNG.sourceDateUpdated = incomingObj.sourceDateUpdated);
  incomingObj.sourceSystemRef && (certificateLNG.sourceSystemRef = incomingObj.sourceSystemRef);

  return await certificateLNG.save();
};
