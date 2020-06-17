const BaseRecordUtils = require('./base-record-utils');
const CsvUtils = require('./utils/csv-utils');
const Utils = require('../../utils/utils');
const BusinessLogicManager = require('../../utils/business-logic-manager');

const DateIssuedFormat = 'DD/MM/YYYY';
const BirthDateFormat = 'YYYY/MM/DD';
const PenaltyType = 'Fined';
const PenaltyValueType = 'Dollars';

/**
 * CORS csv Tickets record handler.
 *
 * @class Tickets
 */
class Tickets extends BaseRecordUtils {
  /**
   * Creates an instance of Tickets.
   *
   * @param {*} auth_payload user information for auditing
   * @param {*} recordType an item from record-type-enum.js -> RECORD_TYPE
   * @param {*} csvRow an array containing the values from a single csv row.
   * @memberof Tickets
   */
  constructor(auth_payload, recordType, csvRow) {
    super(auth_payload, recordType, csvRow);
  }

  /**
   * Convert the csv row values array into the object expected by the API record post/put controllers.
   *
   * @returns a ticket object matching the format expected by the API record post/put controllers.
   * @memberof Tickets
   */
  async transformRecord(csvRow) {
    if (!csvRow) {
      throw Error('transformRecord - required csvRow must be non-null.');
    }

    const ticket = { ...(await super.transformRecord(csvRow)) };

    ticket['_sourceRefCorsId'] = Number(csvRow['contravention_enforcement_id']) || '';

    ticket['recordType'] = 'Ticket';
    ticket['dateIssued'] = Utils.parseDate(csvRow['ticket_date'], DateIssuedFormat) || null;
    ticket['issuingAgency'] = CsvUtils.getIssuingAgency(csvRow) || '';

    ticket['legislation'] = {
      act: (csvRow['act'] && BusinessLogicManager.applyBusinessLogicToAct(csvRow['act'])) || '',
      regulation: csvRow['regulation_description'] || '',
      section: csvRow['section'] || '',
      subSection: csvRow['sub_section'] || '',
      paragraph: csvRow['paragraph'] || ''
    };

    ticket['offence'] = csvRow['description'] || '';

    const entityType = CsvUtils.getEntityType(csvRow) || null;

    if (entityType === 'Company') {
      ticket['issuedTo'] = {
        type: 'Company',
        companyName: csvRow['business_name'] || ''
      };
    }

    if (entityType === 'Individual') {
      ticket['issuedTo'] = {
        type: 'Individual',
        firstName: csvRow['first_name'] || '',
        middleName: csvRow['middle_name'] || '',
        lastName: csvRow['last_name'] || '',
        dateOfBirth: Utils.parseDate(csvRow['birth_date'], BirthDateFormat) || null
      };
    }

    ticket['location'] = csvRow['location_of_violation'] || '';

    ticket['penalties'] = [
      {
        type: PenaltyType,
        penalty: {
          type: PenaltyValueType,
          value: (csvRow['penalty'] && Number(csvRow['penalty'])) || null
        },
        description: ''
      }
    ];

    ticket['description'] = csvRow['description'] || '';

    return ticket;
  }
}

module.exports = Tickets;
