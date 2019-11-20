'use strict';

let mongoose = require('mongoose');
let mime = require('mime-types');
let queryActions = require('../utils/query-actions');
let queryUtils = require('../utils/query-utils');
let documentUtils = require('../utils/document-utils');
let FlakeIdGen = require('flake-idgen'),
  intformat = require('biguint-format'),
  generator = new FlakeIdGen();
let fs = require('fs');

let defaultLog = require('../utils/logger')('document');

let UPLOAD_DIR = process.env.UPLOAD_DIRECTORY || './uploads/';
let ENABLE_VIRUS_SCANNING = process.env.ENABLE_VIRUS_SCANNING || false;

const allowedFields = ['displayName', 'internalURL', 'passedAVCheck', 'documentFileName', 'internalMime'];

// Authenticated Requests

/**
 * TODO: populate this documentation
 *
 * @param {*} args
 * @param {*} res
 * @param {*} rest
 */
exports.protectedOptions = function(args, res, rest) {
  res.status(200).send();
};

/**
 * TODO: populate this documentation
 *
 * @param {*} args
 * @param {*} res
 * @param {*} next
 */
exports.protectedHead = function(args, res, next) {
  defaultLog.info(
    'args.swagger.operation.x-security-scopes:',
    JSON.stringify(args.swagger.operation['x-security-scopes'])
  );

  // Build match query if on docId route
  let query = {};
  if (args.swagger.params.docId) {
    query = queryUtils.buildQuery('_id', args.swagger.params.docId.value, query);
  }
  if (args.swagger.params._record && args.swagger.params._record.value) {
    query = queryUtils.buildQuery('_record', args.swagger.params._record.value, query);
  }
  // Unless they specifically ask for it, hide deleted results.
  if (args.swagger.params.isDeleted && args.swagger.params.isDeleted.value != undefined) {
    query = { ...query, ...{ isDeleted: args.swagger.params.isDeleted.value } };
  } else {
    query = { ...query, ...{ isDeleted: false } };
  }

  queryUtils
    .runDataQuery(
      'Document',
      args.swagger.operation['x-security-scopes'],
      query,
      ['_id', 'tags'], // Fields
      null, // sort warmup
      null, // sort
      null, // skip
      null, // limit
      true
    ) // count
    .then(function(data) {
      if (!(args.swagger.params.docId && args.swagger.params.docId.value) || (data && data.length > 0)) {
        res.setHeader('x-total-count', data && data.length > 0 ? data[0].total_items : 0);
        return queryActions.sendResponse(res, 200, data);
      } else {
        return queryActions.sendResponse(res, 404, data);
      }
    });
};

/**
 * TODO: populate this documentation
 *
 * @param {*} args
 * @param {*} res
 * @param {*} next
 */
exports.protectedGet = function(args, res, next) {
  defaultLog.info(
    'args.swagger.operation.x-security-scopes:',
    JSON.stringify(args.swagger.operation['x-security-scopes'])
  );

  // Build match query if on docId route
  let query = {};
  if (args.swagger.params.docId) {
    query = queryUtils.buildQuery('_id', args.swagger.params.docId.value, query);
  }
  if (args.swagger.params._record && args.swagger.params._record.value) {
    query = queryUtils.buildQuery('_record', args.swagger.params._record.value, query);
  }
  // Unless they specifically ask for it, hide deleted results.
  if (args.swagger.params.isDeleted && args.swagger.params.isDeleted.value != undefined) {
    query = { ...query, ...{ isDeleted: args.swagger.params.isDeleted.value } };
  } else {
    query = { ...query, ...{ isDeleted: false } };
  }

  queryUtils
    .runDataQuery(
      'Document',
      args.swagger.operation['x-security-scopes'],
      query,
      queryUtils.getSanitizedFields(allowedFields, args.swagger.params.fields.value), // Fields
      null, // sort warmup
      null, // sort
      null, // skip
      null, // limit
      false
    ) // count
    .then(function(data) {
      return queryActions.sendResponse(res, 200, data);
    });
};

/**
 * TODO: populate this documentation
 *
 * @param {*} args
 * @param {*} res
 * @param {*} next
 */
