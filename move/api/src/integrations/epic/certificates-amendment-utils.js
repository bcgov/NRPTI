'use strict';

const BaseRecordUtils = require('./base-record-utils');
/**
 * Epic Certificate record handler for:
 *  - { type: 'Amendment Package', milestone: 'Amendment' }.
 *
 * @class CertificatesAmendment
 */
class CertificatesAmendment extends BaseRecordUtils {
  /**
   * Creates an instance of CertificatesAmendment.
   *
   * @param {*} auth_payload user information for auditing
   * @param {*} recordType an item from record-type-enum.js -> RECORD_TYPE
   * @memberof CertificatesAmendment
   */
  constructor(auth_payload, recordType) {
    super(auth_payload, recordType);
  }

  /**
   * Transform an Epic certificate record into a NRPTI Certificate record.
   *
   * @param {object} epicRecord Epic certificate record (required)
   * @returns {Certificate} NRPTI certificate record.
   * @throws {Error} if record is not provided.
   * @memberof CertificatesAmendment
   */
  async transformRecord(epicRecord) {
    if (!epicRecord) {
      throw Error('transformRecord - required record must be non-null.');
    }

    return {
      ...(await super.transformRecord(epicRecord)),
      issuingAgency: 'AGENCY_EAO',
      legislation: [
        {
          act: (epicRecord.project && epicRecord.project.legislation) || ''
        }
      ]
    };
  }
}

module.exports = CertificatesAmendment;
