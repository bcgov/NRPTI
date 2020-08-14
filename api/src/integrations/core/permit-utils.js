'use strict';
const mongoose = require('mongoose');

const BaseRecordUtils = require('./base-record-utils');

/**
 * CORE Mine permit record handler.
 *
 * @class Permit
 */
class Permits extends BaseRecordUtils {
  /**
   * Creates an instance of Permits.
   *
   * @param {*} auth_payload user information for auditing
   * @param {*} recordType an item from record-type-enum.js -> RECORD_TYPE
   * @memberof Permits
   */
  constructor(auth_payload, recordType) {
    if (!auth_payload) {
      throw new Error('PermitUtils - required auth_payload must be non-null.');
    }

    if (!recordType) {
      throw new Error('PermitUtils - required recordType must be non-null.');
    }

    super(auth_payload, recordType);
  }

  /**
   * Transform an CORE mine permit record into a NRPTI Mine record.
   *
   * @param {object} permit Core mine permit record (required)
   * @param {object} mineRecord Core mine record.
   * @returns {PermitBCMI} NRPTI mine permit record.
   * @memberof Permits
   */
  transformRecord(permit, mineRecord) {
    if (!permit || !permit.permit_amendments || !permit.permit_amendments.length) {
      throw new Error('transformRecords - required permits must be non-null.');
    }

    if (!mineRecord) {
      throw new Error('transformRecords - required mineRecord must be non-null.')
    }

    const permits = [];
    for (const amendment of permit.permit_amendments) {
      // Create a permit for each document in the amendment.
      if (!amendment.related_documents.length) {
        continue;
      }

      for (const document of amendment.related_documents) {
        permits.push({
          ...super.transformRecord(permit),
          _sourceRefId: amendment.permit_amendment_guid || '',
          amendmentStatusCode: amendment.permit_amendment_status_code || '',
          typeCode: amendment.permit_amendment_type_code || '',
          sourceDateAdded: amendment.received_date || null,
          dateIssued:  amendment.issue_date || null,

          permitNumber: permit.permit_no || '',
          permitStatusCode: permit.permit_status_code || '',
          issuedTo: {
            type: 'Company',
            companyName: permit.current_permittee || '',
            fullName: permit.current_permittee || ''
          },

          _sourceDocumentRefId: document.document_manager_guid || '',
          recordName: document.document_name,
          mineGuid: document.mine_guid || '',

          projectName: mineRecord.name || '',
          centroid: (mineRecord.location && mineRecord.location.coordinates) || [],

          issuingAgency: 'EMPR'
        });
      }
    }

    return permits;
  }

  async updateRecord(permitId, newPermit) {
    const Permit = mongoose.model('Permit');
    const existingPermit = await Permit.find({ _id: permitId });

    return await super.updateRecord(existingPermit, newPermit);
  }

  async getMinePermits(mineId) {
    const Permit = mongoose.model('Permit');
    const permits = await Permit.find({ _schemaName: 'Permit', mineGuid: mineId });

    return permits;
  }
}

module.exports = Permits;