exports.protectedDownload = function(args, res, next) {
  defaultLog.info(
    'args.swagger.operation.x-security-scopes:',
    JSON.stringify(args.swagger.operation['x-security-scopes'])
  );

  // Build match query if on docId route
  let query = {};
  if (args.swagger.params.docId) {
    query = queryUtils.buildQuery('_id', args.swagger.params.docId.value, query);
  }

  queryUtils
    .runDataQuery(
      'Document',
      args.swagger.operation['x-security-scopes'],
      query,
      ['internalURL', 'documentFileName', 'internalMime'], // Fields
      null, // sort warmup
      null, // sort
      null, // skip
      null, // limit
      false
    ) // count
    .then(function(data) {
      if (data && data.length === 1) {
        let blob = data[0];
        if (fs.existsSync(blob.internalURL)) {
          let stream = fs.createReadStream(blob.internalURL);
          let stat = fs.statSync(blob.internalURL);
          res.setHeader('Content-Length', stat.size);
          res.setHeader('Content-Type', blob.internalMime);
          res.setHeader('Content-Disposition', 'inline;filename="' + blob.documentFileName + '"');
          stream.pipe(res);
        }
      } else {
        return queryActions.sendResponse(res, 404, {});
      }
    });
};

/**
 * TODO: populate this documentation
 *
 * @param {*} args
 * @param {*} res
 * @param {*} next
 * @returns
 */
exports.protectedPost = function(args, res, next) {
  defaultLog.info('Creating new object');
  let _record = args.swagger.params._record.value;
  let displayName = args.swagger.params.displayName.value;
  let upfile = args.swagger.params.upfile.value;

  let guid = intformat(generator.next(), 'dec');
  let ext = mime.extension(args.swagger.params.upfile.value.mimetype);
  try {
    Promise.resolve()
      .then(function() {
        if (ENABLE_VIRUS_SCANNING == 'true') {
          return documentUtils.avScan(args.swagger.params.upfile.value.buffer);
        } else {
          return true;
        }
      })
      .then(function(valid) {
        if (!valid) {
          defaultLog.warn('File failed virus check');
          return queryActions.sendResponse(res, 400, { message: 'File failed virus check.' });
        } else {
          fs.writeFileSync(UPLOAD_DIR + guid + '.' + ext, args.swagger.params.upfile.value.buffer);

          let Document = mongoose.model('Document');
          let doc = new Document();
          // Define security tag defaults
          doc.tags = [['sysadmin']];
          doc._record = _record;
          doc.displayName = displayName;
          doc.documentFileName = upfile.originalname;
          doc.internalMime = upfile.mimetype;
          doc.internalURL = UPLOAD_DIR + guid + '.' + ext;
          doc.passedAVCheck = true;
          // Update who did this?
          doc._addedBy = args.swagger.params.auth_payload.preferred_username;
          doc.save().then(function(doc) {
            defaultLog.info('Saved new document object:', doc._id);
            return queryActions.sendResponse(res, 200, doc);
          });
        }
      });
  } catch (error) {
    defaultLog.info('Error:', error);
    // Delete the path details before we return to the caller.
    delete error['path'];
    return queryActions.sendResponse(res, 400, error);
  }
};

/**
 * TODO: populate this documentation
 *
 * @param {*} args
 * @param {*} res
 * @param {*} next
 */
exports.protectedDelete = function(args, res, next) {
  let objId = args.swagger.params.docId.value;
  defaultLog.info('Delete Document:', objId);

  let Document = require('mongoose').model('Document');
  Document.findOne({ _id: objId, isDeleted: false }, function(err, obj) {
    if (obj) {
      defaultLog.debug('obj:', JSON.stringify(obj));

      // Set the deleted flag.
      queryActions.delete(obj).then(
        function(deleted) {
          // Deleted successfully
          return queryActions.sendResponse(res, 200, deleted);
        },
        function(err) {
          // Error
          return queryActions.sendResponse(res, 400, err);
        }
      );
    } else {
      defaultLog.warn("Couldn't find that object!");
      return queryActions.sendResponse(res, 404, {});
    }
  });
};

