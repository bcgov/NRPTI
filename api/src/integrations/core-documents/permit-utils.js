'use strict';

const BaseRecordUtils = require('./base-record-utils');

/**
 * CORE Mine permit record handler.
 *
 * @class PermitAmendments
 */
class Permits extends BaseRecordUtils {
  /**
   * Creates an instance of MinePermit.
   *
   * @param {*} auth_payload user information for auditing
   * @param {*} recordType an item from record-type-enum.js -> RECORD_TYPE
   * @memberof Permits
   */
  constructor(auth_payload, recordType) {
    if (!auth_payload) {
      throw Error('PermitAmendmentUtils - required auth_payload must be non-null.');
    }

    if (!recordType) {
      throw Error('PermitAmendmentUtils - required recordType must be non-null.');
    }

    super(auth_payload, recordType);
  }

  /**
   * Transform an CORE mine permit record permit.
   *
   * @param {Permit} permit Core mine permit record (required)
   * @returns {Permit} NRPTI mine permit record.
   * @memberof Permits
   */
  transformRecord(permit) {
    if (!permit) {
      throw Error('transformRecords - required amendment must be non-null.');
    }

    return  {
      ...super.transformRecord(permit),
      _sourceRefId: permit._sourceRefId || '',
      _flavourRecords: permit._flavourRecords || [],
      amendmentStatusCode: permit.amendmentStatusCode || '',
      typeCode: permit.typeCode || '',
      sourceDateAdded: permit.sourceDateAdded || null,
      dateIssued:  permit.dateIssued || null,
      permitNumber: permit.permitNumber || '',
      permitStatusCode: permit.permitStatusCode || '',
      _sourceDocumentRefId: permit._sourceDocumentRefId || '',
      recordName: permit.recordName,
      mineGuid: permit.mineGuid || '',
      documents: permit.documents || [],
      agency: permit.agency || ''
    }
  }
}

module.exports = Permits;
