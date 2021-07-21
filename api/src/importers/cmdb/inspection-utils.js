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
  transformRecord(csvRow, outcomeDescription = '') {

    if (!csvRow) {
      throw Error('transformRecord - required csvRow must be non-null.');
    }

    const inspection = { ...super.transformRecord(csvRow) };

    inspection['_sourceRefAgriCmdbId'] = csvRow['inspection id'] || '';

    inspection['recordType'] = 'Inspection';
    inspection['dateIssued'] = csvRow['date issued'] || null;

    inspection['issuingAgency'] = 'Ministry of Agriculture Food and Fisheries';
    inspection['author'] = 'Ministry of Agriculture';

    inspection['recordName'] = (csvRow['inspection type']) || '';

    inspection['description'] = 'Inspection to verify compliance with regulatory requirements';
    inspection['outcomeDescription'] = (outcomeDescription || '');
    inspection['location'] = csvRow['location'] || null;

    inspection['legislation'] = {
      act: 'Fish and Seafood Act',
      section: 22
    }
    inspection['legislationDescription'] = 'Inspection to verify compliance with regulatory requirements';

    inspection['issuedTo'] = {
      type: MiscConstants.IssuedToEntityTypes.Company,
      companyName: (csvRow['company name']) || ''
    }
    return inspection;
  }
 }

 module.exports = Inspections;
