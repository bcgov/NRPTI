'use strict';

const BaseRecordUtils = require('./base-record-utils');
/**
 * Epic Certificate record handler for:
 *  - { type: 'Certificate Package', milestone: 'Certificate' }.
 *
 * @class Certificates
 */
class Certificates extends BaseRecordUtils {
  /**
   * Creates an instance of Certificates.
   *
   * @param {*} auth_payload user information for auditing
   * @param {*} recordType an item from record-type-enum.js -> RECORD_TYPE
   * @memberof Certificates
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
   * @memberof Certificates
   */
  async transformRecord(epicRecord) {
    if (!epicRecord) {
      throw Error('transformRecord - required record must be non-null.');
    }

    return {
      ...(await super.transformRecord(epicRecord)),
      issuingAgency: 'Environmental Assessment Office',
      legislation: [{
        act: (epicRecord.project && epicRecord.project.legislation) || ''
      }]
    };
  }
}

module.exports = Certificates;
