'use strict';

const mongoose = require('mongoose');
const defaultLog = require('../../utils/logger')('epic-inspections');
const axios = require('axios');
const hostPath = `https://${process.env.EPIC_API_HOSTNAME || 'eagle-prod.pathfinder.gov.bc.ca'}${process.env
  .EPIC_API_PROJECT_PATHNAME || '/api/project'}/`;

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

    let response = await axios.get(`${hostPath}${epicRecord.project}?fields=name|location|centroid|legislation`);
    var project = response.data[0];

    return {
      _schemaName: 'Inspection',
      _epicProjectId: epicRecord.project || '',
      _sourceRefId: epicRecord._id || '',
      _epicMilestoneId: epicRecord.milestone || '',

      read: ['sysadmin'],
      write: ['sysadmin'],

      recordName: epicRecord.displayName || '',
      recordType: epicRecord.documentType,
      dateIssued: epicRecord.documentDate || null,
      issuingAgency: 'Environmental Assessment Office',
      author: epicRecord.documentAuthor || '',
      legislation: project.legislation,
      // issuedTo: // TODO
      projectName: project.name || '',
      location: project.location || '',
      centroid: project.centroid || '',
      // outcomeStatus: // TODO
      // outcomeDescription: // TODO

      dateAdded: new Date(),
      dateUpdated: new Date(),
      updatedBy: this.auth_payload.displayName,
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
