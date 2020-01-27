'use strict';

const mongoose = require('mongoose');
const defaultLog = require('../../utils/logger')('epic-inspections');

/**
 * Epic Inspection record handler.
 *
 * Must contain the following functions:
 * - transformRecord: (object) => Inspection
 * - saveRecord: (Inspection) => any
 *
 * @class EpicInspections
 */
class EpicInspections {
  constructor(auth_payload) {
    this.auth_payload = auth_payload;
  }

  /**
   * Transform an Epic inspection record into a NRPTI Inspection record.
   *
   * @param {object} epicRecord Epic inspection record (required)
   * @returns {Inspection} NRPTI inspection record.
   * @throws {Error} if record is not provided.
   * @memberof EpicInspections
   */
  async transformRecord(epicRecord) {
    if (!epicRecord) {
      throw Error('transformRecord - required record must be non-null.');
    }

    // Project names must change to how we name them in NRPTI
    if (epicRecord.project && epicRecord.project.name) {
      switch (epicRecord.project.name) {
        case 'LNG Canada Export Terminal':
          epicRecord.project.name = 'LNG Canada';
          break;
        case 'Coastal GasLink Pipeline':
          epicRecord.project.name = 'Coastal Gaslink';
      }
    }

    return {
      _schemaName: 'Inspection',
      _epicProjectId: (epicRecord.project && epicRecord.project._id) || '',
      _sourceRefId: epicRecord._id || '',
      _epicMilestoneId: epicRecord.milestone || '',

      read: ['sysadmin'],
      write: ['sysadmin'],

      recordName: epicRecord.displayName || '',
      recordType: 'Inspection',
      // recordSubtype: // No mapping
      dateIssued: epicRecord.datePosted || null,
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
   * Persist a NRPTI Inspection record to the database.
   *
   * @async
   * @param {Inspection} inspectionRecord NRPTI Inspection record (required)
   * @returns {string} status of the add/update operations.
   * @memberof EpicInspections
   */
  async saveRecord(inspectionRecord) {
    if (!inspectionRecord) {
      throw Error('saveRecord - required record must be non-null.');
    }

    try {
      const Inspection = mongoose.model('Inspection');

      const record = await Inspection.findOneAndUpdate(
        { _schemaName: 'Inspection', _sourceRefId: inspectionRecord._sourceRefId },
        { $set: inspectionRecord },
        { upsert: true, new: true }
      );

      return record;
    } catch (error) {
      defaultLog.error(`Failed to save Epic Inspection record: ${error.message}`);
      defaultLog.debug(`Failed to save Epic Inspection record - error.stack: ${error.stack}`);
    }
  }
}

module.exports = EpicInspections;
