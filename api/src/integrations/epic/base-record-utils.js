'use strict';

const mongoose = require('mongoose');
const defaultLog = require('../../utils/logger')('epic-base-record-utils');
const EpicUtils = require('./epic-utils');
const DocumentController = require('./../../controllers/document-controller');

const EPIC_PUBLIC_HOSTNAME = process.env.EPIC_PUBLIC_HOSTNAME || 'https://projects.eao.gov.bc.ca';

/**
 * Epic base record type handler that can be used directly, or extended if customizations are needed.
 *
 * Must contain the following functions:
 * - transformRecord: (object) => object
 * - saveRecord: (object) => any
 *
 * @class BaseRecordUtils
 */
class BaseRecordUtils {
  /**
   * Creates an instance of BaseRecordUtils.
   *
   * @param {*} auth_payload user information for auditing
   * @param {*} recordType an item from record-type-enum.js -> RECORD_TYPE
   * @memberof BaseRecordUtils
   */
  constructor(auth_payload, recordType) {
    if (!recordType) {
      throw Error('BaseRecordUtils - required recordType must be non-null.');
    }

    this.auth_payload = auth_payload;
    this.recordType = recordType;
  }

  /**
   * Persist an epic record to the database, and return an array of ObjectIds.
   *
   * @param {*} epicRecord Epic record
   * @returns {Array<string>} array of ObjectIds
   * @memberof BaseRecordUtils
   */
  async saveDocument(epicRecord) {
    const documents = [];

    if (epicRecord && epicRecord._id && epicRecord.documentFileName) {
      const savedDocument = await DocumentController.createDocument(
        epicRecord.documentFileName,
        (this.auth_payload && this.auth_payload.displayName) || '',
        `${EPIC_PUBLIC_HOSTNAME}/api/document/${epicRecord._id}/fetch/${encodeURIComponent(
          epicRecord.documentFileName
        )}`
      );

      documents.push(savedDocument._id);
    }

    return documents;
  }

  /**
   * Transform an Epic record into a NRPTI record.
   *
   * Note: Only transforms common fields found in ALL supported epic import types.
   *       To include other values, extend this class and adjust the object returned by this function as needed.
   *
   * @param {object} epicRecord Epic record (required)
   * @returns {object} NRPTI record.
   * @throws {Error} if record is not provided.
   * @memberof BaseRecordUtils
   */
  async transformRecord(epicRecord) {
    if (!epicRecord) {
      throw Error('transformRecord - required epicRecord must be non-null.');
    }

    // Apply common Epic pre-processing/transformations
    epicRecord = EpicUtils.preTransformRecord(epicRecord, this.recordType);

    // Creating and saving a document object if we are given a link to an EPIC document.
    const documents = await this.saveDocument(epicRecord);

    return {
      _schemaName: this.recordType._schemaName,
      _epicProjectId: (epicRecord.project && epicRecord.project._id) || '',
      _sourceRefId: epicRecord._id || '',
      _epicMilestoneId: epicRecord.milestone || '',

      read: ['sysadmin'],
      write: ['sysadmin'],

      recordName: epicRecord.displayName || '',
      recordType: this.recordType.displayName,
      dateIssued: epicRecord.documentDate || null,
      description: epicRecord.description || '',
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
   * Persist a NRPTI record to the database.
   *
   * @async
   * @param {object} nrptiRecord NRPTI record (required)
   * @returns {string} status of the add/update operations.
   * @memberof BaseRecordUtils
   */
  async saveRecord(nrptiRecord) {
    if (!nrptiRecord) {
      throw Error('saveRecord - required nrptiRecord must be non-null.');
    }

    try {
      const nrptiRecordModel = mongoose.model(this.recordType._schemaName);

      const record = await nrptiRecordModel.findOneAndUpdate(
        { _schemaName: this.recordType._schemaName, _sourceRefId: nrptiRecord._sourceRefId },
        { $set: nrptiRecord },
        { upsert: true, new: true }
      );

      return record;
    } catch (error) {
      defaultLog.error(`Failed to save ${this.recordType._schemaName} record: ${error.message}`);
    }
  }
}

module.exports = BaseRecordUtils;
