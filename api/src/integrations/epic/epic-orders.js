'use strict';

const mongoose = require('mongoose');
const defaultLog = require('../../utils/logger')('epic-orders');

/**
 * Epic Order record handler.
 *
 * Must contain the following functions:
 * - transformRecord: (object) => Order
 * - saveRecord: (Order) => any
 *
 * @class EpicOrders
 */
class EpicOrders {
  /**
   * Transform an Epic order record into a NRPTI Order record.
   *
   * @param {object} epicRecord Epic order record (required)
   * @returns {Order} NRPTI order record.
   * @throws {Error} if record is not provided.
   * @memberof EpicOrders
   */
  transformRecord(epicRecord) {
    if (!epicRecord) {
      throw Error('transformRecord - required record must be non-null.');
    }

    return {
      _schemaName: 'Order',
      documents: [
        {
          documentId: epicRecord._id || null,
          documentType: epicRecord.documentType || '',
          documentFileName: epicRecord.documentFileName || ''
        }
      ],
      read: ['sysadmin'],
      write: ['sysadmin']
    };
  }

  /**
   * Persist a NRPTI Order record to the database.
   *
   * @async
   * @param {Order} orderRecord NRPTI Order record (required)
   * @returns {string} status of the add/update operations.
   * @memberof EpicOrders
   */
  async saveRecord(orderRecord) {
    if (!orderRecord) {
      throw Error('saveRecord - required record must be non-null.');
    }

    // TODO Currently this always adds new records. Need to support updating existing records?
    try {
      let Order = mongoose.model('Order');

      const order = new Order(orderRecord);
      const dbStatus = await order.save();

      return dbStatus;
    } catch (error) {
      defaultLog.error(`Failed to save Epic Order record: ${error.message}`);
      defaultLog.debug(`Failed to save Epic Order record - error.stack: ${error.stack}`);
    }
  }
}

module.exports = EpicOrders;
