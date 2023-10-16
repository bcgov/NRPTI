const CourtConvictions = require('./court-conviction-utils');
const RECORD_TYPE = require('../../utils/constants/record-type-enum');

describe('transformRecord', () => {
  const courtConvictions = new CourtConvictions('authPayload', RECORD_TYPE.CourtConviction, null);

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
      legislation: [{ act: '', paragraph: '', regulation: '', section: '', subSection: '', offence: '' }],
      location_of_violation: '',
      recordName: '',
      penalties: [{ description: '', penalty: { type: null, value: null }, type: null }],

      sourceSystemRef: 'coors-csv'
    });
  });

  it('transforms CSV row fields into NRPTI record fields for non GTYJ enforcement outcomes', () => {
    const mockRecord = {
      case_contravention_id: 1,
      enforcement_action_id: 2,
      final_decision_date: '12/31/3000',
      case_no: 'p-TestNumber1',
      act: 'Test Acts',
      regulation_description: 'This is a lil description of the regulation',
      section: 'Section1',
      sub_section: 'SubSection2',
      paragraph: 'Paragraph3',
      description: 'This is a lil description of the thing',
      business_name: 'A Great Business',
      location: 'Mars',
      summary: 'Fined',
      penalty_amount: '10000000',
      penalty_unit_code: 'Dollars',
    }

    expect(courtConvictions.transformRecord(mockRecord)).toEqual({
      _schemaName: 'CourtConviction',
      _sourceRefCoorsId: `${mockRecord.case_contravention_id}-${mockRecord.enforcement_action_id}`,
      recordType: 'Court Conviction',
      dateIssued: mockRecord.final_decision_date,
      issuedTo: {
        companyName: mockRecord.business_name,
        type: 'Company'
      },
      issuingAgency: 'AGENCY_ENV_BCPARKS',
      author: 'AGENCY_ENV_BCPARKS',
      legislation: [
        {
          act: mockRecord.act,
          paragraph: mockRecord.paragraph,
          regulation: mockRecord.regulation_description,
          section: mockRecord.section,
          subSection: mockRecord.sub_section,
          offence: mockRecord.description,
        }
      ],
      location: mockRecord.location,
      recordName: `Case Number ${mockRecord.case_no}`,
      penalties: [
        {
          description: '',
          penalty: {
            type: mockRecord.penalty_unit_code,
            value: Number(mockRecord.penalty_amount),
          },
          type: mockRecord.summary
        }
      ],
      sourceSystemRef: 'coors-csv'
    })
  })

  it('transforms CSV row fields into NRPTI record fields for GTYJ enforcement outcomes', () => {
    const mockRecord = {
      case_contravention_id: 1,
      enforcement_action_id: 2,
      enforcement_outcome: 'GTYJ',
      ticket_date: '12/31/3000',
      case_number: 'p-TestNumber1',
      act: 'Test Acts',
      regulation_description: 'This is a lil description of the regulation',
      section: 'Section1',
      sub_section: 'SubSection2',
      paragraph: 'Paragraph3',
      description: 'This is a lil description of the thing',
      business_name: 'A Great Business',
      location_of_violation: 'Mars',
      penalty: '10000000',
    }

    expect(courtConvictions.transformRecord(mockRecord)).toEqual({
      _schemaName: 'CourtConviction',
      _sourceRefCoorsId: `${mockRecord.case_contravention_id}-${mockRecord.enforcement_action_id}`,
      recordType: 'Court Conviction',
      dateIssued: mockRecord.ticket_date,
      issuedTo: {
        companyName: mockRecord.business_name,
        type: 'Company'
      },
      issuingAgency: 'BC Parks',
      author: 'BC Parks',
      legislation: [
        {
          act: mockRecord.act,
          paragraph: mockRecord.paragraph,
          regulation: mockRecord.regulation_description,
          section: mockRecord.section,
          subSection: mockRecord.sub_section,
          offence: mockRecord.description,
        }
      ],
      location: mockRecord.location_of_violation,
      recordName: `Case Number ${mockRecord.case_number}`,
      penalties: [
        {
          description: '',
          penalty: {
            type: 'Dollars',
            value: Number(mockRecord.penalty),
          },
          type: 'Fined'
        }
      ],
      summary: 'Referred to Provincial Court as a disputed violation ticket.',
      sourceSystemRef: 'coors-csv'
    })
  })
});
