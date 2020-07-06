'use strict';
const mongoose = require('mongoose');

const BaseRecordUtils = require('./base-record-utils');

/**
 * CORE Mine permit record handler.
 *
 * @class Permit
 */
class Permits extends BaseRecordUtils {
  /**
   * Creates an instance of Permits.
   *
   * @param {*} auth_payload user information for auditing
   * @param {*} recordType an item from record-type-enum.js -> RECORD_TYPE
   * @memberof Permits
   */
  constructor(auth_payload, recordType) {
    if (!auth_payload) {
      throw Error('PermitUtils - required auth_payload must be non-null.');
    }

    if (!recordType) {
      throw Error('PermitUtils - required recordType must be non-null.');
    }

    super(auth_payload, recordType);
  }

  /**
   * Transform an CORE mine permit record into a NRPTI Mine record.
   *
   * @param {object} permit Core mine permit record (required)
   * @param {object} amendments Core mine permit amendments (required)
   * @returns {PermitBCMI} NRPTI mine permit record.
   * @memberof Permits
   */
  transformRecord(permit, amendments) {
    if (!permit) {
      throw Error('transformRecord - required permits must be non-null.');
    }

    if (!amendments) {
      throw Error('transformRecord - required amendments must be non-null.');
    }

    return {
      ...super.transformRecord(permit),
      _sourceRefId: permit.permit_guid || '',

      mineGuid: permit.mine_guid || '',
      permitNumber: permit.permit_no || '',
      status: permit.permit_status_code || '',
      permitAmendments: amendments.map(amendment => amendment._id),
    };
  }

  async updateRecord(permitId, newPermit) {
    const Permit = mongoose.model('Permit');
    const existingPermit = await Permit.find({ _id: permitId });

    return await super.updateRecord(existingPermit, newPermit);
  }
}

module.exports = Permits;
