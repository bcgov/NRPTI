'use strict';

const moment = require('moment');
const mongoose = require('mongoose');
const defaultLog = require('../../utils/logger')('coors-csv-base-record-utils');
const RecordController = require('./../../controllers/record-controller');

/**
 * COORS csv base record type handler that can be used directly, or extended if customizations are needed.
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
   * Transform an coors-csv row into a NRPTI record.
   *
   * Note: Only transforms common fields found in ALL supported coors-csv types.
   *       To include other values, extend this class and adjust the object returned by this function as needed.
   *
   * @param {object} csvRow coors-csv row (required)
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

      sourceSystemRef: 'coors-csv'
    };
  }

  /**
   * Searches for an existing master record, and returns it if found.
   *
   * @param {*} nrptiRecord
   * @returns {object} existing NRPTI master record, or null if none found or _sourceRefCoorsId is null
   * @memberof BaseRecordUtils
   */
  async findExistingRecord(nrptiRecord) {
    if (!nrptiRecord._sourceRefCoorsId) {
      return null;
    }

    const masterRecordModel = mongoose.model(this.recordType._schemaName);

    return await masterRecordModel
      .findOne({
        _schemaName: this.recordType._schemaName,
        _sourceRefCoorsId: nrptiRecord._sourceRefCoorsId
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

      updateObj.updatedBy = (this.auth_payload && this.auth_payload.display_name) || '';
      updateObj.dateUpdated = new Date();
      updateObj.sourceDateUpdated = new Date();

      // court conviction csv format requires special handling to properly update penalties
      if (nrptiRecord._schemaName === 'CourtConviction') {
        updateObj.penalties = this.handleConvictionPenalties(updateObj.penalties[0], existingRecord);
      }

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

      createObj.addedBy = (this.auth_payload && this.auth_payload.display_name) || '';
      createObj.dateAdded = new Date();
      createObj.sourceDateAdded = new Date();

      // publish to NRCED
      if (this.recordType.flavours.nrced) {
        createObj[this.recordType.flavours.nrced._schemaName] = {
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
      defaultLog.error(`Failed to create ${this.recordType._schemaName} record: ${error.message}`);
    }
  }

  /**
   * Logic to append or clear and update penalties for court convictions
   *
   * @param {array} updatedPenalty Array of incoming penalties parsed from the current csv row
   * @param {object} existingRecord The existing Convition from saved record
   * @returns {array} updated penalties array to save
   * @memberof BaseRecordUtils
  */
  handleConvictionPenalties(updatedPenalty, existingRecord) {
    // check if this record was created or updated as part of this import job
    let createdAt = moment(existingRecord.dateAdded);
    let lastUpdated = moment(existingRecord.dateUpdated);
    let now = moment();
    if (now.diff(createdAt, 'seconds') > 90  && now.diff(lastUpdated, 'seconds') > 60) {
      // wipe penalties to ensure penalty edits in the source system aren't creating extra penalties in nrpti
      existingRecord.penalties = []
    }

    let penaltiesObj = existingRecord.penalties;
    let exists = false
    // check if penalty needs to be appended
    if (updatedPenalty && existingRecord.penalties) {
      exists = this.penaltyExists(existingRecord.penalties, updatedPenalty)
    }
    // copy existing penalty into new obj
    if (!exists) {
      penaltiesObj.push(updatedPenalty)
    }
    return penaltiesObj;
  }

  /**
   * Check if a penalty is already part of the existing record
   *
   * @param {array} existingPenalties Array of existing penalties from saved record
   * @param {object} newPenalty The penalty parsed from the current csv row
   * @returns {boolean} if the penalty alread in the penalties array
   * @memberof BaseRecordUtils
  */
  penaltyExists(existingPenalties, newPenalty) {
    for (let penalty of existingPenalties) {
      if (newPenalty.type === penalty.type && newPenalty.penalty.type === penalty.penalty.type && newPenalty.penalty.value === penalty.penalty.value) {
        return true;
      }
    }
    // no matching penalty
    return false;
  }
}

module.exports = BaseRecordUtils;
