const Tickets = require('./tickets-utils');
const RECORD_TYPE = require('../../utils/constants/record-type-enum');
const MiscConstants = require('../../utils/constants/misc');

describe('transformRecord', () => {
  const tickets = new Tickets('authPayload', RECORD_TYPE.Ticket, null);

  it('throws an error if null csvRow parameter provided', () => {
    expect(() => tickets.transformRecord(null)).toThrow('transformRecord - required csvRow must be non-null.');
  });

  it('returns basic fields if empty csvRow parameter provided', () => {
    const result = tickets.transformRecord({});

    expect(result).toEqual({
      _schemaName: 'Ticket',
      _sourceRefStringId: '',

      recordName: '',
      recordType: 'Ticket',
      issuingAgency: 'AGENCY_FLNR_NRO',
      author: 'AGENCY_FLNR_NRO',
      location: '',
      dateIssued: null,

      penalties: [{ description: 'Penalty Amount (CAD)', penalty: { type: 'Dollars', value: null }, type: 'Fined' }],
      legislation: [{ act: '', paragraph: '', regulation: '', section: '', subSection: '', offence: '' }],
      issuedTo: { dateOfBirth: null, firstName: '', lastName: '', middleName: '', type: 'Individual' },

      sourceSystemRef: 'era-csv'
    });
  });

  it('transforms csv row fields into NRPTI record fields', () => {
    const result = tickets.transformRecord({
      case_contravention_id: '123',
      enforcement_action_id: '123',
      region: 'somewhere',
      org_unit_name: 'abcd',
      article_description: 'bad manners',
      service_date: '02/24/2021',
      fine_amount: '1000000',
      act_description: 'very rude act',
      reg_description: 'asdfasdf',
      section: '123',
      sub_section: '1234',
      paragraph: '12',
      fc_client_name: 'bad guy jim'
    });

    expect(result).toEqual({
      _schemaName: 'Ticket',
      _sourceRefStringId: '123-123',

      recordName: 'bad manners',
      location: 'somewhere',
      recordType: 'Ticket',
      issuingAgency: 'AGENCY_FLNR_NRO',
      author: 'AGENCY_FLNR_NRO',
      dateIssued: '02/24/2021',

      penalties: [
        {
          description: 'Penalty Amount (CAD)',
          penalty: {
            type: 'Dollars',
            value: 1000000
          },
          type: 'Fined'
        }
      ],

      issuedTo: {
        dateOfBirth: null,
        firstName: 'bad guy jim',
        lastName: '',
        middleName: '',
        type: MiscConstants.IssuedToEntityTypes.Individual
      },

      legislation: [
        {
          act: 'very rude act',
          regulation: 'asdfasdf',
          section: '123',
          subSection: '1234',
          paragraph: '12',

          offence: 'bad manners'
        }
      ],

      sourceSystemRef: 'era-csv'
    });
  });
});
