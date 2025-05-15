const mongoose = require('mongoose');
const ObjectID = require('mongodb').ObjectID;
const defaultLog = require('../../utils/logger')('bcogc-csv-orders-utils');
const RECORD_TYPE = require('../../utils/constants/record-type-enum');
const BaseRecordUtils = require('./base-record-utils');
const CsvUtils = require('./utils/csv-utils');
const { createURLDocument } = require('../../controllers/document-controller');
const moment = require('moment-timezone');

/**
 * CORS csv Warning record handler.
 *
 * @class Warning
 */
class Warning extends BaseRecordUtils {
  /**
   * Creates an instance of Warning.
   *
   * @param {*} auth_payload user information for auditing
   * @param {*} recordType an item from record-type-enum.js -> RECORD_TYPE
   * @param {*} csvRow an object containing the values from a single csv row.
   * @memberof Warning
   */
  constructor(auth_payload, recordType, csvRow) {
    super(auth_payload, recordType, csvRow);
  }

  /**
 * Convert the csv row object into the object expected by the API record post/put controllers.
 *
 * @returns an order object matching the format expected by the API record post/put controllers.
 * @memberof Warning
 */
  transformRecord(csvRow) {
    if (!csvRow) {
      throw Error('transformRecord - required csvRow must be non-null.');
    }

    const warning = { ...super.transformRecord(csvRow) };

    warning['recordType'] = RECORD_TYPE.Warning.displayName;
    warning['_sourceRefOgcWarningId'] = csvRow['Title'];
    warning['author'] = 'AGENCY_OGC';
    warning['issuingAgency'] = 'AGENCY_OGC';
    warning['recordName'] = csvRow['Filename'];
    try {
      warning['dateIssued'] = csvRow['Date Issued'] ? moment.tz(csvRow['Date Issued'], "MM/DD/YYYY", "America/Vancouver").toDate() : null;
    } catch (error) {
      defaultLog.debug(csvRow['Date Issued'] + ' is not in the expected format MM/DD/YYYY');
      defaultLog.debug(error);
      warning['dateIssued'] = null;
    }
    warning['location'] = 'British Columbia';

    warning['issuedTo'] = {
      type: 'Company',
      companyName: csvRow['Proponent'] || ''
    };

    // Prepare for the document to be created later.
    warning['document'] = {
      fileName: csvRow['Filename'],
      url: csvRow['File URL'],
    };

    const projectDetails = CsvUtils.getProjectNameAndEpicProjectId(csvRow);
    // Only update NRPTI project details if the csv contains known project information
    if (projectDetails) {
      warning['projectName'] = projectDetails.projectName;
      warning['_epicProjectId'] =
        (projectDetails._epicProjectId && new ObjectID(projectDetails._epicProjectId)) || null;
    }

    return warning;
  }

  /**
   * Create a new NRPTI master and flavour records.
   *
   * @async
   * @param {object} nrptiRecord NRPTI record (required)
   * @returns {object} object containing the newly inserted master and flavour records
   * @memberof Warning
   */
  async createItem(nrptiRecord) {
    if (!nrptiRecord) {
      throw Error('createItem - required nrptiRecord must be non-null.');
    }

    try {
      // Create the document for this record.
      const document = await createURLDocument(nrptiRecord.document.fileName, 'BCOGC Import', nrptiRecord.document.url, ['public']);
      // Remove temporary document property.
      delete nrptiRecord.document;

      return super.createItem({
        ...nrptiRecord,
        documents: [document._id]
      });
    } catch (error) {
      defaultLog.error(`Failed to create ${this.recordType._schemaName} record: ${error.message}`);
    }
  }

  /**
   * Searches for an existing master record, and returns it if found.
   *
   * @param {*} nrptiRecord
   * @returns {object} existing NRPTI master record, or null if none found
   * @memberof Warning
   */
  async findExistingRecord(nrptiRecord) {
    if (!nrptiRecord._sourceRefOgcWarningId) {
      return null;
    }

    const masterRecordModel = mongoose.model(this.recordType._schemaName);

    return await masterRecordModel
      .findOne({
        _schemaName: this.recordType._schemaName,
        _sourceRefOgcWarningId: nrptiRecord._sourceRefOgcWarningId
      })
      .populate('_flavourRecords', '_id _schemaName');
  }
}

module.exports = Warning;