/**
 * TODO: populate this documentation
 *
 * @param {*} args
 * @param {*} res
 * @param {*} next
 * @returns
 */
exports.protectedPut = function(args, res, next) {
  // defaultLog.info("upfile:", args.swagger.params.upfile);
  let objId = args.swagger.params.docId.value;
  let _record = args.swagger.params._record.value;
  let displayName = args.swagger.params.displayName.value;
  defaultLog.info('ObjectID:', args.swagger.params.docId.value);

  let guid = intformat(generator.next(), 'dec');
  let ext = mime.extension(args.swagger.params.upfile.value.mimetype);
  try {
    Promise.resolve()
      .then(function() {
        if (ENABLE_VIRUS_SCANNING == 'true') {
          return documentUtils.avScan(args.swagger.params.upfile.value.buffer);
        } else {
          return true;
        }
      })
      .then(function(valid) {
        if (!valid) {
          defaultLog.warn('File failed virus check');
          return queryActions.sendResponse(res, 400, { message: 'File failed virus check.' });
        } else {
          fs.writeFileSync(UPLOAD_DIR + guid + '.' + ext, args.swagger.params.upfile.value.buffer);
          let obj = args.swagger.params;
          // Strip security tags - these will not be updated on this route.
          delete obj.tags;
          defaultLog.info('Incoming updated object:', obj._id);
          // Update file location
          obj.internalURL = UPLOAD_DIR + guid + '.' + ext;
          // Update who did this?
          obj._addedBy = args.swagger.params.auth_payload.preferred_username;
          obj._record = _record;
          obj.displayName = displayName;
          obj.passedAVCheck = true;
          let Document = require('mongoose').model('Document');
          Document.findOneAndUpdate({ _id: objId }, obj, { upsert: false, new: true }, function(err, obj) {
            if (obj) {
              // defaultLog.info("obj:", obj);
              return queryActions.sendResponse(res, 200, obj);
            } else {
              defaultLog.warn("Couldn't find that object!");
              return queryActions.sendResponse(res, 404, {});
            }
          });
        }
      });
  } catch (error) {
    defaultLog.info('Error:', error);
    // Delete the path details before we return to the caller.
    delete error['path'];
    return queryActions.sendResponse(res, 400, error);
  }
};

/**
 * TODO: populate this documentation
 *
 * @param {*} args
 * @param {*} res
 * @param {*} next
 */
exports.protectedPublish = function(args, res, next) {
  let objId = args.swagger.params.docId.value;
  defaultLog.info('Publish Document:', objId);

  let Document = require('mongoose').model('Document');
  Document.findOne({ _id: objId }, function(err, obj) {
    if (obj) {
      defaultLog.debug('obj:', JSON.stringify(obj));

      // Add public to the tag of this obj.
      queryActions.publish(obj).then(
        function(published) {
          // Published successfully
          return queryActions.sendResponse(res, 200, published);
        },
        function(err) {
          // Error
          return queryActions.sendResponse(res, null, err);
        }
      );
    } else {
      defaultLog.warn("Couldn't find that object!");
      return queryActions.sendResponse(res, 404, {});
    }
  });
};

/**
 * TODO: populate this documentation
 *
 * @param {*} args
 * @param {*} res
 * @param {*} next
 */
exports.protectedUnPublish = function(args, res, next) {
  let objId = args.swagger.params.docId.value;
  defaultLog.info('UnPublish Document:', objId);

  let Document = require('mongoose').model('Document');
  Document.findOne({ _id: objId }, function(err, obj) {
    if (obj) {
      defaultLog.debug('obj:', JSON.stringify(obj));

      // Remove public to the tag of this obj.
      queryActions.unPublish(obj).then(
        function(unpublished) {
          // UnPublished successfully
          return queryActions.sendResponse(res, 200, unpublished);
        },
        function(err) {
          // Error
          return queryActions.sendResponse(res, null, err);
        }
      );
    } else {
      defaultLog.warn("Couldn't find that object!");
      return queryActions.sendResponse(res, 404, {});
    }
  });
};

// Public Requests

