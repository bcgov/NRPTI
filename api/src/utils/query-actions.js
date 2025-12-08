'use strict';

/**
 * Publish the obj: add 'public' to the 'read' field.
 *
 * @param {*} obj
 * @returns
 */
exports.publish = async function (obj, auth_payload) {
  let self = this;
  return new Promise(async function (resolve, reject) {
    // Object was already published?
    if (self.isPublished(obj)) {
      resolve({
        code: 409,
        message: 'Object already published'
      });
    } else {
      // publish
      self.addPublicReadRole(obj);
      obj.markModified('read');

      const date = new Date();

      obj.datePublished = date;
      obj.markModified('datePublished');

      obj.publishedBy = auth_payload && auth_payload.idir_userid;
      obj.markModified('publishedBy');

      obj.dateUpdated = date;
      obj.markModified('dateUpdated');

      obj.updatedBy = auth_payload && auth_payload.idir_userid;
      obj.markModified('updatedBy');

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
 * Note: will not add duplicate `public` roles to the array.
 *
 * @param {*} obj
 * @returns obj
 */
exports.addPublicReadRole = function (obj) {
  if (!obj || !obj.read || !Array.isArray(obj.read)) {
    return obj;
  }

  if (!obj.read.includes('public')) {
    obj.read.push('public');
  }

  return obj;
};

/**
 * Unpublish the obj: remove 'public' from the 'read' field.
 *
 * @param {*} obj
 * @returns
 */
exports.unPublish = async function (obj, auth_payload) {
  let self = this;
  return new Promise(async function (resolve, reject) {
    // Object wasn't already published?
    if (!self.isPublished(obj)) {
      resolve({
        code: 409,
        message: 'Object already unpublished'
      });
    } else {
      // unpublish
      self.removePublicReadRole(obj);
      obj.markModified('read');

      obj.datePublished = null;
      obj.markModified('datePublished');

      obj.publishedBy = null;
      obj.markModified('publishedBy');

      obj.dateUpdated = new Date();
      obj.markModified('dateUpdated');

      obj.updatedBy = auth_payload && auth_payload.idir_userid;
      obj.markModified('updatedBy');

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
 * Removes the read role from the objects read array, if it exists.
 *
 * @param {*} obj
 * @returns obj
 */
exports.removePublicReadRole = function (obj) {
  if (!obj || !obj.read || !Array.isArray(obj.read)) {
    return obj;
  }

  obj.read = obj.read.filter(role => role !== 'public');

  return obj;
};

/**
 * Return true if the obj is published, false if not publish, and null if invalid obj provided.
 *
 * @param {*} obj
 * @returns
 */
exports.isPublished = function (obj) {
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
exports.sendResponse = function (res, code, object) {
  res.writeHead(code, { 'Content-Type': 'application/json' });
  return res.end(JSON.stringify(object));
};
