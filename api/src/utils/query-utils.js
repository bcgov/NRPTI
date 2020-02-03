'use strict';

/**
 * This file contains query builder utility functions.
 */

let mongoose = require('mongoose');
let DEFAULT_PAGESIZE = 100;

/**
 * Removes properties from fields that are not present in allowedFields
 *
 * @param {*} allowedFields array of fields that are allowed.
 * @param {*} fields array of fields that will have all non-allowed fields removed.
 * @returns array of fields that is a subset of allowedFields.
 */
exports.getSanitizedFields = function(allowedFields, fields) {
  return fields.filter(function (field) {
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
  'AdministrativeSanction'
];
