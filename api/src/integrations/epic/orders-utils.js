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
        legislation['act'] = 'Environmental Assessment Act';
        legislation['section'] = '34';
        break;
      case 2018:
        legislation['act'] = 'Environmental Assessment Act';
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
        companyName: epicRecord.project.proponent && epicRecord.project.proponent.company || '',
        fullName: epicRecord.project.proponent && epicRecord.project.proponent.company || ''
      }
    };
  }

  /**
   * Indicates if a record is a fee order or not.
   * 
   * @param {object} transformedRecord Epic record that has been transformed to NRPTI format
   * @returns {boolean} Indication if the record is a fee order
   * @memberof Orders
   */
  isRecordFeeOrder(transformedRecord) {
    if (!transformedRecord) {
      throw new Error('isRecordFeeOrder - required transformedRecord must be non-null.');
    }

    // Only want to handle Orders.
    if (transformedRecord.recordType !== 'Order' || !transformedRecord.recordName) {
      throw new Error('isRecordFeeOrder - record must be an Order type and have a name.');
    }

    const lowercaseName = transformedRecord.recordName.toLowerCase();

    // Any document names that contain these terms are considered Fee Orders.
    const orderTermsWhitelist = [
      'fee order',
      'order to pay fees',
      'fee package'
    ];

    for (const term of orderTermsWhitelist) {
      if (lowercaseName.includes(term)) {
        return true;
      }
    }

    return false;
  }
}

module.exports = Orders;
