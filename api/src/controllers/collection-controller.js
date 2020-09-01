const Get = require('../controllers/get/get');
const Put = require('../controllers/put/put');
const Post = require('../controllers/post/post');
const Delete = require('../controllers/delete/delete');
const queryActions = require('../utils/query-actions');
const defaultLog = require('../utils/logger')('record');

exports.protectedOptions = function (args, res, next) {
  res.status(200).send();
};

exports.protectedGet = async function (args, res, next) {
  let collectionId = null;
  if (args.swagger.params.collectionId && args.swagger.params.collectionId.value) {
    collectionId = args.swagger.params.collectionId.value
  } else {
    defaultLog.info(`protectedGet - you must provide an id to get`);
    queryActions.sendResponse(res, 400, {});
    next();
  }

  try {
    await Get.getById(collectionId);
  } catch (error) {
    defaultLog.info(`protectedDelete - error getting collection: ${collectionId}`);
    defaultLog.debug(error);
    return queryActions.sendResponse(res, 400, {});
  }

  queryActions.sendResponse(res, 200, {});
  next();
}


exports.protectedPut = async function (args, res, next) {
  let collectionId = null;
  if (args.swagger.params.collectionId && args.swagger.params.collectionId.value) {
    collectionId = args.swagger.params.collectionId.value
  } else {
    defaultLog.info(`protectedPut - you must provide an id to update`);
    queryActions.sendResponse(res, 400, {});
    next();
  }
  let collection = null;
  if (args.swagger.params.collection && args.swagger.params.collection.value) {
    collection = args.swagger.params.collection.value
  } else {
    defaultLog.info(`protectedPut - you must provide an object`);
    queryActions.sendResponse(res, 400, {});
    next();
  }

  try {
    await Put.updateById(collectionId, collection);
  } catch (error) {
    defaultLog.info(`protectedPut - error updating collection: ${collectionId}`);
    defaultLog.debug(error);
    return queryActions.sendResponse(res, 400, {});
  }

  queryActions.sendResponse(res, 200, {});
  next();
}

exports.protectedPost = async function (args, res, next) {
  let collection = null;
  if (args.swagger.params.collection && args.swagger.params.collection.value) {
    collection = args.swagger.params.collection.value
  } else {
    defaultLog.info(`protectedPost - you must provide an id to post`);
    queryActions.sendResponse(res, 400, {});
    next();
  }
  collection['_schemaName'] = 'CollectionBCMI';

  try {
    await Post.insert(collection);
  } catch (error) {
    defaultLog.info(`protectedPost - error inserting collection: ${collection}`);
    defaultLog.debug(error);
    return queryActions.sendResponse(res, 400, {});
  }

  queryActions.sendResponse(res, 200, {});
  next();
}


exports.protectedDelete = async function (args, res, next) {
  let collectionId = null;
  if (args.swagger.params.collectionId && args.swagger.params.collectionId.value) {
    collectionId = args.swagger.params.collectionId.value
  } else {
    defaultLog.info(`protectedDelete - you must provide an id to delete`);
    queryActions.sendResponse(res, 400, {});
    next();
  }

  try {
    await Delete.deleteById(collectionId);
  } catch (error) {
    defaultLog.info(`protectedDelete - error deleting collection: ${collectionId}`);
    defaultLog.debug(error);
    return queryActions.sendResponse(res, 400, {});
  }

  queryActions.sendResponse(res, 200, {});
  next();
}