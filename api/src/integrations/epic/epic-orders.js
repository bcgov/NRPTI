'use strict';

const mongoose = require('mongoose');
const defaultLog = require('../../utils/logger')('epic-orders');
const axios = require('axios');
const hostPath = `https://${process.env.EPIC_API_HOSTNAME || 'eagle-prod.pathfinder.gov.bc.ca'}${process.env
  .EPIC_API_PROJECT_PATHNAME || '/api/project'}/`;

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

    let response = await axios.get(`${hostPath}${epicRecord.project}?fields=name|location|centroid|legislation`);
    var project = response.data[0];

    return {
      _schemaName: 'Order',
      _epicProjectId: epicRecord.project || '',
      _sourceRefId: epicRecord._id || '',
      _epicMilestoneId: epicRecord.milestone || '',

      read: ['sysadmin'],
      write: ['sysadmin'],

      recordName: epicRecord.displayName || '',
      recordType: epicRecord.documentType,
      // recordSubtype: // No mapping
      dateIssued: epicRecord.documentDate || null,
      issuingAgency: 'Environmental Assessment Office',
      author: epicRecord.documentAuthor || '',
      legislation: project.legislation,
      // issuedTo: // No mapping
      projectName: project.name || '',
      location: project.location || '',
      centroid: project.centroid || '',
      // outcomeStatus: // No mapping
      // outcomeDescription: // No mapping

      dateUpdated: new Date(),
      updatedBy: this.auth_payload.displayName,
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
