'use strict';

const ObjectId = require('mongoose').Types.ObjectId;

const BaseRecordUtils = require('./base-record-utils');

const MINE_PARTY_PERMITTEE = 'PMT';

/**
 * CORE Mine record handler.
 *
 * @class Mines
 */
class Mines extends BaseRecordUtils {
  /**
   * Creates an instance of Mines.
   *
   * @param {*} auth_payload user information for auditing
   * @param {*} recordType an item from record-type-enum.js -> RECORD_TYPE
   * @memberof Mines
   */
  constructor(auth_payload, recordType) {
    if (!recordType) {
      throw Error('MineUtils - required recordType must be non-null.');
    }

    super(auth_payload, recordType);
  }

  /**
   * Transform an CORE mine record into a NRPTI Mine record.
   *
   * @param {object} mineRecord Core mine record (required)
   * @param {Array<object>} commodityTypes Available commodity types
   * @returns {Order} NRPTI mine record.
   * @throws {Error} if record is not provided.
   * @memberof Mines
   */
  transformRecord(mineRecord, commodityTypes) {
    if (!mineRecord) {
      throw Error('transformRecord - required mineRecord must be non-null.');
    }

    if (!commodityTypes) {
      throw Error('transformRecord - required commodityTypes must be non-null.');
    }

    return {
      ...super.transformRecord(mineRecord),
      _sourceRefId: mineRecord.mine_guid,
      name: mineRecord.mine_name,
      status: this.getLatestStatus(mineRecord),
      commodities: this.getCommodities(mineRecord, commodityTypes),
      tailingsImpoundments: mineRecord.mine_tailings_storage_facilities.length,
      region: mineRecord.mine_region,
      location : { type: 'Point', coordinates: mineRecord.coordinates },
      permittee: '',
      permitNumber: '',
      permit: null,
      links: []
    };
  }

  /**
   * Gets the description of all commodities that match the mine record.
   * 
   * @param {object} mineRecord Core mine record
   * @param {Array<object>} commodityTypes Valid commodity types
   * @returns {Array<string>} Matched commodity types
   * @memberof Mines
   */
  getCommodities(mineRecord, commodityTypes) {
    if (!commodityTypes) {
      throw Error('getCommodities - required commodityTypes must be non-null.');
    }

    if (!mineRecord || !mineRecord.mine_type) {
      throw Error('getCommodities - required mineRecord and mineRecord.mine_type must be non-null.');
    }

    const commodities = [];

    for (const mineType of mineRecord.mine_type) {
      if (mineType.mine_type_detail && mineType.mine_type_detail.length) {
        for (const typeDetail of mineType.mine_type_detail) {
          // Could be null if type is a disturbance instead of a commodity.
          if (typeDetail.mine_commodity_code) {
            const commodity = commodityTypes.find(commodity => commodity.mine_commodity_code === typeDetail.mine_commodity_code);
            commodities.push(commodity.description);
          }
        }
      }
    }

    return commodities;
  }

  /**
   * Returns the latest mine status.
   * 
   * @param {object} mineRecord Core mine record
   * @returns {string} Latest status
   * @memberof Mines
   */
  getLatestStatus(mineRecord) {
    if (!mineRecord) {
      throw new Error('getLatestStatus - mineRecord must not be null.');
    }

    if (mineRecord.mine_status && !mineRecord.mine_status.length) {
      return '';
    }

    // Core always displays the status at the 0 index.
    const latestStatus = mineRecord.mine_status[0];
    return (latestStatus.status_labels && latestStatus.status_labels.join(' ')) || '';
  }

  /**
   * Adds the permit and permittee to a Mine record.
   * 
   * @param {*} mineRecord Transformed Mine record
   * @param {*} permitInfo Permit number and permittee
   * @returns {Mine} Mine with permit and permittee added
   * @memberof Mines
   */
  addPermitToRecord(mineRecord, permitInfo) {
    return {
      ...mineRecord,
      permitNumber: permitInfo.permitNumber,
      permittee: permitInfo.permittee
    }
  }

  updateRecord(nrptiRecord, existingRecord) {
    // The permit information is updated separately and the NRPTI record will not contain it.
    // Copy permit information over before updating to preserve it.
    nrptiRecord.permittee = existingRecord.permittee;
    nrptiRecord.permit = existingRecord.permit;
    nrptiRecord.permitNumber = existingRecord.permitNumber;

    return super.updateRecord(nrptiRecord, existingRecord);
  }
}

module.exports = Mines;
