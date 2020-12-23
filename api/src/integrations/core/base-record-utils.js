'use strict';

const mongoose = require('mongoose');

const defaultLog = require('../../utils/logger')('core-base-record-utils');
const RecordController = require('../../controllers/record-controller');
const MineController = require('../../controllers/mine-controller');

/**
 * Core base record type handler that can be used directly, or extended if customizations are needed.
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

      addedBy: this.auth_payload.displayName,
      updatedBy: this.auth_payload.displayName,

      dateAdded: new Date(),
      dateUpdated: new Date(),

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
      // Remove dateAdded/addedBy fields, this is not a new record
      delete nrptiRecord.dateAdded;
      delete nrptiRecord.addedBy;

      // build update Obj, which needs to include the flavour record ids
      const updateObj = { ...nrptiRecord, _id: existingRecord._id };

      if (updateObj._schemaName === 'MineBCMI') {
        return await MineController.protectedPut(
          {
            swagger: {
              params: {
                auth_payload: this.auth_payload,
                mine: {
                  value: updateObj
                },
                mineId: {
                  value: updateObj._id
                }
              }
            }
          },
          null,
          null
        );
      } else {
        return await RecordController.processPutRequest(
          { swagger: { params: { auth_payload: this.auth_payload } } },
          null,
          null,
          this.recordType.recordControllerName,
          [updateObj]
        );
      }
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
  async createItem(nrptiRecord) {
    if (!nrptiRecord) {
      throw Error('createItem - required nrptiRecord must be non-null.');
    }

    try {
      if (nrptiRecord._schemaName === 'MineBCMI') {
        return await MineController.protectedPost(
          {
            swagger: {
              params: {
                auth_payload: this.auth_payload,
                mine: {
                  value: nrptiRecord
                }
              }
            }
          },
          null,
          null
        );
      } else {
        return await RecordController.processPostRequest(
          { swagger: { params: { auth_payload: this.auth_payload } } },
          null,
          null,
          this.recordType.recordControllerName,
          [nrptiRecord]
        );
      }
    } catch (error) {
      defaultLog.error(`Failed to create ${this.recordType._schemaName} record: ${error.message}`);
    }
  }
}

module.exports = BaseRecordUtils;
