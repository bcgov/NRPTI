const BaseRecordUtils = require('./base-record-utils');
const CsvUtils = require('./utils/csv-utils');
// const BusinessLogicManager = require('../../utils/business-logic-manager');

/**
 * COORS csv AdminSanctions record handler.
 *
 * @class AdminSanctions
 */
class AdminSanctions extends BaseRecordUtils {
  /**
   * Creates an instance of Tickets.
   *
   * @param {*} auth_payload user information for auditing
   * @param {*} recordType an item from record-type-enum.js -> RECORD_TYPE
   * @param {*} csvRow an object containing the values from a single csv row.
   * @memberof AdminSanctions
   */
  constructor(auth_payload, recordType, csvRow) {
    super(auth_payload, recordType, csvRow);
  }

  /**
   * Convert the csv row object into the object expected by the API record post/put controllers.
   *
   * @returns a ticket object matching the format expected by the API record post/put controllers.
   * @memberof AdminSanctions
   */
  transformRecord(csvRow) {
    if (!csvRow) {
      throw Error('transformRecord - required csvRow must be non-null.');
    }

    const adminSanction = { ...super.transformRecord(csvRow) };

    //common fields
    let sourceRefId = '';
    if (csvRow['case_contravention_id'] && csvRow['enforcement_action_id']) {
      sourceRefId = `${csvRow['case_contravention_id']}-${csvRow['enforcement_action_id']}`
    }
    adminSanction['_sourceRefCoorsId'] = sourceRefId;
    adminSanction['recordType'] = 'Administrative Sanction';
    adminSanction['recordName'] = (csvRow['case_no'] && `Case No. ${csvRow['case_no']}`) || '';

    const ministry = 'Ministry of Forests, Lands and Natural Resource Operations'
    adminSanction['issuingAgency'] = ministry;
    adminSanction['author'] = ministry;
    adminSanction['dateIssued'] = csvRow['effective_date'] || null;


    const entityType = CsvUtils.getEntityType(csvRow) || null;
    if (entityType === 'Company') {
      adminSanction['issuedTo'] = {
        type: 'Company',
        companyName: csvRow['business_name'] || ''
      };
    }

    if (entityType === 'Individual') {
      adminSanction['issuedTo'] = {
        type: 'Individual',
        firstName: csvRow['first_name'] || '',
        middleName: csvRow['middle_name'] || '',
        lastName: csvRow['last_name'] || '',
        dateOfBirth: csvRow['birth_date'] || null
      };
    }

    adminSanction['location'] = csvRow['location_of_violation'] || '';

    // Section 85 specific fields
    if (csvRow['record_type_code'] === 'S85' && csvRow['business_reviewed_ind'] === 'Y') {
      adminSanction['legislation'] = {
        act: 'Wildlife Act',
        regulation: '',
        section: 85,
        subSection: '',
        paragraph: ''
      };
      adminSanction['legislationDescription'] = 'Angling, hunting and/or Limited Entry Hunting licence action for failure to pay fine';

      adminSanction['penalties'] = [
        {
          type: 'Other',
          penalty: {
            type: 'Other',
            value: null
          },
          description: 'Licences, LEH, Permits Cancelled'
        }
      ];
      adminSanction['summary'] = this.buildSummary(csvRow, 85);
    // Section 24 specific fields
    } else if (csvRow['record_type_code'] === 'S24' && csvRow['business_reviewed_ind'] === 'Y') {
      adminSanction['legislation'] = {
        act: 'Wildlife Act',
        regulation: '',
        section: 24,
        subSection: '',
        paragraph: ''
      };
      adminSanction['legislationDescription'] = 'Angling, hunting, firearm and/or LEH licence action prompted by violations';

      adminSanction['penalties'] = [
        {
          type: 'Other',
          penalty: {
            type: 'Other',
            value: null
          },
          description: 'Suspension or cancellation of licence(s)'
        }
      ];
      adminSanction['summary'] = this.buildSummary(csvRow, 24);
    } else {
      // row not reviewed by business, do not process
      return null;
    }

    return adminSanction;
  }

  buildSummary(csvRow, sectionNum) {
    let legislation;
    if (!csvRow['regulation_description']) {
      legislation = csvRow['act']
    } else {
      legislation = csvRow['regulation_description']
    }

    let enforcement = '';
    if (csvRow['enforcement_licence_code'] === 'DDC') {
      enforcement = "Director's decision to suspend or cancel licence";
    } else if (csvRow['enforcement_licence_code' === 'AUT']) {
      enforcement = 'Automatic licence suspension or cancellation'
    } else {
      enforcement = 'Licence action'
    }

    const section = csvRow['section'] || '';
    const sub_section = (csvRow['sub_section'] && ` (${csvRow['sub_section']})`)|| '';
    const paragraph = (csvRow['paragraph'] && ` (${csvRow['paragraph']})`)|| '';
    const description = csvRow['violations_prompting_action'] || '';
    let summary = '';
    if (sectionNum === 85) {
      summary = `Licence action resulting from an unpaid fine for an offense under the ${legislation} ${section}${sub_section}${paragraph} - ${description}`;
    } else {
      summary = `${enforcement} due to a violation under the ${legislation} ${section}${sub_section}${paragraph} - ${description}`;
    }

    return summary;
  }
}

module.exports = AdminSanctions;
