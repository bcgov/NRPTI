'use strict';

const defaultLog = require('../utils/logger')('record');

/**
 * This file contains query builder utility functions.
 */

const mongoose = require('mongoose');
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

exports.audit = function(req, action, meta, authPayload, objId = null) {
  try {
    if (!req.audits) {
      req.audits = [];
    }

    req.audits.push(this.recordAction(action, meta, authPayload, objId));
  } catch (err) {
    defaultLog.error('Failed to add Audit log request. ' + err);
  }
};
exports.recordAction = async function(action, meta, authPayload, objId = null) {
  try {
    let performedBy = authPayload
      ? JSON.stringify({
          idir_userid: authPayload.idir_userid || null,
          displayName: authPayload.displayName || null,
          preferred_username: authPayload.preferred_username || null
        })
      : null;

    const Audit = mongoose.model('Audit');
    const audit = new Audit({
      _objectSchema: 'Query',
      action: action,
      meta: meta,
      objId: objId,
      performedBy: performedBy
    });
    return await audit.save();
  } catch (err) {
    defaultLog.error('Failed to create Audit log. ' + err);
    return;
  }
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
  'CourtConviction',
  'MineBCMI',
  'AnnualReport',
  'AnnualReportBCMI',
  'CertificateAmendment',
  'CertificateAmendmentLNG',
  'CertificateAmendmentBCMI',
  'DamSafetyInspection',
  'DamSafetyInspectionBCMI',
  'DamSafetyInspectionNRCED',
  'Correspondence',
  'CorrespondenceBCMI',
  'CorrespondenceNRCED',
  'Report',
  'ReportBCMI',
  'ReportNRCED'
];
