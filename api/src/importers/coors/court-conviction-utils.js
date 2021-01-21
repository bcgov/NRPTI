const BaseRecordUtils = require('./base-record-utils');
const CsvUtils = require('./utils/csv-utils');
const BusinessLogicManager = require('../../utils/business-logic-manager');

/**
 * COORS csv CourtConvictions record handler.
 *
 * @class CourtConvictions
 */
class CourtConvictions extends BaseRecordUtils {
  /**
   * Creates an instance of Tickets.
   *
   * @param {*} auth_payload user information for auditing
   * @param {*} recordType an item from record-type-enum.js -> RECORD_TYPE
   * @param {*} csvRow an object containing the values from a single csv row.
   * @memberof CourtConvictions
   */
  constructor(auth_payload, recordType, csvRow) {
    super(auth_payload, recordType, csvRow);
  }

  /**
   * Convert the csv row object into the object expected by the API record post/put controllers.
   *
   * @returns a ticket object matching the format expected by the API record post/put controllers.
   * @memberof CourtConvictions
   */
  transformRecord(csvRow) {
    if (!csvRow) {
      throw Error('transformRecord - required csvRow must be non-null.');
    }

    const conviction = { ...super.transformRecord(csvRow) };

    let sourceRefId = '';
    if (csvRow['case_contravention_id'] && csvRow['enforcement_action_id']) {
      sourceRefId = `${csvRow['case_contravention_id']}-${csvRow['enforcement_action_id']}`
    }
    conviction['_sourceRefCoorsId'] = sourceRefId;

    conviction['recordType'] = 'Court Conviction';
    conviction['dateIssued'] = csvRow['final_decision_date'] || null;
    conviction['issuingAgency'] = CsvUtils.getIssuingAgency(csvRow) || '';
    conviction['author'] = conviction['issuingAgency'];

    conviction['legislation'] = {
      act: (csvRow['act'] && BusinessLogicManager.applyBusinessLogicToAct(csvRow['act'])) || '',
      regulation: csvRow['regulation_description'] || '',
      section: csvRow['section'] || '',
      subSection: csvRow['sub_section'] || '',
      paragraph: csvRow['paragraph'] || ''
    };

    conviction['offence'] = csvRow['description'] || '';
    conviction['recordName'] = (csvRow['case_no'] && `Case Number ${csvRow['case_no']}`) || '';

    const entityType = CsvUtils.getEntityType(csvRow) || null;

    if (entityType === 'Company') {
      conviction['issuedTo'] = {
        type: 'Company',
        companyName: csvRow['business_name'] || ''
      };
    }

    if (entityType === 'Individual') {
      conviction['issuedTo'] = {
        type: 'Individual',
        firstName: csvRow['first_name'] || '',
        middleName: csvRow['middle_name'] || '',
        lastName: csvRow['last_name'] || '',
        dateOfBirth: csvRow['birth_date'] || null
      };
    }

    conviction['location'] = csvRow['location'] || '';

    const penaltyType = CsvUtils.getPenalty(csvRow['summary']);
    const penaltyUnits = CsvUtils.getPenaltyUnits(csvRow['penalty_unit_code'])
    conviction['penalties'] = [
      {
        type: penaltyType,
        penalty: {
          type: penaltyUnits,
          value: (csvRow['penalty_amount'] && Number(csvRow['penalty_amount'])) || null
        },
        description: ''
      }
    ];

    return conviction;
  }
}

module.exports = CourtConvictions;
