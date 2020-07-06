'use strict';

const mongoose = require('mongoose');

const defaultLog = require('../../utils/logger')('core-base-record-utils');
const RecordController = require('../../controllers/record-controller');

/**
 * Core base record type handler that can be used directly, or extended if customizations are needed.
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

    if (!auth_payload) {
      throw Error('BaseRecordUtils - required auth_payload must be non-null.');
    }

    this.auth_payload = auth_payload;
    this.recordType = recordType;
  }

  /**
   * Transform an Core record into a NRPTI record.
   *
   * Note: Only transforms common fields found in ALL supported core import types.
   *       To include other values, extend this class and adjust the object returned by this function as needed.
   *
   * @param {object} coreRecord Core record (required)
   * @returns {object} NRPTI record.
   * @throws {Error} if record is not provided.
   * @memberof BaseRecordUtils
   */
  transformRecord(coreRecord) {
    if (!coreRecord) {
      throw Error('transformRecord - required coreRecord must be non-null.');
    }

    return {
      _schemaName: this.recordType._schemaName,
      sourceSystemRef: 'core'
    };
  }

  /**
   * Searches for an existing master record, and returns it if found.
   *
   * @param {object} nrptiRecord
   * @returns {object} existing NRPTI master record or null if none found
   * @memberof BaseRecordUtils
   */
  async findExistingRecord(nrptiRecord) {
    const masterRecordModel = mongoose.model(this.recordType._schemaName);
    return await masterRecordModel
      .findOne({
        _schemaName: this.recordType._schemaName,
        _sourceRefId: nrptiRecord._sourceRefId
      });
  }

  /**
   * Update an existing NRPTI master record.
   *
   * @param {object} nrptiRecord
   * @param {object} existingRecord
   * @returns {object} object containing the update master
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
      const updateObj = { ...nrptiRecord, _id: existingRecord._id };
      
      updateObj.updatedBy = (this.auth_payload && this.auth_payload.displayName) || '';
      updateObj.dateUpdated = new Date();
      
      existingRecord._flavourRecords.forEach(flavourRecord => {
        updateObj[flavourRecord._schemaName] = { _id: flavourRecord._id };
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
   * Create a new NRPTI master.
   *
   * @async
   * @param {object} nrptiRecord NRPTI record (required)
   * @returns {object} object containing the newly inserted master and flavour records
   * @memberof BaseRecordUtils
   */
  async createRecord(nrptiRecord) {
    if (!nrptiRecord) {
      throw Error('createRecord - required nrptiRecord must be non-null.');
    }

    // build create Obj, which should include the flavour record details
    const createObj = { ...nrptiRecord };

    createObj.addedBy = (this.auth_payload && this.auth_payload.displayName) || '';
    createObj.dateAdded = new Date();

    try {
      return await RecordController.processPostRequest(
        { swagger: { params: { auth_payload: this.auth_payload } } },
        null,
        null,
        this.recordType.recordControllerName,
        [nrptiRecord]
      );
    } catch (error) {
      defaultLog.error(`Failed to create ${this.recordType._schemaName} record: ${error.message}`);
    }
  }
}

module.exports = BaseRecordUtils;
