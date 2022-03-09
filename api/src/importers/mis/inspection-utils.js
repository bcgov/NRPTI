const BaseRecordUtils = require('./base-record-utils');
// const CsvUtils = require('./utils/csv-utils');
const MiscConstants = require('../../utils/constants/misc');

/**
 * Agri csv Inspections record handler.
 *
 * @class Inspections
 */

class Inspections extends BaseRecordUtils {
  /**
   * Creates an instance of Inspections.
   *
   * @param {*} auth_payload user information for auditing
   * @param {*} recordType an item from record-type-enum.js -> RECORD_TYPE
   * @param {*} csvRow an object containing the values from a single csv row.
   * @memberof Inspections
   */
  constructor(auth_payload, recordType, csvRow) {
    super(auth_payload, recordType, csvRow);
  }

  /**
   * Convert the csv row object into the object expected by the API record post/put controllers.
   *
   * @returns an inspection object matching the format expected by the API record post/put controllers.
   * @memberof Inspections
   */
  transformRecord(csvRow) {
    if (!csvRow) {
      throw Error('transformRecord - required csvRow must be non-null.');
    }

    const inspection = { ...super.transformRecord(csvRow) };

    inspection['_sourceRefAgriMisId'] = csvRow['issue no.'] || '';

    inspection['recordType'] = 'Inspection';
    inspection['dateIssued'] = csvRow['created '] || null;

    inspection['issuingAgency'] = 'Ministry of Agriculture and Food';
    inspection['author'] = 'Ministry of Agriculture';

    inspection['recordName'] = (csvRow['issue no.'] && `Compliance issue ${csvRow['issue no.']}`) || '';
    inspection['description'] = 'Inspection to verify compliance with regulatory requirement';
    inspection['outcomeDescription'] = (csvRow['regulation'] && `Compliance issue - ${csvRow['regulation']}`) || '';

    inspection['location'] = csvRow['region'] || null;

    inspection['legislation'] = [
      {
        act: 'Food Safety Act',
        section: 9,
        legislationDescription: 'Inspection to verify compliance with regulatory requirement'
      }
    ];

    inspection['issuedTo'] = {
      type: MiscConstants.IssuedToEntityTypes.Company,
      companyName: (csvRow['est'] && csvRow['est'][' name']) || ''
    };
    return inspection;
  }
}

module.exports = Inspections;
