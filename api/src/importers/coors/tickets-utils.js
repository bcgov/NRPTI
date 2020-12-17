const BaseRecordUtils = require('./base-record-utils');
const CsvUtils = require('./utils/csv-utils');
const BusinessLogicManager = require('../../utils/business-logic-manager');

const PenaltyType = 'Fined';
const PenaltyValueType = 'Dollars';

/**
 * COORS csv Tickets record handler.
 *
 * @class Tickets
 */
class Tickets extends BaseRecordUtils {
  /**
   * Creates an instance of Tickets.
   *
   * @param {*} auth_payload user information for auditing
   * @param {*} recordType an item from record-type-enum.js -> RECORD_TYPE
   * @param {*} csvRow an object containing the values from a single csv row.
   * @memberof Tickets
   */
  constructor(auth_payload, recordType, csvRow) {
    super(auth_payload, recordType, csvRow);
  }

  /**
   * Convert the csv row object into the object expected by the API record post/put controllers.
   *
   * @returns a ticket object matching the format expected by the API record post/put controllers.
   * @memberof Tickets
   */
  transformRecord(csvRow) {
    if (!csvRow) {
      throw Error('transformRecord - required csvRow must be non-null.');
    }

    const ticket = { ...super.transformRecord(csvRow) };

    ticket['_sourceRefCorsId'] = Number(csvRow['contravention_enforcement_id']) || '';

    ticket['recordType'] = 'Ticket';
    ticket['dateIssued'] = csvRow['ticket_date'] || null;
    ticket['issuingAgency'] = CsvUtils.getIssuingAgency(csvRow) || '';
    ticket['author'] = ticket['issuingAgency'];

    ticket['legislation'] = {
      act: (csvRow['act'] && BusinessLogicManager.applyBusinessLogicToAct(csvRow['act'])) || '',
      regulation: csvRow['regulation_description'] || '',
      section: csvRow['section'] || '',
      subSection: csvRow['sub_section'] || '',
      paragraph: csvRow['paragraph'] || ''
    };

    ticket['offence'] = csvRow['description'] || '';
    ticket['recordName'] = ticket['offence'];

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
        dateOfBirth: csvRow['birth_date'] || null
      };

      // Set dateOfBirth to current date for individuals with no names so they appear as "Unpublished" on NRCED
      // See https://bcmines.atlassian.net/browse/NRPT-222 for details
      if (!(ticket.issuedTo.firstName && ticket.issuedTo.middleName && ticket.issuedTo.lastName)) {
        ticket.issuedTo.dateOfBirth = new Date();
      }
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

    return ticket;
  }
}

module.exports = Tickets;
