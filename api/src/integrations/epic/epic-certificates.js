'use strict';

const mongoose = require('mongoose');
const defaultLog = require('../../utils/logger')('epic-certificates');
const RECORD_TYPE = require('../../utils/constants/record-type-enum');
const { preTransformRecord } = require('./epic-utils');

/**
 * Epic Certificate record handler for { type: 'Certificate Package', milestone: 'Certificate' }.
 *
 * Must contain the following functions:
 * - transformRecord: (object) => Certificate
 * - saveRecord: (Certificate) => any
 *
 * @class EpicCertificates
 */
class EpicCertificates {
  /**
   * Creates an instance of EpicCertificates.
   *
   * @param {*} auth_payload user information for auditing
   * @memberof EpicCertificates
   */
  constructor(auth_payload) {
    this.auth_payload = auth_payload;
  }

  /**
   * Transform an Epic certificate record into a NRPTI Certificate record.
   *
   * @param {object} epicRecord Epic certificate record (required)
   * @returns {Certificate} NRPTI certificate record.
   * @throws {Error} if record is not provided.
   * @memberof EpicCertificates
   */
  async transformRecord(epicRecord) {
    if (!epicRecord) {
      throw Error('transformRecord - required record must be non-null.');
    }

    // Apply common Epic pre-processing/transformations
    epicRecord = preTransformRecord(epicRecord);

    return {
      _schemaName: RECORD_TYPE.Certificate._schemaName,
      _epicProjectId: (epicRecord.project && epicRecord.project._id) || '',
      _sourceRefId: epicRecord._id || '',
      _epicMilestoneId: epicRecord.milestone || '',

      read: ['sysadmin'],
      write: ['sysadmin'],

      recordName: epicRecord.displayName || '',
      recordType: RECORD_TYPE.Certificate.displayName,
      dateIssued: epicRecord.documentDate || null,
      issuingAgency: 'Environmental Assessment Office',
      author: epicRecord.documentAuthor || '',
      legislation: (epicRecord.project && epicRecord.project.legislation) || '',
      projectName: (epicRecord.project && epicRecord.project.name) || '',
      location: (epicRecord.project && epicRecord.project.location) || '',
      centroid: (epicRecord.project && epicRecord.project.centroid) || '',

      dateAdded: new Date(),
      dateUpdated: new Date(),
      updatedBy: (this.auth_payload && this.auth_payload.displayName) || '',
      sourceDateAdded: epicRecord.dateAdded || epicRecord._createdDate || null,
      sourceDateUpdated: epicRecord.dateUpdated || epicRecord._updatedDate || null,
      sourceSystemRef: 'epic'
    };
  }

  /**
   * Persist a NRPTI Certificate record to the database.
   *
   * @async
   * @param {Certificate} certificateRecord NRPTI Certificate record (required)
   * @returns {string} status of the add/update operations.
   * @memberof EpicCertificates
   */
  async saveRecord(certificateRecord) {
    if (!certificateRecord) {
      throw Error('saveRecord - required record must be non-null.');
    }

    try {
      const Certificate = mongoose.model(RECORD_TYPE.Certificate._schemaName);

      const record = await Certificate.findOneAndUpdate(
        { _schemaName: RECORD_TYPE.Certificate._schemaName, _sourceRefId: certificateRecord._sourceRefId },
        { $set: certificateRecord },
        { upsert: true, new: true }
      );

      return record;
    } catch (error) {
      defaultLog.error(`Failed to save Epic Certificate record: ${error.message}`);
      defaultLog.debug(`Failed to save Epic Certificate record - error.stack: ${error.stack}`);
    }
  }
}

module.exports = EpicCertificates;
