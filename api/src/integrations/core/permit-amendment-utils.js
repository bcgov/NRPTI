'use strict';

const BaseRecordUtils = require('./base-record-utils');

/**
 * CORE Mine permit amendment record handler.
 *
 * @class PermitAmendments
 */
class PermitAmendments extends BaseRecordUtils {
  /**
   * Creates an instance of MinePermit.
   *
   * @param {*} auth_payload user information for auditing
   * @param {*} recordType an item from record-type-enum.js -> RECORD_TYPE
   * @memberof PermitAmendments
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
   * Transform an CORE mine permit record permit amendments.
   *
   * @param {object} permit Core mine permit record (required)
   * @returns {PermitAmendmentsBCMI[]} NRPTI mine permit record.
   * @memberof PermitAmendments
   */
  transformRecords(permit) {
    if (!permit || !permit.permit_amendments || !permit.permit_amendments.length) {
      throw Error('transformRecords - required permits must be non-null.');
    }

    return  permit.permit_amendments.map(amendment => ({
      ...super.transformRecord(permit),
      _sourceRefId: amendment.permit_amendment_guid || '',
      statusCode: amendment.permit_amendment_status_code || '',
      typeCode: amendment.permit_amendment_type_code || '',
      receivedDate: amendment.received_date || null,
      issueDate: amendment.issue_date || null,
      authorizedEndDate: amendment.authorized_end_date || null,
      description: amendment.description,
      amendmentDocuments: amendment.related_documents.map(document => ({
        _sourceRefId: document.document_manager_guid,
        documentName: document.document_name,
        documentId: null
      }))
    }));
  }

  /**
   * Saves transformed permit amendments.
   * 
   * @param {object[]} amendments Core permit amendments
   * @returns {PermitAmendment}
   * @memberof PermitAmendments
   */
  async createRecord(amendment) {
    const result = await super.createRecord(amendment);
    if (result[0] && result[0].object && result[0].object[0]) {
      return result[0].object[0];
    }
  }

  /**
   * Updates transformed permit amendments.
   * 
   * @param {object[]} amendments Core permit amendments
   * @returns {PermitAmendment}
   * @memberof PermitAmendments
   */
  async updateRecord(amendment, existingRecord) {
    const result = await super.updateRecord(amendment, existingRecord);
    if (result[0] && result[0].object && result[0].object[0]) {
      return result[0].object[0];
    }
  }
}

module.exports = PermitAmendments;
