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

      read: ['sysadmin'],
      write: ['sysadmin'],

      recordName: epicRecord.displayName || '',
      issuingAgency: epicRecord.documentName || '',
      author: epicRecord.documentAuthor || '',
      type: `${epicRecord.documentType || ''} - ${epicRecord.milestone || ''}`,
      // quarter: // TODO
      // entityType: // TODO
      // issuedTo: // TODO
      // birthDate: // TODO
      description: epicRecord.description || '',
      // centroid: // TODO
      // location: // TODO
      // nationName: // N/A
      sourceSystemRef: 'epic',
      // legislation: // TODO
      // status: // N/A
      // relatedRecords:
      // outcomeDescription:
      project: epicRecord.project || '',
      // projectSector: // TODO
      // projectType: // TODO
      // penalty: // N/A
      // courtConvictionOutcome: // N/A
      // tabSelection: // TODO ??

      documentId: epicRecord._id || '', // TODO is this even allowed to be empty/null?
      documentType: epicRecord.documentType || '',
      documentFileName: epicRecord.documentFileName || '',
      documentDate: epicRecord.documentDate || null,

      // dateAdded - let default value take care of this field.
      dateUpdated: new Date(),

      sourceDateAdded: epicRecord.dateAdded || epicRecord._createdDate || null,
      sourceDateUpdated: epicRecord.dateUpdated || epicRecord._updatedDate || null
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
        { documentId: orderRecord.documentId },
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
