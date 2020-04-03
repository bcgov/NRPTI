'use strict';

const mongoose = require('mongoose');
const ObjectID = require('mongodb').ObjectID;
const defaultLog = require('../../utils/logger')('epic-base-record-utils');
const EpicUtils = require('./epic-utils');
const DocumentController = require('./../../controllers/document-controller');
const RecordController = require('./../../controllers/record-controller');

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
   * Create a new document, and return an array of _ids.
   *
   * @param {*} epicRecord Epic record
   * @returns {Array<string>} array of ObjectIds
   * @memberof BaseRecordUtils
   */
  async createDocument(epicRecord) {
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
   * Deletes any document records linked to by the provided NRPTI record.
   *
   * @param {object} nrptiRecord NRPTI record.
   * @returns
   * @memberof BaseRecordUtils
   */
  async removeDocuments(nrptiRecord) {
    if (!nrptiRecord || !nrptiRecord.documents || !nrptiRecord.documents.length) {
      return;
    }

    const DocumentModel = mongoose.model('Document');

    const documentIds = nrptiRecord.documents.map(id => new ObjectID(id));

    // Check if any documents uploaded to S3, and delete if any
    for (let idx = 0; idx < documentIds.length; idx++) {
      const document = await DocumentModel.findOne({ _id: documentIds[idx] });

      if (document && document.key) {
        await DocumentController.deleteS3Document(document.key);
      }
    }

    // Delete local document record/meta
    await DocumentModel.deleteMany({ _id: { $in: documentIds } });
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

    return {
      _schemaName: this.recordType._schemaName,
      _epicProjectId: (epicRecord.project && epicRecord.project._id) || '',
      _sourceRefId: new ObjectID(epicRecord._id) || '',
      _epicMilestoneId: epicRecord.milestone || '',

      recordName: epicRecord.displayName || '',
      recordType: this.recordType.displayName,
      dateIssued: epicRecord.documentDate || null,
      description: epicRecord.description || '',
      projectName: (epicRecord.project && epicRecord.project.name) || '',
      location: (epicRecord.project && epicRecord.project.location) || '',
      centroid: (epicRecord.project && epicRecord.project.centroid) || '',

      dateAdded: new Date(),
      dateUpdated: new Date(),

      addedBy: (this.auth_payload && this.auth_payload.displayName) || '',
      updatedBy: (this.auth_payload && this.auth_payload.displayName) || '',

      sourceDateAdded: epicRecord.dateAdded || epicRecord._createdDate || null,
      sourceDateUpdated: epicRecord.dateUpdated || epicRecord._updatedDate || null,
      sourceSystemRef: 'epic'
    };
  }

  /**
   * Searches for an existing master record, and returns it if found.
   *
   * @param {*} nrptiRecord
   * @returns {object} existing NRPTI master record or null if none found
   * @memberof BaseRecordUtils
   */
  async findExistingRecord(nrptiRecord) {
    const masterRecordModel = mongoose.model(this.recordType._schemaName);

    return await masterRecordModel
      .findOne({
        _schemaName: this.recordType._schemaName,
        _sourceRefId: nrptiRecord._sourceRefId
      })
      .populate('_flavourRecords');
  }

  /**
   * Update an existing NRPTI master record and its flavour records (if any).
   *
   * @param {*} nrptiRecord
   * @param {*} existingRecord
   * @returns {object} object containing the update master and flavour records (if any)
   * @memberof BaseRecordUtils
   */
  async updateRecord(nrptiRecord, existingRecord) {
    if (!nrptiRecord) {
      throw Error('updateRecord - required nrptiRecord must be non-null.');
    }

    if (!existingRecord) {
      throw Error('updateRecord - required existingRecord must be non-null.');
    }

    try {
      // build update Obj, which needs to include the flavour record ids
      const updateObj = { ...nrptiRecord };
      existingRecord._flavourRecords.forEach(flavourRecord => {
        updateObj[flavourRecord._schemaName] = { _id: flavourRecord._id, addRole: 'public' };
      });

      return await RecordController.processPutRequest(
        { swagger: { params: { auth_payload: this.auth_payload } } },
        null,
        null,
        this.recordType.recordControllerName,
        [updateObj]
      );
    } catch (error) {
      defaultLog.error(`Failed to save ${this.recordType._schemaName} record: ${error.message}`);
    }
  }

  /**
   * Create a new NRPTI master record.
   *
   * @async
   * @param {object} nrptiRecord NRPTI record (required)
   * @returns {object} object containing the newly inserted master and flavour records
   * @memberof BaseRecordUtils
   */
  async createRecord(nrptiRecord) {
    if (!nrptiRecord) {
      throw Error('saveRecord - required nrptiRecord must be non-null.');
    }

    try {
      // build create Obj, which should include the flavour record details
      const createObj = { ...nrptiRecord };

      if (this.recordType.flavours.lng) {
        createObj[this.recordType.flavours.lng._schemaName] = {
          description: nrptiRecord.description || '',
          addRole: 'public'
        };
      }

      if (this.recordType.flavours.nrced) {
        createObj[this.recordType.flavours.nrced._schemaName] = {
          summary: nrptiRecord.description || '',
          addRole: 'public'
        };
      }

      return await RecordController.processPostRequest(
        { swagger: { params: { auth_payload: this.auth_payload } } },
        null,
        null,
        this.recordType.recordControllerName,
        [createObj]
      );
    } catch (error) {
      defaultLog.error(`Failed to save ${this.recordType._schemaName} record: ${error.message}`);
    }
  }
}

module.exports = BaseRecordUtils;
