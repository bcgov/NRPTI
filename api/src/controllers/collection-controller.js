const Delete = require('../controllers/delete/delete');
const queryActions = require('../utils/query-actions');
const defaultLog = require('../utils/logger')('record');

exports.protectedOptions = function (args, res, next) {
  res.status(200).send();
};

exports.protectedDelete = async function (args, res, next) {
  let collectionId = null;
  if (args.swagger.params.collectionId || args.swagger.params.collectionId.value) {
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