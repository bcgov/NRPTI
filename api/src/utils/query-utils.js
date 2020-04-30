'use strict';

/**
 * This file contains query builder utility functions.
 */

const mongoose = require('mongoose');
const moment = require('moment');
const DEFAULT_PAGESIZE = 100;

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
 * Calculate anonymity business logic rules for a record.
 *
 * A record that is considered to be anonymous must not make public any data that might contain an individuals name
 * (and related personally identifiable information). This includes record meta and associated documents.
 *
 * @param {*} record
 * @returns boolean true if the record is considered anonymous, false otherwise.
 */
function isRecordConsideredAnonymous(record) {
  let isAnonymous = isIssuedToConsideredAnonymous(record);

  if (record.sourceSystemRef && record.sourceSystemRef.toLowerCase() === 'ocers-csv') {
    // records imported from OCERS are not anonymous
    isAnonymous = false;
  }

  if (
    record.sourceSystemRef &&
    record.sourceSystemRef.toLowerCase() === 'nris-epd' &&
    record.dateIssued &&
    moment(record.dateIssued).isBefore('2020-01-01', 'YYYY-MM-DD')
  ) {
    // records imported from NRIS-EPD before January 1st 2020 are not anonymous
    isAnonymous = false;
  }

  return isAnonymous;
}

exports.isRecordConsideredAnonymous = isRecordConsideredAnonymous;

/**
 * Determine if a record.issuedTo sub-object is considered anonymous or not.
 *
 * A record.issuedTo sub-object is considered anonymous if the following are true:
 * - The issuedTo.type indicates a person (Individual, IndividualCombined) AND
 * - The issuedTo.dateOfBirth is null OR the issuedTo.dateOfBirth indicates the person is less than 19 years of age.
 *
 * Note: If insufficient information is provided, must assume anonymous.
 *
 * @param {*} record
 * @returns true if the record.issuedTo is considered anonymous, false otherwise.
 */
function isIssuedToConsideredAnonymous(record) {
  if (!record || !record.issuedTo) {
    // can't determine if issuedTo is anonymous or not, must assume anonymous
    return true;
  }

  if (record.issuedTo.type !== 'Individual' && record.issuedTo.type !== 'IndividualCombined') {
    // only individuals can be anonymous
    return false;
  }

  if (!record.issuedTo.dateOfBirth) {
    // individuals without birth dates are anonymous
    return true;
  }

  if (moment().diff(moment(record.issuedTo.dateOfBirth), 'years') < 19) {
    // individuals with birth dates and are under the age of 19 are anonymous
    return true;
  }

  // no contradicting evidence, assume not anonymous
  return false;
}

exports.isIssuedToConsideredAnonymous = isIssuedToConsideredAnonymous;

/**
 * Determine if the document is considered anonymous or not.
 *
 * A document is considered anonymous if the record it is associated with is considered anonymous.
 * - See isRecordConsideredAnonymous for details.
 *
 * Note: If insufficient information is provided, must assume anonymous.
 *
 * @param {*} masterRecord
 * @returns true if the document is considered anonymous, false otherwise.
 */
function isDocumentConsideredAnonymous(masterRecord) {
  if (!masterRecord) {
    // can't determine if document is anonymous or not, must assume anonymous
    return true;
  }

  return isRecordConsideredAnonymous(masterRecord);
}

exports.isDocumentConsideredAnonymous = isDocumentConsideredAnonymous;
