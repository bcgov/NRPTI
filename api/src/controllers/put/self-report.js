const mongoose = require('mongoose');
const ObjectID = require('mongodb').ObjectID;
const PutUtils = require('../../utils/put-utils');
const SelfReportPost = require('../post/self-report');

/**
 * Performs all operations necessary to edit a master Self Report record and its associated flavour records.
 *
 * Example of incomingObj
 *
 *  selfReports: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'selfReport',
 *      ...
 *      SelfReportLNG: {
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
exports.editRecord = async function(args, res, next, incomingObj) {
  // save flavour records
  let observables = [];
  let savedFlavourSelfReports = [];
  let flavourIds = [];

  try {
    // make a copy of the incoming object for use by the flavours only
    const flavourIncomingObj = { ...incomingObj };
    // Remove fields that should not be inherited from the master record
    delete flavourIncomingObj._id;
    delete flavourIncomingObj._schemaName;
    delete flavourIncomingObj._flavourRecords;
    delete flavourIncomingObj.read;
    delete flavourIncomingObj.write;

    if (incomingObj.SelfReportLNG) {
      if (incomingObj.SelfReportLNG._id) {
        observables.push(this.editLNG(args, res, next, { ...flavourIncomingObj, ...incomingObj.SelfReportLNG }));
      } else {
        const masterRecord = await PutUtils.fetchMasterForCreateFlavour('SelfReport', incomingObj._id);

        observables.push(
          SelfReportPost.createLNG(args, res, next, {
            ...masterRecord,
            ...flavourIncomingObj,
            ...incomingObj.SelfReportLNG
          })
        );
      }

      delete incomingObj.SelfReportLNG;
    }

    if (observables.length > 0) {
      savedFlavourSelfReports = await Promise.all(observables);

      flavourIds = savedFlavourSelfReports.map(flavourSelfReport => flavourSelfReport._id);
    }
  } catch (e) {
    return {
      status: 'failure',
      object: savedFlavourSelfReports,
      errorMessage: e.message
    };
  }

  // save selfReport record
  let savedSelfReport = null;

  try {
    savedSelfReport = await this.editMaster(args, res, next, incomingObj, flavourIds);

    return {
      status: 'success',
      object: savedSelfReport,
      flavours: savedFlavourSelfReports
    };
  } catch (e) {
    return {
      status: 'failure',
      object: savedSelfReport,
      errorMessage: e.message
    };
  }
};

/**
 * Performs all operations necessary to edit a master Self Report record.
 *
 * Example of incomingObj
 *
 *  selfReports: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'selfReport',
 *      ...
 *      SelfReportLNG: {
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
 * @returns edited master selfReport record
 */
exports.editMaster = async function(args, res, next, incomingObj, flavourIds) {
  if (!incomingObj || !incomingObj._id) {
    // skip, as there is no way to update the master record
    return;
  }

  const _id = incomingObj._id;
  delete incomingObj._id;

  // Reject any changes to master permissions
  delete incomingObj.read;
  delete incomingObj.write;

  const SelfReport = mongoose.model('SelfReport');

  const sanitizedObj = PutUtils.validateObjectAgainstModel(SelfReport, incomingObj);

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

  return await SelfReport.findOneAndUpdate({ _schemaName: 'SelfReport', _id: _id }, updateObj, { new: true });
};

/**
 * Performs all operations necessary to edit a lng Self Report record.
 *
 * Example of incomingObj
 *
 *  selfReports: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'selfReport',
 *      ...
 *      SelfReportLNG: {
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
 * @returns edited lng selfReport record
 */
exports.editLNG = async function(args, res, next, incomingObj) {
  if (!incomingObj || !incomingObj._id) {
    // skip, as there is no way to update the lng record
    return;
  }

  const _id = incomingObj._id;
  delete incomingObj._id;

  // Reject any changes to permissions
  // Publishing must be done via addRole or removeRole
  delete incomingObj.read;
  delete incomingObj.write;

  let SelfReportLNG = mongoose.model('SelfReportLNG');

  const sanitizedObj = PutUtils.validateObjectAgainstModel(SelfReportLNG, incomingObj);

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

  return await SelfReportLNG.findOneAndUpdate({ _schemaName: 'SelfReportLNG', _id: _id }, updateObj, { new: true });
};
