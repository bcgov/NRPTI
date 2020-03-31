const mongoose = require('mongoose');
const ObjectID = require('mongodb').ObjectID;
const PutUtils = require('../../utils/put-utils');
const AgreementPost = require('../post/agreement');

/**
 * Performs all operations necessary to edit a master Agreement record and its associated flavour records.
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
exports.editRecord = async function(args, res, next, incomingObj) {
  // save flavour records
  let observables = [];
  let savedFlavourAgreements = [];
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

    if (incomingObj.AgreementLNG) {
      if (incomingObj.AgreementLNG._id) {
        observables.push(this.editLNG(args, res, next, { ...flavourIncomingObj, ...incomingObj.AgreementLNG }));
      } else {
        const masterRecord = await PutUtils.fetchMasterForCreateFlavour('Agreement', incomingObj._id);

        observables.push(
          AgreementPost.createLNG(args, res, next, {
            ...masterRecord,
            ...flavourIncomingObj,
            ...incomingObj.AgreementLNG
          })
        );
      }

      delete incomingObj.AgreementLNG;
    }

    if (observables.length > 0) {
      savedFlavourAgreements = await Promise.all(observables);

      flavourIds = savedFlavourAgreements.map(flavourAgreement => flavourAgreement._id);
    }
  } catch (e) {
    return {
      status: 'failure',
      object: savedFlavourAgreements,
      errorMessage: e.message
    };
  }

  // save agreement record
  let savedAgreement = null;

  try {
    savedAgreement = await this.editMaster(args, res, next, incomingObj, flavourIds);

    return {
      status: 'success',
      object: savedAgreement,
      flavours: savedFlavourAgreements
    };
  } catch (e) {
    return {
      status: 'failure',
      object: savedAgreement,
      errorMessage: e.message
    };
  }
};

/**
 * Performs all operations necessary to edit a master Agreement record.
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
 * @returns edited master agreement record
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

  const Agreement = mongoose.model('Agreement');

  const sanitizedObj = PutUtils.validateObjectAgainstModel(Agreement, incomingObj);

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

  return await Agreement.findOneAndUpdate({ _schemaName: 'Agreement', _id: _id }, updateObj, { new: true });
};

/**
 * Performs all operations necessary to edit a lng Agreement record.
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
 * @returns edited lng agreement record
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

  let AgreementLNG = mongoose.model('AgreementLNG');

  const sanitizedObj = PutUtils.validateObjectAgainstModel(AgreementLNG, incomingObj);

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

  return await AgreementLNG.findOneAndUpdate({ _schemaName: 'AgreementLNG', _id: _id }, updateObj, { new: true });
};