/**
 * TODO: populate this documentation
 *
 * @param {*} args
 * @param {*} res
 * @param {*} next
 */
exports.publicGet = function(args, res, next) {
  // Build match query if on docId route
  let query = {};
  if (args.swagger.params.docId) {
    query = queryUtils.buildQuery('_id', args.swagger.params.docId.value, query);
  }
  if (args.swagger.params._record && args.swagger.params._record.value) {
    query = queryUtils.buildQuery('_record', args.swagger.params._record.value, query);
  }
  query = { ...query, ...{ isDeleted: false } };

  queryUtils
    .runDataQuery(
      'Document',
      ['public'],
      query,
      queryUtils.getSanitizedFields(allowedFields, args.swagger.params.fields.value), // Fields
      null, // sort warmup
      null, // sort
      null, // skip
      null, // limit
      false
    ) // count
    .then(function(data) {
      return queryActions.sendResponse(res, 200, data);
    });
};

/**
 * TODO: populate this documentation
 *
 * @param {*} args
 * @param {*} res
 * @param {*} next
 * @returns
 */
exports.publicPost = function(args, res, next) {
  defaultLog.info('Creating new object');
  let _record = args.swagger.params._record.value;
  let displayName = args.swagger.params.displayName.value;
  let upfile = args.swagger.params.upfile.value;

  let guid = intformat(generator.next(), 'dec');
  let ext = mime.extension(args.swagger.params.upfile.value.mimetype);
  try {
    Promise.resolve()
      .then(function() {
        if (ENABLE_VIRUS_SCANNING == 'true') {
          return documentUtils.avScan(args.swagger.params.upfile.value.buffer);
        } else {
          return true;
        }
      })
      .then(function(valid) {
        if (!valid) {
          defaultLog.warn('File failed virus check');
          return queryActions.sendResponse(res, 400, { message: 'File failed virus check.' });
        } else {
          fs.writeFileSync(UPLOAD_DIR + guid + '.' + ext, args.swagger.params.upfile.value.buffer);
          let Document = mongoose.model('Document');
          let doc = new Document();
          // Define security tag defaults
          doc.tags = [['sysadmin']];
          doc._record = _record;
          doc.displayName = displayName;
          doc.documentFileName = upfile.originalname;
          doc.internalMime = upfile.mimetype;
          doc.internalURL = UPLOAD_DIR + guid + '.' + ext;
          doc.passedAVCheck = true;
          // Update who did this?  TODO: Public
          // doc._addedBy = args.swagger.params.auth_payload.preferred_username;
          doc.save().then(function(doc) {
            defaultLog.info('Saved new document object:', doc._id);
            return queryActions.sendResponse(res, 200, doc);
          });
        }
      });
  } catch (error) {
    defaultLog.info('Error:', error);
    // Delete the path details before we return to the caller.
    delete error['path'];
    return queryActions.sendResponse(res, 400, error);
  }
};

/**
 * TODO: populate this documentation
 *
 * @param {*} args
 * @param {*} res
 * @param {*} next
 * @returns
 */
exports.publicDownload = function(args, res, next) {
  // Build match query if on docId route
  let query = {};
  if (args.swagger.params.docId) {
    query = queryUtils.buildQuery('_id', args.swagger.params.docId.value, query);
  } else {
    return queryActions.sendResponse(res, 404, {});
  }

  queryUtils
    .runDataQuery(
      'Document',
      ['public'],
      query,
      ['internalURL', 'documentFileName', 'internalMime'], // Fields
      null, // sort warmup
      null, // sort
      null, // skip
      null, // limit
      false
    ) // count
    .then(function(data) {
      if (data && data.length === 1) {
        let blob = data[0];
        if (fs.existsSync(blob.internalURL)) {
          let stream = fs.createReadStream(blob.internalURL);
          let stat = fs.statSync(blob.internalURL);
          res.setHeader('Content-Length', stat.size);
          res.setHeader('Content-Type', blob.internalMime);
          res.setHeader('Content-Disposition', 'inline;filename="' + blob.documentFileName + '"');
          stream.pipe(res);
        }
      } else {
        return queryActions.sendResponse(res, 404, {});
      }
    });
};
