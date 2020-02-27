'use strict';

const Orders = require('./orders-utils');
/**
 * Epic Orders record handler for:
 *  - { type: 'Order', milestone: 'Other' }.
 *
 * @class OrdersOther
 */
class OrdersOther extends Orders {
  /**
   * Creates an instance of OrdersOther.
   *
   * @param {*} auth_payload user information for auditing
   * @param {*} recordType an item from record-type-enum.js -> RECORD_TYPE
   * @memberof OrdersOther
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
   * @memberof OrdersOther
   */
  async transformRecord(epicRecord) {
    if (!epicRecord) {
      throw Error('transformRecord - required record must be non-null.');
    }

    return {
      ...(await super.transformRecord(epicRecord)),
      recordSubtype: 'Other'
    };
  }
}

module.exports = OrdersOther;
