'use strict';

const CollectionController = require('../../controllers/collection-controller');
const BaseRecordUtils = require('./base-record-utils');
const defaultLog = require('../../utils/logger')('collections-record-utils');
/**
 * Collection record handler.
 *
 * @class Collections
 */
class Collections extends BaseRecordUtils {
  /**
   * Creates an instance of Collections.
   *
   * @param {*} auth_payload user information for auditing
   * @param {*} recordType an item from record-type-enum.js -> RECORD_TYPE
   * @memberof Collections
   */
  constructor(auth_payload, recordType) {
    if (!auth_payload) {
      throw Error('CollectionUtils - required auth_payload must be non-null.');
    }

    if (!recordType) {
      throw Error('CollectionUtils - required recordType must be non-null.');
    }

    super(auth_payload, recordType);
  }

  /**
   * Create a new BCMI Collection
   *
   * @async
   * @param {object} nrptiRecord NRPTI record (required)
   * @returns {object} object containing the newly inserted record
   * @memberof Collections
   */
  async createItem(nrptiRecord) {
    if (!nrptiRecord) {
      throw Error('createItem - required nrptiRecord must be non-null.');
    }

    try {
      return await CollectionController.createCollection(nrptiRecord, this.auth_payload.displayName);
    } catch (error) {
      defaultLog.error(`Failed to create ${this.recordType._schemaName} record: ${error.message}`);
    }
  }

}

module.exports = Collections;
