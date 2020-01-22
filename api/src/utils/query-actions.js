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
      obj.read.push('public');
      obj.markModified('read');

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
      obj.read = obj.read.filter(role => role !== 'public');
      obj.markModified('read');

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
 * Return true if the obj is published, false otherwise.
 *
 * @param {*} obj
 * @returns
 */
exports.isPublished = function(obj) {
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
