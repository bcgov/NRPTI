const Orders = require('./orders-utils');
const RECORD_TYPE = require('../../utils/constants/record-type-enum');
const MiscConstants = require('../../utils/constants/misc');

describe('transformRecord', () => {
  const orders = new Orders('authPayload', RECORD_TYPE.Order, null);

  it('throws an error if null csvRow parameter provided', () => {
    expect(() => orders.transformRecord(null)).toThrow('transformRecord - required csvRow must be non-null.');
  });

  it('returns basic fields if empty csvRow parameter provided', () => {
    const result = orders.transformRecord({});

    expect(result).toEqual({
      _schemaName: 'Order',
      _sourceRefStringId: '',

      recordType: 'Order',
      author: 'Environmental Protection Division',
      dateIssued: null,
      issuedTo: { type: MiscConstants.IssuedToEntityTypes.Company, companyName: '' },
      sourceSystemRef: 'ams-csv',
      issuingAgency: 'Environmental Protection Division',
      legislation: { act: 'Environmental Management Act' },
      location: 'British Columbia',
      recordName: '-',
      summary: 'Authorization Number: undefined',
      centroid: null
    });
  });

  it('transforms csv row fields into NRPTI record fields', () => {
    const result = orders.transformRecord({
      authnumber: 123,
      issuedate: '2020-11-23',
      region: 'Authorizations - North Region',
      longitude: '-125',
      latitude: '50',
      authorizationtype: 'Pollution Abatement',
      clientname: 'ABC Company'
    });

    expect(result).toEqual({
      _schemaName: 'Order',
      _sourceRefStringId: 123,

      recordType: 'Order',
      recordName: 'AMS Authorization # 123',
      author: 'Environmental Protection Division',
      summary: 'Authorization Number: 123',
      dateIssued: expect.any(String),
      issuedTo: {
        companyName: 'ABC Company',
        type: MiscConstants.IssuedToEntityTypes.Company
      },
      issuingAgency: 'Environmental Protection Division',
      legislation: {
        act: 'Environmental Management Act',
        section: 83
      },
      legislationDescription: 'Pollution Abatement Order',
      location: 'North Region',
      centroid: [-125, 50],

      sourceSystemRef: 'ams-csv'
    });
  });
});
