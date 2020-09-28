'use strict';

const BaseRecordUtils = require('./base-record-utils');
/**
 * Epic Management Plan record handler for:
 *  - { type: 'Plan', milestone: 'Post-Decision Materials' }
 *  - { type: 'Management Plan', milestone: 'Post-Decision Materials' }
 *
 * @class ManagementPlans
 */
class ManagementPlans extends BaseRecordUtils {
  /**
   * Creates an instance of ManagementPlans.
   *
   * @param {*} auth_payload user information for auditing
   * @param {*} recordType an item from record-type-enum.js -> RECORD_TYPE
   * @memberof ManagementPlans
   */
  constructor(auth_payload, recordType) {
    super(auth_payload, recordType);
  }

  /**
   * Transform an Epic management plan record into a NRPTI ManagementPlan record.
   *
   * @param {object} epicRecord Epic management plan record (required)
   * @returns {ManagementPlan} NRPTI management plan record.
   * @throws {Error} if record is not provided.
   * @memberof ManagementPlans
   */
  async transformRecord(epicRecord) {
    if (!epicRecord) {
      throw Error('transformRecord - required record must be non-null.');
    }

    return {
      ...(await super.transformRecord(epicRecord)),
      issuingAgency: 'EAO',
      author: epicRecord.documentAuthor || ''
    };
  }
}

module.exports = ManagementPlans;
