const mongoose = require('mongoose');
const ObjectID = require('mongodb').ObjectID;
const PutUtils = require('../../utils/put-utils');
const AnnualReportPost = require('../post/annual-report');

/**
 * Performs all operations necessary to edit a master AnnualReport record and its associated flavour records.
 *
 * Example of incomingObj
 *
 *  AnnualReports: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'AnnualReport',
 *      ...
 *      AnnualReportBCMI: {
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
    AnnualReportBCMI: this.editBCMI
  }
  return await PutUtils.editRecordWithFlavours(args, res, next, incomingObj, this.editMaster, AnnualReportPost, 'AnnualReport', flavourFunctions, overridePutParams);
};


/**
 * Performs all operations necessary to edit a master AnnualReport record.
 *
 * Example of incomingObj
 *
 *  AnnualReports: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'AnnualReport',
 *      ...
 *      AnnualReportBCMI: {
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
 * @returns edited master AnnualReport record
 */
exports.editMaster = function (args, res, next, incomingObj, flavourIds) {
  delete incomingObj._id;

  // Reject any changes to master permissions
  delete incomingObj.read;
  delete incomingObj.write;

  const AnnualReport = mongoose.model('AnnualReport');

  const sanitizedObj = PutUtils.validateObjectAgainstModel(AnnualReport, incomingObj);

  if (!sanitizedObj || sanitizedObj === {}) {
    // skip, as there are no changes to master record
    return;
  }

  sanitizedObj.dateUpdated = new Date();
  sanitizedObj.updatedBy = args.swagger.params.auth_payload.displayName;

  const dotNotatedObj = PutUtils.getDotNotation(sanitizedObj);

  const updateObj = { $set: dotNotatedObj };

  if (flavourIds && flavourIds.length) {
    updateObj.$addToSet = { _flavourRecords: flavourIds.map(id => new ObjectID(id)) };
  }

  return updateObj;
};

/**
 * Performs all operations necessary to edit a bcmi AnnualReport record.
 *
 * Example of incomingObj
 *
 *  AnnualReports: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'AnnualReport',
 *      ...
 *      AnnualReportBCMI: {
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
 * @returns edited bcmi AnnualReport record
 */
exports.editBCMI = function (args, res, next, incomingObj) {
  delete incomingObj._id;

  // Reject any changes to permissions
  // Publishing must be done via addRole or removeRole
  delete incomingObj.read;
  delete incomingObj.write;

  let AnnualReportBCMI = mongoose.model('AnnualReportBCMI');

  const sanitizedObj = PutUtils.validateObjectAgainstModel(AnnualReportBCMI, incomingObj);

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
