'use strict';

const mongoose = require('mongoose');
const defaultLog = require('../../utils/logger')('epic-certificates');
const RECORD_TYPE = require('../../utils/constants/record-type-enum');
const EpicUtils = require('./epic-utils');

/**
 * Epic Certificate record handler for { type: 'Certificate Package', milestone: 'Certificate' }.
 *
 * Must contain the following functions:
 * - transformRecord: (object) => Certificate
 * - saveRecord: (Certificate) => any
 *
 * @class Certificates
 */
class Certificates {
  /**
   * Creates an instance of Certificates.
   *
   * @param {*} auth_payload user information for auditing
   * @memberof Certificates
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
   * @memberof Certificates
   */
  async transformRecord(epicRecord) {
    if (!epicRecord) {
      throw Error('transformRecord - required record must be non-null.');
    }

    // Apply common Epic pre-processing/transformations
    epicRecord = EpicUtils.preTransformRecord(epicRecord);

    // Creating and saving a document object if we are given a link to an EPIC document.
    const documents = [];
    if (epicRecord._id && epicRecord.documentFileName) {
      const savedDocument = await DocumentController.createLinkDocument(
        epicRecord.documentFileName,
        (this.auth_payload && this.auth_payload.displayName) || '',
        `https://projects.eao.gov.bc.ca/api/document/${epicRecord._id}/fetch/${encodeURIComponent(
          epicRecord.documentFileName
        )}`
      );
      documents.push(savedDocument);
    }

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
      documents: documents,

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
   * @memberof Certificates
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
    }
  }
}

module.exports = Certificates;
