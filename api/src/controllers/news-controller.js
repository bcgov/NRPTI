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
  let newsId = null;
  if (args.swagger.params.newsId && args.swagger.params.newsId.value) {
    newsId = args.swagger.params.newsId.value
  } else {
    defaultLog.info(`protectedGet - you must provide an id to get`);
    queryActions.sendResponse(res, 400, {});
    next();
  }

  try {
    await Get.getById(newsId);
  } catch (error) {
    defaultLog.info(`protectedGet - error getting news: ${newsId}`);
    defaultLog.debug(error);
    return queryActions.sendResponse(res, 400, {});
  }

  queryActions.sendResponse(res, 200, {});
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
  let news = null;
  if (args.swagger.params.news && args.swagger.params.news.value) {
    news = args.swagger.params.news.value
  } else {
    defaultLog.info(`protectedPut - you must provide an object`);
    queryActions.sendResponse(res, 400, {});
    next();
  }

  try {
    await Put.updateById(newsId, news);
  } catch (error) {
    defaultLog.info(`protectedPut - error updating news: ${newsId}`);
    defaultLog.debug(error);
    return queryActions.sendResponse(res, 400, {});
  }

  queryActions.sendResponse(res, 200, {});
  next();
}

exports.protectedPost = async function (args, res, next) {
  let news = null;
  if (args.swagger.params.news && args.swagger.params.news.value) {
    news = args.swagger.params.news.value
  } else {
    defaultLog.info(`protectedPost - you must provide an id to post`);
    queryActions.sendResponse(res, 400, {});
    next();
  }
  news['_schemaName'] = 'ActivityLNG';

  try {
    await Post.insert(news);
  } catch (error) {
    defaultLog.info(`protectedPost - error inserting news: ${news}`);
    defaultLog.debug(error);
    return queryActions.sendResponse(res, 400, {});
  }

  queryActions.sendResponse(res, 200, {});
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

  try {
    await Delete.deleteById(newsId);
  } catch (error) {
    defaultLog.info(`protectedDelete - error deleting news: ${newsId}`);
    defaultLog.debug(error);
    return queryActions.sendResponse(res, 400, {});
  }

  queryActions.sendResponse(res, 200, {});
  next();
}