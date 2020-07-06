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
   * @param {PermitAmendment} amendment Core mine permit record (required)
   * @returns {PermitAmendment} NRPTI mine permit record.
   * @memberof PermitAmendments
   */
  transformRecord(amendment) {
    if (!amendment) {
      throw Error('transformRecords - required amendment must be non-null.');
    }

    return  {
      ...super.transformRecord(amendment),
      _sourceRefId: amendment._sourceRefId || '',
      _flavourRecords: amendment._flavourRecords || [],
      statusCode: amendment.statusCode || '',
      typeCode: amendment.typeCode || '',
      receivedDate: amendment.receivedDate || null,
      issueDate: amendment.issueDate || null,
      authorizedEndDate: amendment.authorizedEndDate || null,
      description: amendment.description || '',
      documents: amendment.documents.map(document => ({
        _sourceRefId: document._sourceRefId,
        documentName: document.documentName,
        documentId: document.documentId
      }))
    }
  }
}

module.exports = PermitAmendments;
