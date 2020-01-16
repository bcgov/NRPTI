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
  constructor(auth_payload) {
    this.auth_payload = auth_payload;
  }

  /**
   * Transform an Epic order record into a NRPTI Order record.
   *
   * @param {object} epicRecord Epic order record (required)
   * @returns {Order} NRPTI order record.
   * @throws {Error} if record is not provided.
   * @memberof EpicOrders
   */
  async transformRecord(epicRecord) {
    if (!epicRecord) {
      throw Error('transformRecord - required record must be non-null.');
    }

    return {
      _schemaName: 'Order',
      _epicProjectId: (epicRecord.project && epicRecord.project._id) || '',
      _sourceRefId: epicRecord._id || '',
      _epicMilestoneId: epicRecord.milestone || '',

      read: ['sysadmin'],
      write: ['sysadmin'],

      recordName: epicRecord.displayName || '',
      recordType: epicRecord.documentType || '',
      // recordSubtype: // No mapping
      dateIssued: epicRecord.documentDate || null,
      issuingAgency: 'Environmental Assessment Agency',
      author: epicRecord.documentAuthor || '',
      legislation: (epicRecord.project && epicRecord.project.legislation) || '',
      // issuedTo: // No mapping
      projectName: (epicRecord.project && epicRecord.project.name) || '',
      location: (epicRecord.project && epicRecord.project.location) || '',
      centroid: (epicRecord.project && epicRecord.project.centroid) || '',
      // outcomeStatus: // No mapping
      // outcomeDescription: // No mapping

      dateAdded: new Date(),
      dateUpdated: new Date(),
      updatedBy: (this.auth_payload && this.auth_payload.displayName) || '',
      sourceDateAdded: epicRecord.dateAdded || epicRecord._createdDate || null,
      sourceDateUpdated: epicRecord.dateUpdated || epicRecord._updatedDate || null,
      sourceSystemRef: 'epic'
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

    try {
      const Order = mongoose.model('Order');

      const record = await Order.findOneAndUpdate(
        { _schemaName: 'Order', _sourceRefId: orderRecord._sourceRefId },
        { $set: orderRecord },
        { upsert: true, new: true }
      );

      return record;
    } catch (error) {
      defaultLog.error(`Failed to save Epic Order record: ${error.message}`);
      defaultLog.debug(`Failed to save Epic Order record - error.stack: ${error.stack}`);
    }
  }
}

module.exports = EpicOrders;
