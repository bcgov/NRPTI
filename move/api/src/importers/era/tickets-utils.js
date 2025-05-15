const BaseRecordUtils = require('./base-record-utils');
const CsvUtils = require('./utils/csv-utils');
const MiscConstants = require('../../utils/constants/misc');

/**
 * ALC csv tickets record handler.
 *
 * @class tickets
 */
class tickets extends BaseRecordUtils {
  /**
   * Creates an instance of tickets.
   *
   * @param {*} auth_payload user information for auditing
   * @param {*} recordType an item from record-type-enum.js -> RECORD_TYPE
   * @param {*} csvRow an object containing the values from a single csv row.
   * @memberof tickets
   */
  constructor(auth_payload, recordType, csvRow) {
    super(auth_payload, recordType, csvRow);
  }

  /**
   * Convert the csv row object into the object expected by the API record post/put controllers.
   *
   * @returns an ticket object matching the format expected by the API record post/put controllers.
   * @memberof tickets
   */
  transformRecord(csvRow) {
    if (!csvRow) {
      throw Error('transformRecord - required csvRow must be non-null.');
    }

    const ticket = { ...super.transformRecord(csvRow) };

    ticket['_sourceRefStringId'] = '';

    if (csvRow['case_contravention_id'] && csvRow['enforcement_action_id']) {
      ticket['_sourceRefStringId'] = `${csvRow['case_contravention_id']}-${csvRow['enforcement_action_id']}`;
    }

    ticket['recordName'] = csvRow['article_description'] || '';
    ticket['issuingAgency'] = 'AGENCY_FLNR_NRO';
    ticket['author'] = 'AGENCY_FLNR_NRO';
    ticket['recordType'] = 'Ticket';
    ticket['dateIssued'] = csvRow['service_date'] || null;

    if (csvRow['region'] && csvRow['region'] !== '') {
      ticket['location'] = csvRow['region'];
    } else if (csvRow['org_unit_name'] && csvRow['org_unit_name'] !== '') {
      ticket['location'] = csvRow['org_unit_name'];
    } else {
      ticket['location'] = '';
    }

    ticket['penalties'] = [
      {
        type: 'Fined',
        penalty: {
          type: 'Dollars',
          value: (csvRow['fine_amount'] && Number(csvRow['fine_amount'])) || null
        },
        description: 'Penalty Amount (CAD)'
      }
    ];

    ticket['legislation'] = [
      {
        act: csvRow['act_description'] || '',
        regulation: csvRow['reg_description'] || '',
        section: csvRow['section'] || '',
        subSection: csvRow['sub_section'] || '',
        paragraph: csvRow['paragraph'] || '',

        offence: csvRow['article_description'] || ''
      }
    ];

    const entityType = CsvUtils.getEntityType(csvRow);

    if (entityType === MiscConstants.IssuedToEntityTypes.Company) {
      ticket['issuedTo'] = {
        type: MiscConstants.IssuedToEntityTypes.Company,
        companyName: csvRow['fc_client_name'] || ''
      };
    }

    if (entityType === MiscConstants.IssuedToEntityTypes.Individual) {
      ticket['issuedTo'] = {
        type: MiscConstants.IssuedToEntityTypes.Individual,
        dateOfBirth: null,
        firstName: csvRow['fc_client_name'] || '',
        lastName: '',
        middleName: ''
      };
    }

    return ticket;
  }
}

module.exports = tickets;
