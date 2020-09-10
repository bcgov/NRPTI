const Get = require('../controllers/get/get');
const Put = require('../controllers/put/put');
const Post = require('../controllers/post/post');
const Delete = require('../controllers/delete/delete');
const queryActions = require('../utils/query-actions');
const defaultLog = require('../utils/logger')('record');
const utils = require('../utils/constants/misc');
const mongoose = require('mongoose');
const ObjectID = require('mongodb').ObjectID;

exports.protectedOptions = function (args, res, next) {
  res.status(200).send();
};

exports.protectedGet = async function (args, res, next) {
  let newsId = null;
  if (args.swagger.params.newsId && args.swagger.params.newsId.value) {
    newsId = args.swagger.params.newsId.value
  } else {
    defaultLog.info(`protectedGet - you must provide an id to get`);
    queryActions.sendResponse(res, 400, {});
    next();
  }

  let obj = null;
  try {
    obj = await Get.getById(newsId);
  } catch (error) {
    defaultLog.info(`protectedGet - error getting news: ${newsId}`);
    defaultLog.debug(error);
    return queryActions.sendResponse(res, 400, {});
  }

  queryActions.sendResponse(res, 200, obj);
  next();
}

exports.protectedPut = async function (args, res, next) {
  let newsId = null;
  if (args.swagger.params.newsId && args.swagger.params.newsId.value) {
    newsId = args.swagger.params.newsId.value
  } else {
    defaultLog.info(`protectedPut - you must provide an id to update`);
    queryActions.sendResponse(res, 400, {});
    next();
  }
  let incomingObj = {};
  if (args.swagger.params.news && args.swagger.params.news.value) {
    incomingObj = args.swagger.params.news.value
  } else {
    defaultLog.info(`protectedPut - you must provide an object`);
    queryActions.sendResponse(res, 400, {});
    next();
  }

  let news = {
    $set: {
      projectName: incomingObj.projectName,
      description: incomingObj.description,
      url: incomingObj.url,
      title: incomingObj.title,
      _epicProjectId: new ObjectID(incomingObj._epicProjectId),
      type: incomingObj.type,
      date: new Date(incomingObj.date)
    }
  };

  let obj = null;
  try {
    obj = await Put.updateById(newsId, news);
  } catch (error) {
    defaultLog.info(`protectedPut - error updating news: ${newsId}`);
    defaultLog.debug(error);
    console.log(news);
    console.log(error);
    return queryActions.sendResponse(res, 400, error);
  }

  queryActions.sendResponse(res, 200, obj);
  next();
}

exports.protectedPost = async function (args, res, next) {
  let incomingObj = {};
  if (args.swagger.params.news && args.swagger.params.news.value) {
    incomingObj = args.swagger.params.news.value
  } else {
    defaultLog.info(`protectedPost - you must provide an id to post`);
    queryActions.sendResponse(res, 400, {});
    next();
  }

  const ActivityLNG = mongoose.model('ActivityLNG');
  let news = new ActivityLNG();
  news._schemaName = 'ActivityLNG';

  incomingObj._epicProjectId &&
    ObjectID.isValid(incomingObj._epicProjectId) &&
    (news._epicProjectId = new ObjectID(incomingObj._epicProjectId));

  incomingObj.description && (news.description = incomingObj.description);
  incomingObj.projectName && (news.projectName = incomingObj.projectName);
  incomingObj.type && (news.type = incomingObj.type);
  incomingObj.type && (news.type = incomingObj.type);
  incomingObj.url && (news.url = incomingObj.url);
  incomingObj.date && (news.date = incomingObj.date);
  news.read = [...utils.ApplicationAdminRoles, 'public'];
  news.write = utils.ApplicationAdminRoles;

  let obj = null;
  try {
    obj = await Post.insert(news);
  } catch (error) {
    defaultLog.info(`protectedPost - error inserting news: ${news}`);
    defaultLog.debug(error);
    return queryActions.sendResponse(res, 400, {});
  }

  queryActions.sendResponse(res, 200, obj);
  next();
}

exports.protectedDelete = async function (args, res, next) {
  let newsId = null;
  if (args.swagger.params.newsId && args.swagger.params.newsId.value) {
    newsId = args.swagger.params.newsId.value
  } else {
    defaultLog.info(`protectedDelete - you must provide an id to delete`);
    queryActions.sendResponse(res, 400, {});
    next();
  }

  let obj = null;
  try {
    obj = await Delete.deleteById(newsId);
  } catch (error) {
    defaultLog.info(`protectedDelete - error deleting news: ${newsId}`);
    defaultLog.debug(error);
    return queryActions.sendResponse(res, 400, {});
  }

  queryActions.sendResponse(res, 200, obj);
  next();
}