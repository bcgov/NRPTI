const mongoose = require('mongoose');
const MinePost = require('../post/mine-bcmi');
const PutUtils = require('../../utils/put-utils');
const RECORD_TYPE = require('../../utils/constants/record-type-enum');
const collectionController = require('../collection-controller');

/**
 * Performs all operations necessary to edit a master Mine record and any flavours.
 *
 * @param {*} args
 * @param {*} res
 * @param {*} next
 * @param {*} incomingObj
 * @returns object containing the operation's status and created records
 */
exports.editRecord = async function (args, res, next, incomingObj) {
  return await PutUtils.editRecordWithFlavours(
    args,
    res,
    next,
    incomingObj,
    this.editMaster,
    MinePost,
    RECORD_TYPE.MineBCMI._schemaName,
    {}
  );
};

/**
 * Performs all operations necessary to edit a master Mine record.
 *
 * @param {*} args
 * @param {*} res
 * @param {*} next
 * @param {*} incomingObj
 * @returns object
 */
exports.editMaster = async function (args, res, next, incomingObj) {
  const mineId = incomingObj._id;
  delete incomingObj._id;

  // Reject any changes to permissions
  // Publishing must be done via addRole or removeRole
  delete incomingObj.read;
  delete incomingObj.write;

  const MineBCMI = mongoose.model(RECORD_TYPE.MineBCMI._schemaName);

  const sanitizedObj = PutUtils.validateObjectAgainstModel(MineBCMI, incomingObj);

  if (!sanitizedObj || sanitizedObj === {}) {
    // skip, as there are no changes to master record
    return;
  }

  sanitizedObj.dateUpdated = new Date();
  // If there are args it means this is an API request and has a user. If not, this is carried out by the system so
  // use the system user.
  sanitizedObj.updatedBy = args.swagger.params.auth_payload.displayName;

  const dotNotatedObj = PutUtils.getDotNotation(sanitizedObj);

  const updateObj = { $set: dotNotatedObj, $addToSet: {}, $pull: {} };

  if (incomingObj.addRole && incomingObj.addRole === 'public') {
    updateObj.$addToSet['read'] = 'public';
    updateObj.$set['datePublished'] = new Date();
    updateObj.$set['publishedBy'] = args.swagger.params.auth_payload.displayName;
    await collectionController.publishCollections(mineId, args.swagger.params.auth_payload);
  } else if (incomingObj.removeRole && incomingObj.removeRole === 'public') {
    updateObj.$pull['read'] = 'public';
    updateObj.$set['datePublished'] = null;
    updateObj.$set['publishedBy'] = '';
    await collectionController.unpublishCollections(mineId, args.swagger.params.auth_payload);
  }

  return updateObj;
};
