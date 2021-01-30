const AdminSanctions = require('./admin-sanction-utils');
const RECORD_TYPE = require('../../utils/constants/record-type-enum');

describe('transformRecord', () => {
  const adminSanctions = new AdminSanctions('authPayload', RECORD_TYPE.AdministrativeSanction , null);

  it('throws an error if null csvRow parameter provided', () => {
    expect(() => adminSanctions.transformRecord(null)).toThrow('transformRecord - required csvRow must be non-null.');
  });

  it('returns nothing if empty csvRow parameter provided', () => {
    const result = adminSanctions.transformRecord({});

    expect(result).toEqual(null);
  });

  it('transforms csv row fields into NRPTI record fields - section 85', () => {
    const result = adminSanctions.transformRecord({
      case_contravention_id: 123,
      enforcement_action_id: 456,
      case_no: 1234,
      record_type_code: 'S85',
      business_reviewed_ind: 'Y',

      effective_date: '12/30/2019',
      act: 'act123',
      regulation_description: 'regulation123',
      section: 'section123',
      sub_section: 'subSection123',
      paragraph: 'paragraph123',
      description: 'description123',
      business_name: 'businessName123',
      location_of_violation: 'location123',
      violations_prompting_action: 'description1234',
      comments: 'comment123'
    });

    expect(result).toEqual({
      _schemaName: 'AdministrativeSanction',
      _sourceRefCoorsId: '123-456',

      recordType: 'Administrative Sanction',
      recordName: 'Case No. 1234',
      dateIssued: expect.any(String),
      issuedTo: {
        companyName: 'businessName123',
        type: 'Company'
      },
      issuingAgency: 'Ministry of Forests, Lands and Natural Resource Operations',
      author: 'Ministry of Forests, Lands and Natural Resource Operations',
      legislation: {
        act: 'Wildlife Act',
        paragraph: '',
        regulation: '',
        section: 85,
        subSection: ''
      },
      legislationDescription: 'Angling, hunting and/or Limited Entry Hunting licence action for failure to pay fine',
      location: 'location123',
      penalties: [
        {
          description: 'Licences, LEH, Permits Cancelled',
          penalty: {
            type: 'Other',
            value: null
          },
          type: 'Other'
        }
      ],
      summary: 'Licence action resulting from an unpaid fine for an offense under the regulation123 & Section section123 & Sub-Section subSection123 & Paragraph paragraph123 - description1234',
      sourceSystemRef: 'coors-csv'
    });
  });

  // todo failing
  it('transforms csv row fields into NRPTI record fields - section 24', () => {
    const result = adminSanctions.transformRecord({
      case_contravention_id: 123,
      enforcement_action_id: 456,
      record_type_code: 'S24',
      business_reviewed_ind: 'Y',
      case_no: 1234,
      effective_date: '12/30/2019',
      act: 'act123',
      regulation_description: 'regulation123',
      section: 'section123',
      sub_section: 'subSection123',
      paragraph: 'paragraph123',
      description: 'description123',
      business_name: 'businessName123',
      location_of_violation: 'location456',
      violations_prompting_action: 'violations1234',
      summary: 'summary123',
      penalty: 'penalty123',
      enforcement_licence_code: 'DDC'
    });

    expect(result).toEqual({
      _schemaName: 'AdministrativeSanction',
      _sourceRefCoorsId: '123-456',

      recordType: 'Administrative Sanction',
      recordName: 'Case No. 1234',
      dateIssued: expect.any(String),
      issuedTo: {
        companyName: 'businessName123',
        type: 'Company'
      },
      issuingAgency: 'Ministry of Forests, Lands and Natural Resource Operations',
      author: 'Ministry of Forests, Lands and Natural Resource Operations',
      legislation: {
        act: 'Wildlife Act',
        paragraph: '',
        regulation: '',
        section: 24,
        subSection: ''
      },
      legislationDescription: 'Angling, hunting, firearm and/or LEH licence action prompted by violations',
      location: 'location456',
      penalties: [
        {
          description: 'Suspension or cancellation of licence(s)',
          penalty: {
            type: 'Other',
            value: null
          },
          type: 'Other'
        }
      ],
      summary: "Director's decision to suspend licence due to a violation under the regulation123 & section123 & Sub-Section subSection123 & Paragraph paragraph123 - violations1234",
      sourceSystemRef: 'coors-csv'
    });
  });
});
