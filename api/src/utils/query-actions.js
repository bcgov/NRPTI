'use strict';

const defaultLog = require('./logger')('queryActions');

/**
 * TODO: populate this documentation
 *
 * @param {*} obj
 * @returns
 */
exports.publish = async function(obj) {
  let self = this;
  return new Promise(async function(resolve, reject) {
    // Object was already published?
    if (self.isPublished(obj)) {
      defaultLog.info('HTTP 409, Object already published:', obj);
      resolve({
        code: 409,
        message: 'Object already published'
      });
    } else {
      // Add publish, save then return.
      obj.read.push('public');
      let thing = await obj.save();
      if (!thing.code) {
        resolve(thing);
      } else {
        resolve({
          code: thing.code,
          message: 'Error:' + thing.message
        });
      }
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
  return obj.read.includes('public');
};

/**
 * TODO: populate this documentation
 *
 * @param {*} obj
 * @returns
 */
exports.unPublish = async function(obj) {
  let self = this;
  return new Promise(async function(resolve, reject) {
    // Object wasn't already published?
    if (!self.isPublished(obj)) {
      defaultLog.info('HTTP 409, Object already unpublished:', obj);
      resolve({
        code: 409,
        message: 'Object already unpublished'
      });
    } else {
      // Remove publish, save then return.
      for (let i = obj.read.length - 1; i >= 0; i--) {
        if (obj.read[i] == 'public') {
          obj.read.splice(i, 1);
        }
      }
      obj.markModified('read');

      let thing = await obj.save();
      if (!thing.code) {
        resolve(thing);
      } else {
        resolve({
          code: thing.code,
          message: 'Error:' + thing.message
        });
      }
    }
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
