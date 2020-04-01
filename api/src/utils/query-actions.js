'use strict';

const defaultLog = require('./logger')('queryActions');

/**
 * Publish the obj: add 'public' to the 'read' field.
 *
 * @param {*} obj
 * @returns
 */
exports.publish = async function(obj) {
  let self = this;
  return new Promise(async function(resolve, reject) {
    // Object was already published?
    if (self.isPublished(obj)) {
      defaultLog.info(`publish - HTTP 409 - Object already published: ${JSON.stringify(obj)}`);

      resolve({
        code: 409,
        message: 'Object already published'
      });
    } else {
      // publish
      self.addPublicReadRole(obj);

      const date = new Date();

      obj.datePublished = date;
      obj.markModified('datePublished');

      obj.dateUpdated = date;
      obj.markModified('dateUpdated');

      // save and return
      let savedObj = await obj.save();

      if (!savedObj.code) {
        resolve(savedObj);
      } else {
        resolve({
          code: savedObj.code,
          message: `Error: ${savedObj.message}`
        });
      }
    }
  });
};

/**
 * Adds the read role to the objects read array, if it exists.
 *
 * @param {*} obj
 * @returns
 */
exports.addPublicReadRole = function(obj) {
  if (!obj || !obj.read || !Array.isArray(obj.read)) {
    return obj;
  }

  obj.read.push('public');
  obj.markModified('read');

  return obj;
};

/**
 * Unpublish the obj: remove 'public' from the 'read' field.
 *
 * @param {*} obj
 * @returns
 */
exports.unPublish = async function(obj) {
  let self = this;
  return new Promise(async function(resolve, reject) {
    // Object wasn't already published?
    if (!self.isPublished(obj)) {
      defaultLog.info(`unPublish - HTTP 409 - Object already unpublished: ${JSON.stringify(obj)}`);

      resolve({
        code: 409,
        message: 'Object already unpublished'
      });
    } else {
      // unpublish
      self.removePublicReadRole(obj);

      obj.datePublished = null;
      obj.markModified('datePublished');

      obj.dateUpdated = new Date();
      obj.markModified('dateUpdated');

      // save and return
      let savedObj = await obj.save();

      if (!savedObj.code) {
        resolve(savedObj);
      } else {
        resolve({
          code: savedObj.code,
          message: `Error: ${savedObj.message}`
        });
      }
    }
  });
};

/**
 * Removes the read role to the objects read array, if it exists.
 *
 * @param {*} obj
 * @returns
 */
exports.removePublicReadRole = function(obj) {
  if (!obj || !obj.read || !Array.isArray(obj.read)) {
    return obj;
  }

  obj.read = obj.read.filter(role => role !== 'public');
  obj.markModified('read');

  return obj;
};

/**
 * Return true if the obj is published, false if not publish, and null if invalid obj provided.
 *
 * @param {*} obj
 * @returns
 */
exports.isPublished = function(obj) {
  if (!obj || !obj.read || !Array.isArray(obj.read)) {
    return null;
  }

  return obj.read.includes('public');
};

/**
 * Sends an http response.
 *
 * @param {*} res an http response
 * @param {number} code an http code (200, 404, etc)
 * @param {*} object the response data.
 * @returns {*} res an http response
 */
exports.sendResponse = function(res, code, object) {
  res.writeHead(code, { 'Content-Type': 'application/json' });
  return res.end(JSON.stringify(object));
};
