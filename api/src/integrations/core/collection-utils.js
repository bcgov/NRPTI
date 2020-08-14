'use strict';

const BaseRecordUtils = require('./base-record-utils');

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
}

module.exports = Collections;
