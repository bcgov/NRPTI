const Get = require('./get/get');
const Delete = require('./delete/delete');
const queryActions = require('../utils/query-actions');
const queryUtils = require('../utils/query-utils');
const defaultLog = require('../utils/logger')('record');
const PutUtils = require('../utils/put-utils');
const utils = require('../utils/constants/misc');
const mongoose = require('mongoose');
const CollectionController = require('./collection-controller');

exports.protectedOptions = function(args, res, next) {
  res.status(200).send();
};

exports.protectedGet = async function(args, res, next) {
  let mineId = null;
  if (args.swagger.params.mineId && args.swagger.params.mineId.value) {
    mineId = args.swagger.params.mineId.value;
  } else {
    defaultLog.info(`protectedGet - you must provide an id to get`);
    queryActions.sendResponse(res, 400, {});
    next();
  }

  let obj = null;
  try {
    obj = await Get.getById(mineId);
  } catch (error) {
    defaultLog.info(`protectedGet - error getting mine: ${mineId}`);
    defaultLog.debug(error);
    return queryActions.sendResponse(res, 400, {});
  }

  queryActions.sendResponse(res, 200, obj);
  next();
};

exports.protectedPut = async function(args, res, next) {
  let incomingObj = {};
  if (args.swagger.params.mine && args.swagger.params.mine.value) {
    incomingObj = args.swagger.params.mine.value;
  } else {
    defaultLog.info(`protectedPost - you must provide mine data to put`);
    if (res) {
      queryActions.sendResponse(res, 400, {});
      next();
    } else {
      throw 'protectedPost - you must provide mine data to put';
    }
  }

  let masterId = null;
  if (args.swagger.params.mineId && args.swagger.params.mineId.value) {
    masterId = args.swagger.params.mineId.value;
  } else {
    defaultLog.info(`protectedPost - you must provide mineId to put`);
    if (res) {
      queryActions.sendResponse(res, 400, {});
      next();
    } else {
      throw 'protectedPost - you must provide mineId to put';
    }
  }

  delete incomingObj._id;
  // Reject any changes to permissions
  // Publishing must be done via addRole or removeRole
  delete incomingObj.read;
  delete incomingObj.write;

  const MineBCMI = mongoose.model('MineBCMI');

  const sanitizedObj = PutUtils.validateObjectAgainstModel(MineBCMI, incomingObj);

  if (!sanitizedObj || Object.keys(sanitizedObj).length === 0) {
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
    try {
      await CollectionController.publishCollections(masterId, args.swagger.params.auth_payload);
    } catch (error) {
      defaultLog.info(`protectedPut - error publishing associated collections: ${updateObj}`);
      defaultLog.debug(error);
    }
  } else if (incomingObj.removeRole && incomingObj.removeRole === 'public') {
    updateObj.$pull['read'] = 'public';
    updateObj.$set['datePublished'] = null;
    updateObj.$set['publishedBy'] = '';
    try {
      await CollectionController.unpublishCollections(masterId, args.swagger.params.auth_payload);
    } catch (error) {
      defaultLog.info(`protectedPut - error unpublishing associated collections: ${updateObj}`);
      defaultLog.debug(error);
    }
  }

  let obj = null;
  try {
    obj = await MineBCMI.findOneAndUpdate(
      {
        _id: masterId,
        write: { $in: args.swagger.params.auth_payload.client_roles }
      },
      updateObj,
      { new: true }
    );
  } catch (error) {
    defaultLog.info(`protectedPut - error inserting mine: ${updateObj}`);
    defaultLog.debug(error);
    if (res) {
      return queryActions.sendResponse(res, 400, {});
    } else {
      throw `protectedPut - error inserting mine: ${updateObj}`;
    }
  }
  if (res) {
    queryActions.sendResponse(res, 200, obj);
    next();
  } else {
    return obj;
  }
};

