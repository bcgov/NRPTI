const Inspections = require('./inspection-utils');
const RECORD_TYPE = require('../../utils/constants/record-type-enum');
const MiscConstants = require('../../utils/constants/misc');

const descriptionString = 'Inspection to verify compliance with regulatory requirement';

describe('transformRecord', () => {
  const inspections = new Inspections('authPayload', RECORD_TYPE.Inspection, null);

  it('throws an error if null csvRow parameter provided', () => {
    expect(() => inspections.transformRecord(null)).toThrow('transformRecord - required csvRow must be non-null.');
  });

  it('returns basic fields if empty csvRow parameter provided', () => {
    const result = inspections.transformRecord({});

    expect(result).toEqual({
      _schemaName: 'Inspection',
      _sourceRefAgriMisId: '',

      recordType: 'Inspection',
      author: 'Ministry of Agriculture',
      dateIssued: null,
      issuedTo: {
        type: MiscConstants.IssuedToEntityTypes.Company,
        companyName: ''
      },
      description: descriptionString,
      outcomeDescription: '',
      sourceSystemRef: 'agri-mis-csv',
      issuingAgency: 'Ministry of Agriculture and Food',
      legislation: [
        {
          act: 'Food Safety Act',
          section: 9,

          legislationDescription: descriptionString
        }
      ],
      location: null,
      recordName: ''
    });
  });

  it('transforms csv row fields into NRPTI record fields', () => {
    const result = inspections.transformRecord({
      'issue no.': 123.4,
      'created ': '11/23/2020',
      region: 'Test Region',
      est: { ' name': 'ACME Meat' },
      regulation: 'MR 123 Record Requirements',
      'suspension status': '',
      'initiating inspector': 'Bob Testperson'
    });

    expect(result).toEqual({
      _schemaName: 'Inspection',
      _sourceRefAgriMisId: 123.4,

      recordType: 'Inspection',
      recordName: 'Compliance issue 123.4',
      author: 'Ministry of Agriculture',
      description: descriptionString,
      dateIssued: expect.any(String),
      issuedTo: {
        companyName: 'ACME Meat',
        type: MiscConstants.IssuedToEntityTypes.Company
      },
      issuingAgency: 'Ministry of Agriculture and Food',
      legislation: [
        {
          act: 'Food Safety Act',
          section: 9,

          legislationDescription: descriptionString
        }
      ],
      location: 'Test Region',
      outcomeDescription: 'Compliance issue - MR 123 Record Requirements',

      sourceSystemRef: 'agri-mis-csv'
    });
  });
});
