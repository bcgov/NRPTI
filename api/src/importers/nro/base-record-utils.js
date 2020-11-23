'use strict';

const mongoose = require('mongoose');
const defaultLog = require('../../utils/logger')('nro-csv-base-record-utils');
const RecordController = require('./../../controllers/record-controller');
const MiscConstants = require('../../utils/constants/misc');

/**
 * NRO csv base record type handler that can be used directly, or extended if customizations are needed.
 *
 * @class BaseRecordUtils
 */
class BaseRecordUtils {
  /**
   * Creates an instance of BaseRecordUtils.
   *
   * @param {*} auth_payload user information for auditing
   * @param {*} recordType an item from record-type-enum.js -> RECORD_TYPE
   * @param {*} csvRow an array containing the values from a single csv row.
   * @memberof BaseRecordUtils
   */
  constructor(auth_payload, recordType, csvRow) {
    if (!recordType) {
      throw Error('BaseRecordUtils - required recordType must be non-null.');
    }

    this.auth_payload = auth_payload;
    this.recordType = recordType;
    this.csvRow = csvRow;
  }

  /**
   * Transform an nro-csv row into a NRPTI record.
   *
   * Note: Only transforms common fields found in ALL supported nro-csv types.
   *       To include other values, extend this class and adjust the object returned by this function as needed.
   *
   * @param {object} csvRow nro-csv row (required)
   * @returns {object} NRPTI record.
   * @throws {Error} if record is not provided.
   * @memberof BaseRecordUtils
   */
  transformRecord(csvRow) {
    if (!csvRow) {
      throw Error('transformRecord - required csvRow must be non-null.');
    }

    return {
      _schemaName: this.recordType._schemaName,
      recordType: this.recordType.displayName,

      sourceSystemRef: 'nro-inspections-csv'
    };
  }

  /**
   * Searches for an existing master record, and returns it if found.
   *
   * @param {*} nrptiRecord
   * @returns {object} existing NRPTI master record, or null if none found or _sourceRefNrisId is null
   * @memberof BaseRecordUtils
   */
  async findExistingRecord(nrptiRecord) {
    if (!nrptiRecord._sourceRefNrisId) {
      return null;
    }

    const masterRecordModel = mongoose.model(this.recordType._schemaName);

    return await masterRecordModel
      .findOne({
        _schemaName: this.recordType._schemaName,
        _sourceRefNrisId: nrptiRecord._sourceRefNrisId
      })
      .populate('_flavourRecords', '_id _schemaName');
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
      const updateObj = { ...nrptiRecord, _id: existingRecord._id };

      updateObj.updatedBy = (this.auth_payload && this.auth_payload.preferred_username) || '';
      updateObj.dateUpdated = new Date();
      updateObj.sourceDateUpdated = new Date();

      // Only publish LNG or CGL.  They're the only ones with issueTo.type is Company
      // See https://bcmines.atlassian.net/browse/NRPT-12 for more details
      if (updateObj.issuedTo.type === MiscConstants.IssuedToEntityTypes.Company) {
        existingRecord._flavourRecords.forEach(flavourRecord => {
          updateObj[flavourRecord._schemaName] = { _id: flavourRecord._id, addRole: 'public' };
        });
      } else {
        existingRecord._flavourRecords.forEach(flavourRecord => {
          updateObj[flavourRecord._schemaName] = { _id: flavourRecord._id, removeRole: 'public' };
        });
      }

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
   * Create a new NRPTI master and flavour records.
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
      // build create Obj, which should include the flavour record details
      const createObj = { ...nrptiRecord };

      createObj.addedBy = (this.auth_payload && this.auth_payload.preferred_username) || '';
      createObj.dateAdded = new Date();
      createObj.sourceDateAdded = new Date();

      // Only publish LNG or CGL.  They're the only ones with issueTo.type is Company
      // See https://bcmines.atlassian.net/browse/NRPT-12 for more details
      if (createObj.issuedTo.type === MiscConstants.IssuedToEntityTypes.Company) {
        // publish to NRCED
        if (this.recordType.flavours.nrced) {
          createObj[this.recordType.flavours.nrced._schemaName] = {
            addRole: 'public'
          };
        }

        // publish to LNG
        if (this.recordType.flavours.lng) {
          createObj[this.recordType.flavours.lng._schemaName] = {
            addRole: 'public'
          };
        }
      } else {
        if (this.recordType.flavours.nrced) {
          createObj[this.recordType.flavours.nrced._schemaName] = {
            removeRole: 'public'
          };
        }
        
        if (this.recordType.flavours.lng) {
          createObj[this.recordType.flavours.lng._schemaName] = {
            removeRole: 'public'
          };
        }
      }

      return await RecordController.processPostRequest(
        { swagger: { params: { auth_payload: this.auth_payload } } },
        null,
        null,
        this.recordType.recordControllerName,
        [createObj]
      );
    } catch (error) {
      defaultLog.error(`Failed to create ${this.recordType._schemaName} record: ${error.message}`);
    }
  }
}

module.exports = BaseRecordUtils;
