const Tickets = require('./tickets-utils');
const RECORD_TYPE = require('../../utils/constants/record-type-enum');

describe('transformRecord', () => {
  const tickets = new Tickets('authPayload', RECORD_TYPE.Ticket, null);

  it('throws an error if null csvRow parameter provided', () => {
    expect(() => tickets.transformRecord(null)).toThrow('transformRecord - required csvRow must be non-null.');
  });

  it('returns basic fields if empty csvRow parameter provided', () => {
    const result = tickets.transformRecord({});

    expect(result).toEqual({
      _schemaName: 'Ticket',
      _sourceRefCoorsId: '',

      recordType: 'Ticket',
      dateIssued: null,
      issuedTo: { dateOfBirth: null, firstName: '', lastName: '', middleName: '', type: 'Individual' },
      issuingAgency: '',
      author: '',      
      legislation: { act: '', paragraph: '', regulation: '', section: '', subSection: '' },
      location: '',
      offence: '',
      recordName: '',
      penalties: [{ description: '', penalty: { type: 'Dollars', value: null }, type: 'Fined' }],

      sourceSystemRef: 'coors-csv'
    });
  });

  it('transforms csv row fields into NRPTI record fields', () => {
    const result = tickets.transformRecord({
      contravention_enforcement_id: 123,
      ticket_date: '12/30/2019',
      case_number: 'P-123456',
      act: 'Fisheries Canada',
      regulation_description: 'regulation123',
      section: 'section123',
      sub_section: 'subSection123',
      paragraph: 'paragraph123',
      description: 'description123',
      business_name: 'businessName123',
      location_of_violation: 'location123',
      penalty: '10000'
    });

    expect(result).toEqual({
      _schemaName: 'Ticket',
      _sourceRefCoorsId: 123,

      recordType: 'Ticket',
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
      recordName: 'description123',
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
