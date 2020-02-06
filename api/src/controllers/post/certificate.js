const mongoose = require('mongoose');
const ObjectId = require('mongoose').Types.ObjectId;
const RECORD_TYPE = require('../../utils/constants/record-type-enum');

/**
 * Create Master Certificate record.
 *
 * Example of incomingObj:
 *
 * certificate: [
 *   {
 *     recordName: 'test abc',
 *     recordType: 'whatever',
 *     ...
 *     CertificateLNG: {
 *       description: 'lng description'
 *       addRole: 'public',
 *     }
 *   },
 *   ...
 * ]
 */
exports.createMaster = async function(args, res, next, incomingObj) {
  const Certificate = mongoose.model(RECORD_TYPE.Certificate._schemaName);
  const certificate = new Certificate();

  certificate._schemaName = RECORD_TYPE.Certificate._schemaName;
  incomingObj._epicProjectId &&
    ObjectId.isValid(incomingObj._epicProjectId) &&
    (certificate._epicProjectId = new ObjectId(incomingObj._epicProjectId));
  incomingObj._sourceRefId &&
    ObjectId.isValid(incomingObj._sourceRefId) &&
    (certificate._sourceRefId = new ObjectId(incomingObj._sourceRefId));
  incomingObj._epicMilestoneId &&
    ObjectId.isValid(incomingObj._epicMilestoneId) &&
    (certificate._epicMilestoneId = new ObjectId(incomingObj._epicMilestoneId));

  incomingObj.recordName && (certificate.recordName = incomingObj.recordName);
  certificate.recordType = RECORD_TYPE.Certificate.displayName;
  incomingObj.dateIssued && (certificate.dateIssued = incomingObj.dateIssued);
  incomingObj.issuingAgency && (certificate.issuingAgency = incomingObj.issuingAgency);
  incomingObj.legislation && (certificate.legislation = incomingObj.legislation);
  incomingObj.issuedTo && (certificate.issuedTo = incomingObj.issuedTo);
  incomingObj.projectName && (certificate.projectName = incomingObj.projectName);
  incomingObj.location && (certificate.location = incomingObj.location);
  incomingObj.centroid && (certificate.centroid = incomingObj.centroid);

  certificate.dateAdded = new Date();
  certificate.publishedBy = args.swagger.params.auth_payload.displayName;

  incomingObj.sourceDateAdded && (certificate.sourceDateAdded = incomingObj.sourceDateAdded);
  incomingObj.sourceDateUpdated && (certificate.sourceDateUpdated = incomingObj.sourceDateUpdated);
  incomingObj.sourceSystemRef && (certificate.sourceSystemRef = incomingObj.sourceSystemRef);

  certificate.read = ['sysadmin'];
  certificate.write = ['sysadmin'];

  let savedCertificate = null;
  try {
    savedCertificate = await certificate.save();
  } catch (error) {
    return {
      status: 'failure',
      object: certificate,
      errorMessage: error.message
    };
  }

  const observables = [];
  incomingObj.CertificateLNG &&
    observables.push(this.createLNG(args, res, next, incomingObj.CertificateLNG, savedCertificate._id));

  let flavourRes = null;
  try {
    observables.length > 0 && (flavourRes = await Promise.all(observables));
  } catch (error) {
    flavourRes = {
      status: 'failure',
      object: observables,
      errorMessage: error.message
    };
  }

  return {
    status: 'success',
    object: savedCertificate,
    flavours: flavourRes
  };
};

/**
 * Create LNG Certificate record.
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

  const CertificateLNG = mongoose.model(`${RECORD_TYPE.Certificate._schemaName}LNG`);
  const inpsectionLNG = new CertificateLNG();

  inpsectionLNG._schemaName = `${RECORD_TYPE.Certificate._schemaName}LNG`;
  inpsectionLNG._master = new ObjectId(masterId);
  inpsectionLNG.read = ['sysadmin'];
  inpsectionLNG.write = ['sysadmin'];
  // If incoming object has addRole: 'public' then read will look like ['sysadmin', 'public']
  incomingObj.addRole &&
    incomingObj.addRole === 'public' &&
    inpsectionLNG.read.push('public') &&
    (inpsectionLNG.datePublished = new Date());

  incomingObj.description && (inpsectionLNG.description = incomingObj.description);

  inpsectionLNG.dateAdded = new Date();

  try {
    const savedCertificateLNG = await inpsectionLNG.save();
    return {
      status: 'success',
      object: savedCertificateLNG
    };
  } catch (error) {
    return {
      status: 'failure',
      object: inpsectionLNG,
      errorMessage: error.message
    };
  }
};
