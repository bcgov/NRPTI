const ObjectID = require('mongodb').ObjectID;
const BaseRecordUtils = require('./base-record-utils');
const CsvUtils = require('./utils/csv-utils');
const RECORD_TYPE = require('../../utils/constants/record-type-enum');
const moment = require('moment-timezone');
const defaultLog = require('../../utils/logger')('bcogc-csv-orders-utils');

/**
 * CORS csv Inspections record handler.
 *
 * Csv mapping logic detailed here: https://bcmines.atlassian.net/browse/NRPT-188
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
   * @returns a inspection object matching the format expected by the API record post/put controllers.
   * @memberof Inspections
   */
  transformRecord(csvRow) {
    if (!csvRow) {
      throw Error('transformRecord - required csvRow must be non-null.');
    }

    csvRow = this.cleanCsvRow(csvRow);

    const inspection = { ...super.transformRecord(csvRow) };

    inspection['_sourceRefOgcInspectionId'] = csvRow['inspection number'] || null;
    inspection['_sourceRefOgcDeficiencyId'] = csvRow['deficiency objectid'] || null;

    inspection['recordType'] = RECORD_TYPE.Inspection.displayName;
    try {
      inspection['dateIssued'] = csvRow['inspection date'] ? moment.tz(csvRow['inspection date'], "DD-MMM-YYYY", "America/Vancouver").toDate() : null;
    } catch (error) {
      defaultLog.debug(csvRow['inspection date'] + ' is not in the expected format DD-MMM-YYYY');
      defaultLog.debug(error);
      inspection['dateIssued'] = null;
    }
    inspection['issuingAgency'] = 'BC Energy Regulator';
    inspection['author'] = 'BC Oil and Gas Commission';

    inspection['recordName'] =
      (csvRow['inspection number'] && `Inspection Number ${csvRow['inspection number']}`) || '-';

    inspection['legislation'] = [
      {
        act: 'Oil and Gas Activities Act',
        section: '57',
        subSection: '4',
        legislationDescription: 'Inspection to verify compliance with regulatory requirement'
      }
    ];

    inspection['issuedTo'] = {
      type: 'Company',
      companyName: csvRow['operator'] || ''
    };

    const projectDetails = CsvUtils.getProjectNameAndEpicProjectId(csvRow);
    // Only update NRPTI project details if the csv contains known project information
    if (projectDetails) {
      inspection['projectName'] = projectDetails.projectName;
      inspection['_epicProjectId'] =
        (projectDetails._epicProjectId && new ObjectID(projectDetails._epicProjectId)) || null;
    }

    inspection['location'] = 'British Columbia';

    inspection['outcomeDescription'] = CsvUtils.getOutcomeDescription(csvRow);

    inspection['description'] =
      'Inspection to verify compliance with regulatory requirements. ' + CsvUtils.getOutcomeDescription(csvRow);

    inspection['summary'] = (csvRow['inspection number'] && `Inspection Number ${csvRow['inspection number']}`) || '-';

    return inspection;
  }

  /**
   * The OGC csv contains `-` in place of empty fields, which need to be replaced with proper empty values.
   *
   * @param {*} csvRow
   * @returns csvRow with filler `-` removed
   * @memberof Inspections
   */
  cleanCsvRow(csvRow) {
    if (!csvRow) {
      return null;
    }

    Object.entries(csvRow).forEach(([key, value]) => {
      if (value === '-') {
        csvRow[key] = '';
      } else {
        csvRow[key] = value;
      }
    });

    return csvRow;
  }
}

module.exports = Inspections;