exports.protectedPost = async function(args, res, next) {
  let incomingObj = {};
  if (args.swagger.params.mine && args.swagger.params.mine.value) {
    incomingObj = args.swagger.params.mine.value;
  } else {
    defaultLog.info(`protectedPost - you must provide data to post`);
    if (res) {
      queryActions.sendResponse(res, 400, {});
      next();
    } else {
      throw 'protectedPost - you must provide data to post';
    }
  }

  let MineBCMI = mongoose.model('MineBCMI');
  let mine = new MineBCMI();

  mine._schemaName = 'MineBCMI';

  // set permissions
  mine.read = utils.ApplicationAdminRoles;
  mine.write = utils.ApplicationAdminRoles;

  // set data
  incomingObj.name && (mine.name = incomingObj.name);
  incomingObj.permitNumber && (mine.permitNumber = incomingObj.permitNumber);
  incomingObj.status && (mine.status = incomingObj.status);
  incomingObj.commodities.length && (mine.commodities = incomingObj.commodities);
  incomingObj.region && (mine.region = incomingObj.region);
  incomingObj.location && (mine.location = incomingObj.location);
  incomingObj.permittee && (mine.permittee = incomingObj.permittee);
  incomingObj.type && (mine.type = incomingObj.type);
  incomingObj.summary && (mine.summary = incomingObj.summary);
  incomingObj.description && (mine.description = incomingObj.description);
  incomingObj.links && incomingObj.links.length && (mine.links = incomingObj.links);

  // Not checking value as it could be 0 which would fail the falsey check.
  mine.tailingImpoundments = incomingObj.tailingImpoundments;

  // Set meta. If the args exist then use the auth otherwise check the incoming object. This occurs if
  // the system is creating the record.
  mine.addedBy = (args && args.swagger.params.auth_payload.displayName) || incomingObj.addedBy;
  mine.updatedBy = (args && args.swagger.params.auth_payload.displayName) || incomingObj.updatedBy;
  mine.dateAdded = new Date();
  mine.dateUpdated = new Date();

  // set data source reference
  incomingObj.sourceSystemRef && (mine.sourceSystemRef = incomingObj.sourceSystemRef);
  incomingObj._sourceRefId && (mine._sourceRefId = incomingObj._sourceRefId);

  let obj = null;
  try {
    obj = await mine.save();
  } catch (error) {
    defaultLog.info(`protectedPost - error inserting mine: ${mine}`);
    defaultLog.debug(error);
    if (res) {
      return queryActions.sendResponse(res, 400, {});
    } else {
      throw `protectedPut - error inserting mine: ${mine}`;
    }
  }
  if (next) {
    queryActions.sendResponse(res, 200, obj);
    next();
  } else {
    return obj;
  }
};

exports.protectedDelete = async function(args, res, next) {
  let mineId = null;
  if (args.swagger.params.mineId && args.swagger.params.mineId.value) {
    mineId = args.swagger.params.mineId.value;
  } else {
    defaultLog.info(`protectedDelete - you must provide an id to delete`);
    queryActions.sendResponse(res, 400, {});
    next();
  }

  let obj = null;
  try {
    obj = await Delete.deleteById(mineId);
  } catch (error) {
    defaultLog.info(`protectedDelete - error deleting mine: ${mineId}`);
    defaultLog.debug(error);
    return queryActions.sendResponse(res, 400, {});
  }

  queryActions.sendResponse(res, 200, obj);
  next();
};

exports.protectedPublish = async function(args, res, next) {
  let mineId = null;
  if (args.swagger.params.mineId && args.swagger.params.mineId.value) {
    mineId = args.swagger.params.mineId.value;
  } else {
    defaultLog.info(`protectedPublish - you must provide an id to publish`);
    queryActions.sendResponse(res, 400, {});
    next();
  }
  defaultLog.info(`protectedPublish - mineId: ${mineId}`);

  const MineBCMI = require('mongoose').model('MineBCMI');
  try {
    const mine = await MineBCMI.findOne({ _id: mineId, write: { $in: args.swagger.params.auth_payload.client_roles } });
    const published = await queryActions.publish(mine, args.swagger.params.auth_payload);
    // This should also publish any collections and their documents.
    if (published._schemaName === 'MineBCMI') {
      await CollectionController.publishCollections(published._id, args.swagger.params.auth_payload);
    }
    queryUtils.audit(args, 'Publish', mine, args.swagger.params.auth_payload, mine._id);
    queryActions.sendResponse(res, 200, published);
  } catch (error) {
    queryActions.sendResponse(res, 500, error.message);
  }
  next();
};

exports.protectedUnPublish = async function(args, res, next) {
  let mineId = null;
  if (args.swagger.params.mineId && args.swagger.params.mineId.value) {
    mineId = args.swagger.params.mineId.value;
  } else {
    defaultLog.info(`protectedUnPublish - you must provide an id to unpublish`);
    queryActions.sendResponse(res, 400, {});
    next();
  }
  defaultLog.info(`protectedUnPublish - mineId: ${mineId}`);

  const MineBCMI = require('mongoose').model('MineBCMI');
  try {
    const mine = await MineBCMI.findOne({ _id: mineId, write: { $in: args.swagger.params.auth_payload.client_roles } });
    const unpublished = await queryActions.unPublish(mine, args.swagger.params.auth_payload);
    // This should also unpublish any collections and their documents.
    if (unpublished._schemaName === 'MineBCMI') {
      await CollectionController.unpublishCollections(unpublished._id, args.swagger.params.auth_payload);
    }
    queryUtils.audit(args, 'UnPublish', mine, args.swagger.params.auth_payload, mine._id);
    queryActions.sendResponse(res, 200, unpublished);
  } catch (error) {
    queryActions.sendResponse(res, 500, error.message);
  }
  next();
};
