const BaseRecordUtils = require('./base-record-utils');
const CsvUtils = require('./utils/csv-utils');
const MiscConstants = require('../../utils/constants/misc');

/**
 * ALC csv Inspections record handler.
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

    inspection['_sourceRefStringId'] = csvRow['record id'] || '';

    inspection['recordType'] = 'Inspection';
    inspection['dateIssued'] = csvRow['date'] || null;

    inspection['issuingAgency'] = 'Agricultural Land Commission';
    inspection['author'] = 'Agricultural Land Commission';

    inspection['recordName'] = (csvRow['record id'] && `ALC Inspection - Record ${csvRow['record id']}`) || '-';
    inspection['description'] = (csvRow['reason'] && `Activity Inspected: ${csvRow['reason']}`) || '-';
    inspection['summary'] = (csvRow['reason'] && `Activity Inspected: ${csvRow['reason']}`) || '-';

    inspection['location'] = csvRow['local government'] || null;

    inspection['legislation'] = {
      act: 'Agricultural Land Commission Act',
      section: '49',
      subSection: '1'
    };
    inspection['legislationDescription'] = 'Inspection to verify compliance with regulatory requirements';

    inspection['outcomeDescription'] = CsvUtils.getOutcomeDescription(csvRow);

    const entityType = CsvUtils.getEntityType(csvRow);

    if (entityType === MiscConstants.IssuedToEntityTypes.Company) {
      if (Number(csvRow['longitude']) && Number(csvRow['latitude'])) {
        inspection['centroid'] = [Number(csvRow['longitude']), Number(csvRow['latitude'])];
      }

      inspection['issuedTo'] = {
        type: MiscConstants.IssuedToEntityTypes.Company,
        companyName: csvRow['inspection property owner']
      };
    }

    if (entityType === MiscConstants.IssuedToEntityTypes.Individual) {
      inspection['issuedTo'] = {
        type: MiscConstants.IssuedToEntityTypes.Individual,
        dateOfBirth: null,
        firstName: '',
        lastName: '',
        middleName: '',
      };
    }

    return inspection;
  }
}

module.exports = Inspections;
