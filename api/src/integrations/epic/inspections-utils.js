'use strict';

const BaseRecordUtils = require('./base-record-utils');
/**
 * Epic Inspection record handler for:
 *  - { type: 'Inspection Record', milestone: 'Compliance & Enforcement' }.
 *
 * @class Inspections
 */
class Inspections extends BaseRecordUtils {
  /**
   * Creates an instance of Inspections.
   *
   * @param {*} auth_payload user information for auditing
   * @param {*} recordType an item from record-type-enum.js -> RECORD_TYPE
   * @memberof Inspections
   */
  constructor(auth_payload, recordType) {
    super(auth_payload, recordType);
  }

  /**
   * Transform an Epic inspection record into a NRPTI Inspection record.
   *
   * @param {object} epicRecord Epic inspection record (required)
   * @returns {Inspection} NRPTI inspection record.
   * @throws {Error} if record is not provided.
   * @memberof Inspections
   */
  async transformRecord(epicRecord) {
    if (!epicRecord) {
      throw Error('transformRecord - required record must be non-null.');
    }

    let legislation = {};
    switch (epicRecord.legislation) {
      case 2002:
        legislation['act'] = 'Environmental Assesment Act';
        legislation['section'] = '33';
        legislation['subSection'] = '1';
        break;
      case 2018:
        legislation['act'] = 'Environmental Assesment Act';
        legislation['section'] = '49';
        legislation['subSection'] = '3';
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
      legislationDescription: 'Inspection to verify compliance with regulatory requirement',
      issuedTo: {
        write: ['sysadmin'],
        read: ['sysadmin'],

        // Epic doesn't support `Individual` proponents
        type: 'Company',
        companyName: epicRecord.project.company || ''
      }
    };
  }
}

module.exports = Inspections;
