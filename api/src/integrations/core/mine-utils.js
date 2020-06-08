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
      name: mineRecord.mine_name,
      permitNumbers: mineRecord.mine_permit_numbers,
      status: this.getLatestStatus(mineRecord),
      commodities: this.getCommodities(mineRecord, commodityTypes),
      tailingsImpoundments: mineRecord.mine_tailings_storage_facilities.length,
      region: mineRecord.mine_region,
      location : { type: 'Point', coordinates: mineRecord.coordinates },
      permittee: this.getParty(MINE_PARTY_PERMITTEE, mineRecord),
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

    mineRecord.mine_type.forEach(type => {
      commodityTypes.forEach(commodity => {
        if (commodity.mine_tenure_type_codes.includes(type.mine_tenure_type_code)) {
          commodities.push(commodity.description);
        }
      });
    });

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

    const latestStatus = mineRecord.mine_status.pop();
    return (latestStatus && latestStatus.status_labels.join(' ')) || '';
  }

  /**
   * Get a party name based on a part code. 
   * 
   * @param {string} partyCode Code for the type of party to search for
   * @param {object} mineRecord Core mine record
   * @returns {string} Name of party or empty string
   * @memberof Mines
   */
  getParty(partyCode, mineRecord) {
    if (!partyCode) {
      throw new Error('getParty - partyCode must not be null.');
    }

    if (!mineRecord) {
      throw new Error('getParty - mineRecord must not be null.');
    }

    const party = mineRecord.parties.find(party => party.mine_party_appt_type_code === partyCode);
    return (party && party.party && party.party.name) || '';
  }
}

module.exports = Mines;
