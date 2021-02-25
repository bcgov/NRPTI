const defaultLog = require('../utils/logger')('mapLayerInfo');
const queryActions = require('../utils/query-actions');
const queryUtils = require('../utils/query-utils');
const { ApplicationRoles } = require('../utils/constants/misc');
const Post = require('../controllers/post/post');
const Get = require('../controllers/get/get');
const Delete = require('../controllers/delete/delete');
const PutUtils = require('../utils/put-utils');
const { mapLayerInfo: MapLayerInfo } = require('../models/index');

exports.protectedOptions = function(args, res, next) {
  res.status(200).send();
};

exports.publicGet = async function(args, res, next) {
  let mapInfoId = null;
  let errorMsg = null;
  if (args.swagger.params.mapInfoId && args.swagger.params.mapInfoId.value) {
    mapInfoId = args.swagger.params.mapInfoId.value;
  } else {
    errorMsg = `publicGet - you must provide an id to get`;
    defaultLog.info(errorMsg);
    return queryActions.sendResponse(res, 400, errorMsg);
  }

  let obj = null;
  try {
    obj = await Get.findById(mapInfoId);
  } catch (error) {
    errorMsg = `publicGet - error getting map info: ${mapInfoId}`;
    defaultLog.info(errorMsg);
    defaultLog.debug(error);
    return queryActions.sendResponse(res, 400, errorMsg);
  }

  if (!obj) {
    errorMsg = `protectedGet - map info not found: ${mapInfoId}`;
    defaultLog.info(errorMsg);
    return queryActions.sendResponse(res, 404, errorMsg);
  }

  return queryActions.sendResponse(res, 200, obj);
};

exports.protectedGet = async function(args, res, next) {
  let mapInfoId = null;
  let errorMsg = null;
  if (args.swagger.params.mapInfoId && args.swagger.params.mapInfoId.value) {
    mapInfoId = args.swagger.params.mapInfoId.value;
  } else {
    errorMsg = `protectedGet - you must provide an id to get`;
    defaultLog.info(errorMsg);
    return queryActions.sendResponse(res, 400, errorMsg);
  }

  let obj = null;
  try {
    obj = await Get.findById(mapInfoId);
  } catch (error) {
    errorMsg = `protectedGet - error getting map info: ${mapInfoId}`;
    defaultLog.info(errorMsg);
    defaultLog.debug(error);
    return queryActions.sendResponse(res, 400, errorMsg);
  }

  if (!obj) {
    errorMsg = `protectedGet - map info not found: ${mapInfoId}`;
    defaultLog.info(errorMsg);
    return queryActions.sendResponse(res, 404, errorMsg);
  }

  return queryActions.sendResponse(res, 200, obj);
};

async function getMapLayerInfoSegment(segment) {
  return await MapLayerInfo.findOne({ _schemaName: 'MapLayerInfo', segment });
}

exports.protectedPost = async function(args, res, next) {
  let incomingObj = {};
  let errorMsg = null;
  // Only accpet application: 'LNG' for now
  if (args.swagger.params.mapInfo && args.swagger.params.mapInfo.value) {
    incomingObj = args.swagger.params.mapInfo.value;
  } else {
    errorMsg = `protectedPost - error: invalid post body`;
    defaultLog.info(errorMsg);
    return queryActions.sendResponse(res, 400, errorMsg);
  }

  if (!(incomingObj.application && incomingObj.application === 'LNG')) {
    errorMsg = `protectedPost - error: application type not accepted`;
    defaultLog.info(errorMsg);
    return queryActions.sendResponse(res, 400, errorMsg);
  }

  if (!(incomingObj.data && incomingObj.data.segment)) {
    errorMsg = `protectedPost - error: missing segment`;
    defaultLog.info(errorMsg);
    return queryActions.sendResponse(res, 400, errorMsg);
  }

  const data = incomingObj.data;

  // Check for existing segment info and prevent creating duplicates
  const existingMapInfo = await getMapLayerInfoSegment(data.segment);
  if (existingMapInfo) {
    errorMsg = `protectedPost - error:  segment info already exists`;
    defaultLog.info(errorMsg);
    return queryActions.sendResponse(res, 400, errorMsg);
  }

  let map = new MapLayerInfo();

  data.segment && (map.segment = data.segment);
  data.description && (map.description = data.description);
  data.location && (map.location = data.location);
  data.length && (map.length = data.length);

  map.read = [ApplicationRoles.ADMIN, ApplicationRoles.ADMIN_LNG, ApplicationRoles.PUBLIC];
  map.write = [ApplicationRoles.ADMIN, ApplicationRoles.ADMIN_LNG];

  map.dateAdded = Date.now();
  map.dateUpdated = Date.now();
  map.updatedBy = args.swagger.params.auth_payload.displayName;

  let obj = null;
  try {
    obj = await Post.insert(map);
    queryUtils.audit(args, 'POST', JSON.stringify(obj.ops[0]), args.swagger.params.auth_payload, obj.ops[0]._id);
  } catch (error) {
    errorMsg = `protectedPost - error inserting map layer info: ${map}`;
    defaultLog.info(errorMsg);
    defaultLog.debug(error);
    return queryActions.sendResponse(res, 400, errorMsg);
  }

  return queryActions.sendResponse(res, 200, obj.ops[0]);
};

