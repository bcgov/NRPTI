'use strict';

/**
 * This file contains query builder utility functions.
 */

let mongoose = require('mongoose');
const moment = require('moment');
let DEFAULT_PAGESIZE = 100;

/**
 * Removes properties from fields that are not present in allowedFields
 *
 * @param {*} allowedFields array of fields that are allowed.
 * @param {*} fields array of fields that will have all non-allowed fields removed.
 * @returns array of fields that is a subset of allowedFields.
 */
exports.getSanitizedFields = function(allowedFields, fields) {
  return fields.filter(function(field) {
    return allowedFields.indexOf(allowedFields, field) !== -1;
  });
};

/**
 * TODO: populate this documentation
 *
 * @param {*} property
 * @param {*} values
 * @param {*} query
 * @returns
 */
exports.buildQuery = function(property, values, query) {
  let objectIDs = [];
  if (Array.isArray(values)) {
    for (let id in values) {
      objectIDs.push(mongoose.Types.ObjectId(id));
    }
  } else {
    objectIDs.push(mongoose.Types.ObjectId(values));
  }
  return {
    ...query,
    ...{
      [property]: {
        $in: objectIDs
      }
    }
  };
};

/**
 * TODO: populate this documentation
 *
 * @param {*} pageSize
 * @param {*} pageNum
 * @returns
 */
exports.getSkipLimitParameters = function(pageSize, pageNum) {
  const params = {};

  let ps = DEFAULT_PAGESIZE; // Default
  if (pageSize && pageSize.value !== undefined) {
    if (pageSize.value > 0) {
      ps = pageSize.value;
    }
  }
  if (pageNum && pageNum.value !== undefined) {
    if (pageNum.value >= 0) {
      params.skip = pageNum.value * ps;
      params.limit = ps;
    }
  }
  return params;
};

exports.recordAction = async function(action, meta, username, objId = null) {
  const Audit = mongoose.model('Audit');
  const audit = new Audit({
    _objectSchema: 'Query',
    action: action,
    meta: meta,
    objId: objId,
    performedBy: username
  });
  return await audit.save();
};

exports.recordTypes = [
  'Order',
  'Inspection',
  'Certificate',
  'Permit',
  'Agreement',
  'SelfReport',
  'RestorativeJustice',
  'Ticket',
  'AdministrativePenalty',
  'AdministrativeSanction',
  'Warning',
  'ConstructionPlan',
  'ManagementPlan',
  'CourtConviction'
];

/**
 * Determine if the obj (record.issuedTo) meets the requirements to not be anonymous.
 *
 * Note: If insufficient information is provided, must assume anonymous.
 *
 * @param {*} obj
 * @returns true if the object is anonymous, false if it is not anonymous.
 */
exports.isRecordConsideredAnonymous = function(record) {
  if (!record || !record.issuedTo) {
    // can't determine anonymity, must assume anonymous
    return true;
  }

  if (record.issuedTo.type === 'Company') {
    // companies are not anonymous
    return false;
  }

  if (!record.issuedTo.dateOfBirth) {
    // all types other than Company must have a birth date to have a chance at being not anonymous
    return true;
  }

  if (moment().diff(moment(record.issuedTo.dateOfBirth), 'years') >= 19) {
    // adults are not anonymous
    return false;
  }

  // if no contradicting evidence, must assume anonymous
  return true;
};

/**
 * Checks if the `obj` contains a field named `property`.
 *
 * Note: only checks root level properties
 *
 * @param {object} obj
 * @param {string} property
 * @returns True if the object contains the property, false otherwise. Returns null if either parameter is null.
 */
const objectHasProperty = function(obj, property) {
  if (!obj || !property) {
    return null;
  }

  return Object.prototype.hasOwnProperty.call(obj, property);
};

exports.objectHasProperty = objectHasProperty;

/**
 * Checks if the mongoose model `modelName` contains a field named `property`.
 *
 * Note: only checks root level model properties.
 *
 * @param {*} modelName
 * @param {*} property
 * @returns True if the model contains the property, false otherwise.  Returns null if either parameter is null, or the
 * mongoose model is not found.
 */
exports.mongooseModelHasProperty = function(modelName, property) {
  if (!modelName || !property) {
    return null;
  }

  const model = mongoose.model(modelName);

  if (!model || !model.schema || !model.schema.obj) {
    return null;
  }

  return objectHasProperty(model.schema.obj, property);
};
