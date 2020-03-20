'use strict';

const BaseRecordUtils = require('./base-record-utils');
/**
 * Epic Orders record handler for:
 *  - { type: 'Order', milestone: 'Compliance & Enforcement' }.
 *
 * @class Orders
 */
class Orders extends BaseRecordUtils {
  /**
   * Creates an instance of Orders.
   *
   * @param {*} auth_payload user information for auditing
   * @param {*} recordType an item from record-type-enum.js -> RECORD_TYPE
   * @memberof Orders
   */
  constructor(auth_payload, recordType) {
    super(auth_payload, recordType);
  }

  /**
   * Transform an Epic order record into a NRPTI Order record.
   *
   * @param {object} epicRecord Epic order record (required)
   * @returns {Order} NRPTI order record.
   * @throws {Error} if record is not provided.
   * @memberof Orders
   */
  async transformRecord(epicRecord) {
    if (!epicRecord) {
      throw Error('transformRecord - required record must be non-null.');
    }

    return {
      ...(await super.transformRecord(epicRecord)),
      issuingAgency: 'Environmental Assessment Office',
      author: epicRecord.documentAuthor || '',
      legislation: {
        act: (epicRecord.project && epicRecord.project.legislation) || ''
      }
    };
  }
}

module.exports = Orders;
