const Inspections = require('./inspection-utils');
const RECORD_TYPE = require('../../utils/constants/record-type-enum');
const MiscConstants = require('../../utils/constants/misc');

const descriptionString = 'Inspection to verify compliance with regulatory requirements';

describe('transformRecord', () => {
  const inspections = new Inspections('authPayload', RECORD_TYPE.Inspection, null);

  it('throws an error if null csvRow parameter provided', () => {
    expect(() => inspections.transformRecord(null)).toThrow('transformRecord - required csvRow must be non-null.');
  });

  it('returns basic fields if empty csvRow parameter provided', () => {
    const result = inspections.transformRecord({});

    expect(result).toEqual({
      _schemaName: 'Inspection',
      _sourceRefAgriCmdbId: '',

      recordType: 'Inspection',
      author: 'Ministry of Agriculture',
      dateIssued: null,
      issuedTo: {
        type: MiscConstants.IssuedToEntityTypes.Company,
        companyName: ''
      },
      description: descriptionString,
      outcomeDescription: '',
      sourceSystemRef: 'agri-cmdb',
      issuingAgency: 'Ministry of Agriculture',
      legislation: {
        act: 'Fish and Seafood Act',
        section: 22
      },
      legislationDescription: descriptionString,
      location: null,
      recordName: '',
    });
  });

  it('transforms csv row fields into NRPTI record fields', () => {
    const result = inspections.transformRecord({
      'company name': 'Company 5',
      'date issued': '10-07-20',
      'inspection id': '1303',
      'inspection type': 'Higher Risk Inspection',
      'location':'Test Region',
      'regulation section': 'FSLR-s.34'
    },
    'Compliance issue(s) identified under the following acts or regulations: FSLR-s.34'
    );

    expect(result).toEqual({
      _schemaName: 'Inspection',
      _sourceRefAgriCmdbId: '1303',

      recordType: 'Inspection',
      recordName: 'Higher Risk Inspection',
      author: 'Ministry of Agriculture',
      description: descriptionString,
      dateIssued: expect.any(String),
      issuedTo: {
        companyName: 'Company 5',
        type: MiscConstants.IssuedToEntityTypes.Company
      },
      issuingAgency: 'Ministry of Agriculture',
      legislation: {
        act: 'Fish and Seafood Act',
        section: 22
      },
      legislationDescription: descriptionString,
      location: 'Test Region',
      outcomeDescription: 'Compliance issue(s) identified under the following acts or regulations: FSLR-s.34',

      sourceSystemRef: 'agri-cmdb'
    });
  });
});
