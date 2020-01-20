'use strict';

const mongoose = require('mongoose');
const defaultLog = require('../../utils/logger')('epic-orders');
const RECORD_TYPE = require('../../utils/constants/record-type-enum');
const { preTransformRecord } = require('./epic-utils');

/**
 * Epic Order record handler for { type: 'Order', milestone: 'Other' }.
 *
 * Must contain the following functions:
 * - transformRecord: (object) => Order
 * - saveRecord: (Order) => any
 *
 * @class EpicOrdersOther
 */
class EpicOrdersOther {
  /**
   * Creates an instance of EpicOrdersOther.
   *
   * @param {*} auth_payload user information for auditing
   * @memberof EpicOrdersOther
   */
  constructor(auth_payload) {
    this.auth_payload = auth_payload;
  }

  /**
   * Transform an Epic order record into a NRPTI Order record.
   *
   * @param {object} epicRecord Epic order record (required)
   * @returns {Order} NRPTI order record.
   * @throws {Error} if record is not provided.
   * @memberof EpicOrdersOther
   */
  async transformRecord(epicRecord) {
    if (!epicRecord) {
      throw Error('transformRecord - required record must be non-null.');
    }

    // Apply common Epic pre-processing/transformations
    epicRecord = preTransformRecord(epicRecord);

    return {
      _schemaName: RECORD_TYPE.Order._schemaName,
      _epicProjectId: (epicRecord.project && epicRecord.project._id) || '',
      _sourceRefId: epicRecord._id || '',
      _epicMilestoneId: epicRecord.milestone || '',

      read: ['sysadmin'],
      write: ['sysadmin'],

      recordName: epicRecord.displayName || '',
      recordType: RECORD_TYPE.Order.displayName,
      // recordSubtype: // No mapping
      dateIssued: epicRecord.documentDate || null,
      issuingAgency: 'Environmental Assessment Office',
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
   * @memberof EpicOrdersOther
   */
  async saveRecord(orderRecord) {
    if (!orderRecord) {
      throw Error('saveRecord - required record must be non-null.');
    }

    try {
      const Order = mongoose.model(RECORD_TYPE.Order._schemaName);

      const record = await Order.findOneAndUpdate(
        { _schemaName: RECORD_TYPE.Order._schemaName, _sourceRefId: orderRecord._sourceRefId },
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

module.exports = EpicOrdersOther;
