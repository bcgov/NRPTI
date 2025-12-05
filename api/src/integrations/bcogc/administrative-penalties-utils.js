const mongoose = require('mongoose');
const ObjectID = require('mongodb').ObjectID;
const defaultLog = require('../../utils/logger')('bcogc-csv-orders-utils');
const RECORD_TYPE = require('../../utils/constants/record-type-enum');
const BaseRecordUtils = require('./base-record-utils');
const CsvUtils = require('./utils/csv-utils');
const { createURLDocument } = require('../../controllers/document-controller');

/**
 * CORS csv Administrative Penalty record handler.
 *
 * @class AdministrativePenalty
 */
class AdministrativePenalty extends BaseRecordUtils {
  /**
   * Creates an instance of AdministrativePenalty.
   *
   * @param {*} auth_payload user information for auditing
   * @param {*} recordType an item from record-type-enum.js -> RECORD_TYPE
   * @param {*} csvRow an object containing the values from a single csv row.
   * @memberof AdministrativePenalty
   */
  constructor(auth_payload, recordType, csvRow) {
    super(auth_payload, recordType, csvRow);
  }

  /**
   * Convert the csv row object into the object expected by the API record post/put controllers.
   * @param {string} actName a string that is the latest known act name governing this type of record <'Energy Resource Activities Act' on 2024-03-06>
   * @returns an order object matching the format expected by the API record post/put controllers.
   * @memberof AdministrativePenalty
   */
  transformRecord(csvRow, actName) {
    if (!csvRow) {
      throw Error('transformRecord - required csvRow must be non-null.');
    }

    const penalty = { ...super.transformRecord(csvRow) };

    penalty['recordType'] = RECORD_TYPE.AdministrativePenalty.displayName;
    penalty['_sourceRefOgcPenaltyId'] = csvRow['Title'];
    penalty['author'] = 'AGENCY_OGC';
    penalty['issuingAgency'] = 'AGENCY_OGC';
    penalty['recordName'] = csvRow['Title'];
    penalty['dateIssued'] = new Date(csvRow['Date Issued']);
    penalty['location'] = 'British Columbia';

    penalty['legislation'] = [
      {
        act: actName,
        section: 63,
        offence: 'Penalty for failure to comply with the Act or associated regulations'
      }
    ];

    penalty['issuedTo'] = {
      type: 'Company',
      companyName: csvRow['Proponent'] || ''
    };

    penalty['penalties'] = this.getPenalties(csvRow);

    // Prepare for the document to be created later.
    penalty['document'] = {
      fileName: csvRow['Filename'],
      url: csvRow['File URL']
    };

    const projectDetails = CsvUtils.getProjectNameAndEpicProjectId(csvRow);
    // Only update NRPTI project details if the csv contains known project information
    if (projectDetails) {
      penalty['projectName'] = projectDetails.projectName;
      penalty['_epicProjectId'] =
        (projectDetails._epicProjectId && new ObjectID(projectDetails._epicProjectId)) || null;
    }

    return penalty;
  }

  /**
   * Create a new NRPTI master and flavour records.
   *
   * @async
   * @param {object} nrptiRecord NRPTI record (required)
   * @returns {object} object containing the newly inserted master and flavour records
   * @memberof AdministrativePenalty
   */
  async createItem(nrptiRecord) {
    if (!nrptiRecord) {
      throw Error('createItem - required nrptiRecord must be non-null.');
    }

    try {
      // Create the document for this record.
      const document = await createURLDocument(
        nrptiRecord.document.fileName,
        'BCOGC Import',
        nrptiRecord.document.url,
        ['public']
      );
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
   * @memberof AdministrativePenalty
   */
  async findExistingRecord(nrptiRecord) {
    if (!nrptiRecord._sourceRefOgcPenaltyId) {
      return null;
    }

    const masterRecordModel = mongoose.model(this.recordType._schemaName);

    return await masterRecordModel
      .findOne({
        _schemaName: this.recordType._schemaName,
        _sourceRefOgcPenaltyId: nrptiRecord._sourceRefOgcPenaltyId
      })
      .populate('_flavourRecords', '_id _schemaName');
  }

  /**
   * Gets the penalty based on the value amount in the CSV row.
   *
   * @param {*} csvRow
   * @returns {Array<Object>} Object containing the penalties
   * @memberof AdministrativePenalty
   */
  getPenalties(csvRow) {
    // Remove the `$` at the start.
    let penaltyAmount = csvRow['Penalty Amount (CAD)'].substr(1);

    if (penaltyAmount === '') {
      return [
        {
          type: '',
          penalty: null,
          description:
            'No contravention was found to have occurred, and no penalty was assessed. See the attached document for additional details.'
        }
      ];
    }

    penaltyAmount = parseInt(penaltyAmount, 10);

    if (penaltyAmount === 0) {
      return [
        {
          type: '',
          penalty: null,
          description:
            'Although a contravention occurred, a penalty was not assessed. See the attached document for additional details.'
        }
      ];
    }

    if (penaltyAmount > 0) {
      return [
        {
          type: 'Fined',
          penalty: {
            type: 'Dollars',
            value: penaltyAmount
          },
          description: ''
        }
      ];
    }

    return [];
  }
}

module.exports = AdministrativePenalty;
