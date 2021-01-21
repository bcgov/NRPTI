const CourtConvictions = require('./court-conviction-utils');
const RECORD_TYPE = require('../../utils/constants/record-type-enum');

describe('transformRecord', () => {
  const courtConvictions = new CourtConvictions('authPayload', RECORD_TYPE.CourtConviction , null);

  it('throws an error if null csvRow parameter provided', () => {
    expect(() => courtConvictions.transformRecord(null)).toThrow('transformRecord - required csvRow must be non-null.');
  });

  it('returns basic fields if empty csvRow parameter provided', () => {
    const result = courtConvictions.transformRecord({});

    expect(result).toEqual({
      _schemaName: 'CourtConviction',
      _sourceRefCoorsId: '',

      recordType: 'Court Conviction',
      dateIssued: null,
      issuedTo: { dateOfBirth: null, firstName: '', lastName: '', middleName: '', type: 'Individual' },
      issuingAgency: '',
      author: '',
      legislation: { act: '', paragraph: '', regulation: '', section: '', subSection: '' },
      location: '',
      offence: '',
      recordName: '',
      penalties: [{ description: '', penalty: { type: null, value: null }, type: null }],

      sourceSystemRef: 'coors-csv'
    });
  });

  it('transforms csv row fields into NRPTI record fields', () => {
    const result = courtConvictions.transformRecord({
      case_contravention_id: 123,
      enforcement_action_id: 456,
      final_decision_date: '12/30/2019',
      case_no: 'P-123456',
      act: 'Fisheries Canada',
      regulation_description: 'regulation123',
      section: 'section123',
      sub_section: 'subSection123',
      paragraph: 'paragraph123',
      description: 'description123',
      business_name: 'businessName123',
      location: 'location123',
      summary: 'Fined',
      penalty_amount: '10000',
      penalty_unit_code: 'Dollars'
    });

    expect(result).toEqual({
      _schemaName: 'CourtConviction',
      _sourceRefCoorsId: '123-456',

      recordType: 'Court Conviction',
      dateIssued: expect.any(String),
      issuedTo: {
        companyName: 'businessName123',
        type: 'Company'
      },
      issuingAgency: 'BC Parks',
      author: 'BC Parks',
      legislation: {
        act: 'Fisheries Canada',
        paragraph: 'paragraph123',
        regulation: 'regulation123',
        section: 'section123',
        subSection: 'subSection123'
      },
      location: 'location123',
      offence: 'description123',
      recordName: 'Case Number P-123456',
      penalties: [
        {
          description: '',
          penalty: {
            type: 'Dollars',
            value: 10000
          },
          type: 'Fined'
        }
      ],

      sourceSystemRef: 'coors-csv'
    });
  });
});
