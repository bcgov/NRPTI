'use strict';

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
   * @param {*} recordType an item from record-type-enum.js -> RECORD_TYPE
   * @memberof Mines
   */
  constructor(recordType) {
    if (!recordType) {
      throw Error('MineUtils - required recordType must be non-null.');
    }

    super(recordType);
  }

  /**
   * Transform an CORE mine record into a NRPTI Mine record.
   *
   * @param {object} mineRecord Core mine record (required)
   * @param {Array<object>} commodityTypes Available commodity types
   * @param {Array<string>} permits Valid permit numbers
   * @returns {Order} NRPTI mine record.
   * @throws {Error} if record is not provided.
   * @memberof Mines
   */
  transformRecord(mineRecord, commodityTypes, permit) {
    if (!mineRecord) {
      throw Error('transformRecord - required mineRecord must be non-null.');
    }

    if (!commodityTypes) {
      throw Error('transformRecord - required commodityTypes must be non-null.');
    }

    if (!permit) {
      throw Error('transformRecord - required permits must be non-null.');
    }

    return {
      ...super.transformRecord(mineRecord),
      name: mineRecord.mine_name,
      permitNumber: permit.permit_no,
      status: this.getLatestStatus(mineRecord),
      commodities: this.getCommodities(mineRecord, commodityTypes),
      tailingsImpoundments: mineRecord.mine_tailings_storage_facilities.length,
      region: mineRecord.mine_region,
      location : { type: 'Point', coordinates: mineRecord.coordinates },
      permittee: this.getParty(MINE_PARTY_PERMITTEE, mineRecord, permit),
      type: '',
      summary: '',
      description: '',
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
   * Get a party name based on a part code. 
   * 
   * @param {string} partyCode Code for the type of party to search for
   * @param {object} mineRecord Core mine record
   * @returns {string} Name of party or empty string
   * @memberof Mines
   */
  getParty(partyCode, mineRecord, permit) {
    if (!partyCode) {
      throw new Error('getParty - partyCode must not be null.');
    }

    if (!mineRecord) {
      throw new Error('getParty - mineRecord must not be null.');
    }

    if (!permit) {
      throw new Error('getParty - permit must not be null.');
    }

    const party = mineRecord.parties.find(party => 
      party.mine_party_appt_type_code === partyCode && party.related_guid === permit.permit_guid
    );
    
    return (party && party.party && party.party.name) || '';
  }
}

module.exports = Mines;
