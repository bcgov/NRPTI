const mongoose = require('mongoose');
const ObjectID = require('mongodb').ObjectID;
const defaultLog = require('../../utils/logger')('bcogc-csv-orders-utils');
const RECORD_TYPE = require('../../utils/constants/record-type-enum');
const BaseRecordUtils = require('./base-record-utils');
const CsvUtils = require('./utils/csv-utils');
const { createURLDocument } = require('../../controllers/document-controller');
const moment = require('moment-timezone');

/**
 * CORS csv Order record handler.
 *
 * @class Orders
 */
class Orders extends BaseRecordUtils {
  /**
   * Creates an instance of Orders.
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
   * @returns an order object matching the format expected by the API record post/put controllers.
   * @memberof Orders
   */
  transformRecord(csvRow) {
    if (!csvRow) {
      throw Error('transformRecord - required csvRow must be non-null.');
    }

    const order = { ...super.transformRecord(csvRow) };

    order['recordType'] = RECORD_TYPE.Order.displayName;
    order['_sourceRefOgcOrderId'] = csvRow['Title'];
    order['author'] = 'AGENCY_OGC';
    order['issuingAgency'] = 'AGENCY_OGC';
    order['recordName'] = csvRow['Title'];
    
    try {
      order['dateIssued'] = csvRow['Date Issued'] ? moment.tz(csvRow['Date Issued'], "MM/DD/YYYY", "America/Vancouver").toDate() : null;
    } catch (error) {
      defaultLog.debug(csvRow['Date Issued'] + ' is not in the expected format MM/DD/YYYY');
      defaultLog.debug(error);
      order['dateIssued'] = null;
    }

    order['location'] = 'British Columbia';

    order['legislation'] = [
      {
        act: 'Energy Resource Activities Act',
        section: this.getOrderSection(csvRow),
        legislationDescription: this.getOrderSection(csvRow) === 49 ? 'General Order' : 'Action Order'
      }
    ];

    order['issuedTo'] = {
      type: 'Company',
      companyName: csvRow['Proponent'] || ''
    };

    // Prepare for the document to be created later.
    order['document'] = {
      fileName: csvRow['Filename'],
      url: csvRow['File URL'],
    };

    const projectDetails = CsvUtils.getProjectNameAndEpicProjectId(csvRow);
    // Only update NRPTI project details if the csv contains known project information
    if (projectDetails) {
      order['projectName'] = projectDetails.projectName;
      order['_epicProjectId'] =
        (projectDetails._epicProjectId && new ObjectID(projectDetails._epicProjectId)) || null;
    }

    return order;
  }

  /**
   * Create a new NRPTI master and flavour records.
   *
   * @async
   * @param {object} nrptiRecord NRPTI record (required)
   * @returns {object} object containing the newly inserted master and flavour records
   * @memberof Orders
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
   * @memberof Orders
   */
  async findExistingRecord(nrptiRecord) {
    if (!nrptiRecord._sourceRefOgcOrderId) {
      return null;
    }

    const masterRecordModel = mongoose.model(this.recordType._schemaName);

    return await masterRecordModel
      .findOne({
        _schemaName: this.recordType._schemaName,
        _sourceRefOgcOrderId: nrptiRecord._sourceRefOgcOrderId
      })
      .populate('_flavourRecords', '_id _schemaName');
  }

  /**
   * Returns the order section based on the title.
   * 
   * @param {Object} csvRow 
   * @returns {number} Section number
   * @memberof Orders
   */
  getOrderSection(csvRow) {
    if (csvRow.Title && csvRow.Title.includes('General Order')) {
      return 49;
    }

    if (csvRow.Title && csvRow.Title.includes('Action Order')) {
      return 50;
    }

    return null;
  }
}

module.exports = Orders;
