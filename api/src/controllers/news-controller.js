const Delete = require('../controllers/delete/delete');
let queryActions = require('../utils/query-actions');
let defaultLog = require('../utils/logger')('record');

exports.protectedOptions = function (args, res, next) {
  res.status(200).send();
};

exports.protectedDelete = async function (args, res, next) {
  let newsId = null;
  if (args.swagger.params.newsId || args.swagger.params.newsId.value) {
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