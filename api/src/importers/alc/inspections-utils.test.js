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
      _sourceRefStringId: '',

      recordType: 'Inspection',
      author: 'Agricultural Land Commission',
      dateIssued: null,
      issuedTo: { dateOfBirth: null, firstName: '', lastName: '', middleName: '', type: 'Individual' },
      description: '-',
      sourceSystemRef: 'alc-csv',
      issuingAgency: 'Agricultural Land Commission',
      legislation: {
        act: 'Agricultural Land Commission Act',
        section: '49',
        subSection: '1'
      },
      legislationDescription: 'Inspection to verify compliance with regulatory requirements',
      location: null,
      outcomeDescription: 'undefined - undefined',
      recordName: '-',
      summary: '-'
    });
  });

  it('transforms csv row fields into NRPTI record fields', () => {
    const result = inspections.transformRecord({
      'record id': 123,
      date: '2020-11-23',
      'local government': 'West Coast',
      reason: 'reason',
      section: '20 (1) Non-farm use of land without authority',
      'c&e actions': 'Notice of Contravention',
      'compliance status': 'Alleged Non-Compliance'
    });

    expect(result).toEqual({
      _schemaName: 'Inspection',
      _sourceRefStringId: 123,

      recordType: 'Inspection',
      recordName: 'ALC Inspection - Record 123',
      author: 'Agricultural Land Commission',
      description: 'Activity Inspected: reason',
      summary: 'Activity Inspected: reason',
      dateIssued: expect.any(String),
      issuedTo: {
        dateOfBirth: null,
        firstName: '',
        lastName: '',
        middleName: '',
        type: MiscConstants.IssuedToEntityTypes.Individual
      },
      issuingAgency: 'Agricultural Land Commission',
      legislation: {
        act: 'Agricultural Land Commission Act',
        section: '49',
        subSection: '1'
      },
      legislationDescription:
        'Inspection to verify compliance with regulatory requirements',
      location: 'West Coast',
      outcomeDescription: 'Alleged Non-Compliance - Notice of Contravention; Alleged Contravention: 20 (1) Non-farm use of land without authority',
      sourceSystemRef: 'alc-csv'
    });
  });
});
