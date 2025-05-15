const ObjectID = require('mongodb').ObjectID;

const Inspections = require('./inspections-utils');
const RECORD_TYPE = require('../../utils/constants/record-type-enum');
const MiscConstants = require('../../utils/constants/misc');

describe('transformRecord', () => {
  const inspections = new Inspections('authPayload', RECORD_TYPE.Inspection, null);

  it('throws an error if null csvRow parameter provided', () => {
    expect(() => inspections.transformRecord(null)).toThrow('transformRecord - required csvRow must be non-null.');
  });

  it('returns basic fields if empty csvRow parameter provided', () => {
    const result = inspections.transformRecord({});

    expect(result).toEqual({
      _schemaName: 'Inspection',
      _sourceRefNrisId: '',

      recordType: 'Inspection',
      author: 'AGENCY_FLNR_NRO',
      dateIssued: null,
      issuedTo: { dateOfBirth: null, firstName: '', lastName: '', middleName: '', type: 'Individual', companyName: '' },
      description: '-',
      sourceSystemRef: 'nris-flnr-csv',
      issuingAgency: 'AGENCY_FLNR_NRO',
      legislation: [{ legislationDescription: 'Inspection to verify compliance with regulatory requirement' }],
      location: null,
      outcomeDescription: 'undefined - undefined',
      recordName: '-',
      summary: '-',
      centroid: null
    });
  });

  it('transforms csv row fields into NRPTI record fields', () => {
    const result = inspections.transformRecord({
      'record id': 123,
      date: '2020-11-23',
      activity: 'Road - Maintenance',
      region: 'West Coast',
      longitude: '-125',
      latitude: '50',
      'compliance status': 'Compliant',
      'client no': '170181',
      'client / complainant': 'LNG Canada Development Inc.'
    });

    expect(result).toEqual({
      _schemaName: 'Inspection',
      _sourceRefNrisId: 123,

      recordType: 'Inspection',
      recordName: 'NRO Inspection - Record 123',
      author: 'AGENCY_FLNR_NRO',
      description: 'Activity Inspected: Road - Maintenance',
      summary: 'Activity Inspected: Road - Maintenance',
      dateIssued: expect.any(String),
      issuedTo: {
        companyName: 'LNG Canada Development Inc.',
        type: MiscConstants.IssuedToEntityTypes.Company
      },
      issuingAgency: 'AGENCY_FLNR_NRO',
      legislation: [
        {
          legislationDescription: 'Inspection to verify compliance with regulatory requirement'
        }
      ],
      location: 'West Coast',
      outcomeDescription: 'Compliant',
      projectName: 'LNG Canada Development Inc.',
      _epicProjectId: ObjectID('588511d0aaecd9001b826192'),
      centroid: [-125, 50],

      sourceSystemRef: 'nris-flnr-csv'
    });
  });
});
