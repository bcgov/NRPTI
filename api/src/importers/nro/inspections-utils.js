const ObjectID = require('mongodb').ObjectID;

const BaseRecordUtils = require('./base-record-utils');
const CsvUtils = require('./utils/csv-utils');
const MiscConstants = require('../../utils/constants/misc');

/**
 * NRO csv Inspections record handler.
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

    inspection['_sourceRefNrisId'] = Number(csvRow['record id']) || '';

    inspection['recordType'] = 'Inspection';
    inspection['dateIssued'] = csvRow['date'] || null;

    inspection['issuingAgency'] = 'Natural Resource Officers';
    inspection['author'] = 'Natural Resource Officers';

    inspection['recordName'] = (csvRow['record id'] && `NRO Inspection - Record ${csvRow['record id']}`) || '-';
    inspection['description'] = (csvRow['activity'] && `Activity Inspected: ${csvRow['activity']}`) || '-';
    inspection['summary'] = (csvRow['activity'] && `Activity Inspected: ${csvRow['activity']}`) || '-';

    inspection['location'] = csvRow['region'] || null;

    inspection['legislation'] = CsvUtils.getLegislation(csvRow);
    inspection['legislationDescription'] = 'Inspection to verify compliance with regulatory requirement';

    inspection['outcomeDescription'] = CsvUtils.getOutcomeDescription(csvRow);

    const projectData = CsvUtils.getProjectNameAndEpicProjectId(csvRow);

    if (projectData) {
      inspection['projectName'] = projectData.projectName;
      inspection['_epicProjectId'] = (projectData._epicProjectId && new ObjectID(projectData._epicProjectId)) || null;
    }

    const entityType = CsvUtils.getEntityType(csvRow);

    if (entityType === MiscConstants.IssuedToEntityTypes.Company) {
      if (Number(csvRow['longitude']) && Number(csvRow['latitude'])) {
        inspection['centroid'] = [Number(csvRow['longitude']), Number(csvRow['latitude'])];
      }

      inspection['issuedTo'] = {
        type: MiscConstants.IssuedToEntityTypes.Company,
        companyName: csvRow['client / complainant']
      };
    }

    if (entityType === MiscConstants.IssuedToEntityTypes.Individual) {
      inspection['issuedTo'] = {
        type: MiscConstants.IssuedToEntityTypes.Individual,
        // Set dateOfBirth to null so the issuedTo names are redacted on public sites
        // This is a temporary solution until business figures out how to display client names
        dateOfBirth: null,
        firstName: '',
        lastName: '',
        middleName: '',
        // Unset companyName if it was previously set
        companyName: ''
      };

      // Unset long/lat in case it was previously.
      inspection['centroid'] = null;
    }

    return inspection;
  }
}

module.exports = Inspections;
