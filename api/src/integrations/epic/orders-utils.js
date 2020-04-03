'use strict';

const BaseRecordUtils = require('./base-record-utils');
/**
 * Epic Orders record handler for:
 *  - { type: 'Order', milestone: 'Compliance & Enforcement' }.
 *
 * @class Orders
 */
class Orders extends BaseRecordUtils {
  /**
   * Creates an instance of Orders.
   *
   * @param {*} auth_payload user information for auditing
   * @param {*} recordType an item from record-type-enum.js -> RECORD_TYPE
   * @memberof Orders
   */
  constructor(auth_payload, recordType) {
    super(auth_payload, recordType);
  }

  /**
   * Transform an Epic order record into a NRPTI Order record.
   *
   * @param {object} epicRecord Epic order record (required)
   * @returns {Order} NRPTI order record.
   * @throws {Error} if record is not provided.
   * @memberof Orders
   */
  async transformRecord(epicRecord) {
    if (!epicRecord) {
      throw Error('transformRecord - required record must be non-null.');
    }

    let legislation = {};
    switch (epicRecord.legislation) {
      case 2002:
        legislation['act'] = 'Environmental Assesment Act';
        legislation['section'] = '34';
        break;
      case 2018:
        legislation['act'] = 'Environmental Assesment Act';
        legislation['section'] = '56';
        legislation['subSection'] = '1';
        break;
      default:
        legislation['act'] = (epicRecord.project && epicRecord.project.legislation) || '';
        break;
    }

    return {
      ...(await super.transformRecord(epicRecord)),
      issuingAgency: 'Environmental Assessment Office',
      author: epicRecord.documentAuthor || '',
      legislation: legislation,
      legislationDescription: 'Order to cease or remedy.',
      issuedTo: {
        // Epic doesn't support `Individual` proponents
        type: 'Company',
        companyName: epicRecord.project.company || '',
        fullName: epicRecord.project.company || ''
      }
    };
  }
}

module.exports = Orders;
