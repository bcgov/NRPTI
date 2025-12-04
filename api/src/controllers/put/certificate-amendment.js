const mongoose = require('mongoose');
const ObjectID = require('mongodb').ObjectID;
const PutUtils = require('../../utils/put-utils');
const CertificateAmendmentPost = require('../post/certificate-amendment');

/**
 * Performs all operations necessary to edit a master Certificate amendment record and its associated flavour records.
 *
 * Example of incomingObj
 *
 *  certificateAmendments: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'certificateAmendment',
 *      ...
 *      CertificateAmendmentBCMI: {
 *        description: 'bcmi description'
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
exports.editRecord = async function (args, res, next, incomingObj, overridePutParams = null) {
  const flavourFunctions = {
    CertificateAmendmentBCMI: this.editBCMI,
    CertificateAmendmentLNG: this.editLNG
  };
  return await PutUtils.editRecordWithFlavours(
    args,
    res,
    next,
    incomingObj,
    this.editMaster,
    CertificateAmendmentPost,
    'CertificateAmendment',
    flavourFunctions,
    overridePutParams
  );
};

/**
 * Performs all operations necessary to edit a master Certificate Amendment record.
 *
 * Example of incomingObj
 *
 *  certificateAmendments: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'certificate',
 *      ...
 *      CertificateAmendmentBCMI: {
 *        description: 'bcmi description'
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
 * @returns edited master certificate record
 */
exports.editMaster = function (args, res, next, incomingObj, flavourIds) {
  delete incomingObj._id;

  // Reject any changes to master permissions
  delete incomingObj.read;
  delete incomingObj.write;

  const CertificateAmendment = mongoose.model('CertificateAmendment');

  const sanitizedObj = PutUtils.validateObjectAgainstModel(CertificateAmendment, incomingObj);

  if (!sanitizedObj || sanitizedObj === {}) {
    // skip, as there are no changes to master record
    return;
  }

  sanitizedObj.dateUpdated = new Date();
  sanitizedObj.updatedBy = args.swagger.params.auth_payload.displayName;

  const dotNotatedObj = PutUtils.getDotNotation(sanitizedObj);

  const updateObj = { $set: dotNotatedObj };

  if (flavourIds && flavourIds.length) {
    updateObj.$set = { ...updateObj.$set };
    updateObj.$addToSet = { _flavourRecords: flavourIds.map(id => new ObjectID(id)) };
  }

  return updateObj;
};

/**
 * Performs all operations necessary to edit a bcmi Certificate amendment record.
 *
 * Example of incomingObj
 *
 *  certificateAmendments: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'certificateAmendment',
 *      ...
 *      CertificateAmendmentBCMI: {
 *        description: 'bcmi description'
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
 * @returns edited BCMI certificate amendment record
 */
exports.editBCMI = function (args, res, next, incomingObj) {
  delete incomingObj._id;

  // Reject any changes to permissions
  // Publishing must be done via addRole or removeRole
  delete incomingObj.read;
  delete incomingObj.write;

  let CertificateAmendmentBCMI = mongoose.model('CertificateAmendmentBCMI');

  const sanitizedObj = PutUtils.validateObjectAgainstModel(CertificateAmendmentBCMI, incomingObj);

  sanitizedObj.dateUpdated = new Date();

  const dotNotatedObj = PutUtils.getDotNotation(sanitizedObj);

  // If incoming object has addRole: 'public' then read will look like ['sysadmin', 'public']
  const updateObj = { $set: dotNotatedObj, $addToSet: {}, $pull: {} };

  if (incomingObj.addRole && incomingObj.addRole === 'public') {
    updateObj.$addToSet['read'] = 'public';
    updateObj.$set['datePublished'] = new Date();
    updateObj.$set['publishedBy'] = args.swagger.params.auth_payload.displayName;
  } else if (incomingObj.removeRole && incomingObj.removeRole === 'public') {
    updateObj.$pull['read'] = 'public';
    updateObj.$set['datePublished'] = null;
    updateObj.$set['publishedBy'] = '';
  }

  return updateObj;
};

/**
 * Performs all operations necessary to edit a LNG Certificate amendment record.
 *
 * Example of incomingObj
 *
 *  certificateAmendments: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'certificateAmendment',
 *      ...
 *      CertificateAmendmentLNG: {
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
 * @returns edited BCMI certificate amendment record
 */
exports.editLNG = function (args, res, next, incomingObj) {
  delete incomingObj._id;

  // Reject any changes to permissions
  // Publishing must be done via addRole or removeRole
  delete incomingObj.read;
  delete incomingObj.write;

  let CertificateAmendmentLNG = mongoose.model('CertificateAmendmentLNG');

  const sanitizedObj = PutUtils.validateObjectAgainstModel(CertificateAmendmentLNG, incomingObj);

  sanitizedObj.dateUpdated = new Date();

  const dotNotatedObj = PutUtils.getDotNotation(sanitizedObj);

  // If incoming object has addRole: 'public' then read will look like ['sysadmin', 'public']
  const updateObj = { $set: dotNotatedObj, $addToSet: {}, $pull: {} };

  if (incomingObj.addRole && incomingObj.addRole === 'public') {
    updateObj.$addToSet['read'] = 'public';
    updateObj.$set['datePublished'] = new Date();
    updateObj.$set['publishedBy'] = args.swagger.params.auth_payload.displayName;
  } else if (incomingObj.removeRole && incomingObj.removeRole === 'public') {
    updateObj.$pull['read'] = 'public';
    updateObj.$set['datePublished'] = null;
    updateObj.$set['publishedBy'] = '';
  }

  return updateObj;
};