exports.protectedPut = async function(args, res, next) {
  let incomingObj = {};
  let errorMsg = null;

  if (args.swagger.params.mapInfo && args.swagger.params.mapInfo.value) {
    incomingObj = args.swagger.params.mapInfo.value;
  } else {
    errorMsg = `protectedPut - you must provide mapInfo data to put`;
    defaultLog.info(errorMsg);
    return queryActions.sendResponse(res, 400, errorMsg);
  }

  let mapInfoId = null;
  if (args.swagger.params.mapInfoId && args.swagger.params.mapInfoId.value) {
    mapInfoId = args.swagger.params.mapInfoId.value;
  } else {
    errorMsg = `protectedPut - you must provide mapInfoId to put`;
    defaultLog.info(errorMsg);
    return queryActions.sendResponse(res, 400, errorMsg);
  }

  // Prevent changing the segment value
  delete incomingObj.segment;
  delete incomingObj._id;
  delete incomingObj.read;
  delete incomingObj.write;

  const sanitizedObj = PutUtils.validateObjectAgainstModel(MapLayerInfo, incomingObj);

  if (!sanitizedObj || sanitizedObj === {}) {
    // skip, as there are no changes to master record
    return;
  }

  sanitizedObj.dateUpdated = new Date();
  sanitizedObj.updatedBy = args.swagger.params.auth_payload.displayName;
  const dotNotatedObj = PutUtils.getDotNotation(sanitizedObj);
  const updateObj = { $set: dotNotatedObj };

  let obj = null;
  try {
    obj = await MapLayerInfo.findOneAndUpdate(
      {
        _id: mapInfoId,
        write: { $in: args.swagger.params.auth_payload.realm_access.roles }
      },
      updateObj,
      { new: true }
    );

    queryUtils.audit(args, 'PUT', JSON.stringify(obj), args.swagger.params.auth_payload, obj._id);
  } catch (error) {
    errorMsg = `protectedPut - error updating map info: ${updateObj}`;
    defaultLog.info(errorMsg);
    defaultLog.debug(error);
    return queryActions.sendResponse(res, 400, errorMsg);
  }

  return queryActions.sendResponse(res, 200, obj);
};

exports.protectedDelete = async function(args, res, next) {
  let mapInfoId = null;
  if (args.swagger.params.mapInfoId && args.swagger.params.mapInfoId.value) {
    mapInfoId = args.swagger.params.mapInfoId.value;
  } else {
    defaultLog.info(`protectedDelete - you must provide an id to delete`);
    return queryActions.sendResponse(res, 400, {});
  }

  let obj = null;
  try {
    obj = await Delete.deleteById(mapInfoId);
    queryUtils.audit(args, 'DELETE', JSON.stringify(obj), args.swagger.params.auth_payload, mapInfoId);
  } catch (error) {
    defaultLog.info(`protectedDelete - error deleting mapInfo: ${mapInfoId}`);
    defaultLog.debug(error);
    return queryActions.sendResponse(res, 400, {});
  }

  return queryActions.sendResponse(res, 200, obj);
};
