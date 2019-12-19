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
  /**
   * Transform an Epic inspection record into a NRPTI Inspection record.
   *
   * @param {object} epicRecord Epic inspection record (required)
   * @returns {Inspection} NRPTI inspection record.
   * @throws {Error} if record is not provided.
   * @memberof EpicInspections
   */
  transformRecord(epicRecord) {
    if (!epicRecord) {
      throw Error('transformRecord - required record must be non-null.');
    }

    return {
      _schemaName: 'Inspection',

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
        { documentId: inspectionRecord.documentId },
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
