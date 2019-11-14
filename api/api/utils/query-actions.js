'use strict';

const defaultLog = require('./logger')('queryActions');

/**
 * TODO: populate this documentation
 *
 * @param {*} obj
 * @returns
 */
exports.publish = function(obj) {
  return new Promise(function(resolve, reject) {
    let exists = false;
    for (let tag in obj.tags) {
      exists = tag.includes('public');
    }

    // Object was already published?
    if (exists) {
      defaultLog.info('HTTP 409, Object already published:', exists);
      reject({
        code: 409,
        message: 'Object already published'
      });
    } else {
      // Add publish, save then return.
      obj.tags.push(['public']);
      obj.save().then(resolve, function(err) {
        reject({ code: 400, message: err.message });
      });
    }
  });
};

/**
 * TODO: populate this documentation
 *
 * @param {*} obj
 * @returns
 */
exports.isPublished = function(obj) {
  for (let tag in obj.tags) {
    return tag.includes('public');
  }
};

/**
 * TODO: populate this documentation
 *
 * @param {*} obj
 * @returns
 */
exports.unPublish = function(obj) {
  return new Promise(function(resolve, reject) {
    let exists = obj.tags.filter(function(item) {
      return item.includes(['public']);
    });
    // Object wasn't already published?
    if (exists.length === 0) {
      defaultLog.info('HTTP 409, Object already unpublished:', exists);
      reject({
        code: 409,
        message: 'Object already unpublished'
      });
    } else {
      obj.markModified('tags');
      // Remove publish, save then return.
      obj.save().then(resolve, function(err) {
        reject({ code: 400, message: err.message });
      });
    }
  });
};

/**
 * TODO: populate this documentation
 *
 * @param {*} obj
 * @returns
 */
exports.delete = function(obj) {
  return new Promise(function(resolve, reject) {
    obj.tags = obj.tags.filter(function(item) {
      return item.includes(['public']);
    });
    obj.isDeleted = true;
    obj.markModified('tags');
    obj.markModified('isDeleted');
    // save then return.
    obj.save().then(resolve, function(err) {
      reject({ code: 400, message: err.message });
    });
  });
};

/**
 * Sends an http response.
 *
 * Note on code param: If no `code` param is provided, `object.code` will be used if exists, or else `500`.
 *
 * @param {*} res an http response
 * @param {number} code an http code (200, 404, etc)
 * @param {*} object the response data.
 * @returns {*} res an http response
 */
exports.sendResponse = function(res, code, object) {
  const httpErrorCode = code || (object && object.code) || 500;
  res.writeHead(httpErrorCode, { 'Content-Type': 'application/json' });
  return res.end(JSON.stringify(object));
};
