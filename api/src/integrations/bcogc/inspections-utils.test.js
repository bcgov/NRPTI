const ObjectID = require('mongodb').ObjectID;
const Inspections = require('./inspections-utils');
const RECORD_TYPE = require('../../utils/constants/record-type-enum');

describe('transformRecord', () => {
  const inspections = new Inspections('authPayload', RECORD_TYPE.Inspection, null);

  it('throws an error if null csvRow parameter provided', () => {
    expect(() => inspections.transformRecord(null)).toThrow('transformRecord - required csvRow must be non-null.');
  });

  it('returns basic fields if empty csvRow parameter provided', () => {
    const result = inspections.transformRecord({});

    expect(result).toEqual({
      _schemaName: 'Inspection',
      _sourceRefOgcInspectionId: null,
      _sourceRefOgcDeficiencyId: null,

      recordType: 'Inspection',
      dateIssued: null,
      issuedTo: { companyName: '', type: 'Company' },
      issuingAgency: 'BC Energy Regulator',
      author: 'BC Energy Regulator',
      recordName: '-',
      legislation: [{ act: 'Oil and Gas Activities Act', section: '57', subSection: '4', legislationDescription: 'Inspection to verify compliance with regulatory requirement' }],
      location: 'British Columbia',
      description:
        'Inspection to verify compliance with regulatory requirements. Activities Inspected: -; Inspection Result: -',
      summary: '-',
      outcomeDescription: 'Activities Inspected: -; Inspection Result: -',

      sourceSystemRef: 'bcogc'
    });
  });

  it('transforms csv row fields into NRPTI record fields', () => {
    const result = inspections.transformRecord({
      contravention_enforcement_id: 123,
      'inspection number': '123456',
      'deficiency objectid': '321',
      'inspection date': '15-Feb-19',
      'regulation name': 'OGAA',
      operator: 'Coastal GasLink Pipeline Ltd.',
      location: 'British Columbia',
      description: 'description123',
      'activities inspected': 'activitiesInspection123',
      status: 'statusCancelled'
    });

    expect(result).toEqual({
      _schemaName: 'Inspection',
      _sourceRefOgcInspectionId: '123456',
      _sourceRefOgcDeficiencyId: '321',

      recordType: 'Inspection',
      dateIssued: expect.any(Date),
      issuedTo: { companyName: 'Coastal GasLink Pipeline Ltd.', type: 'Company' },
      issuingAgency: 'BC Energy Regulator',
      author: 'BC Energy Regulator',
      recordName: 'Inspection Number 123456',
      legislation: [
        {
          act: 'Oil and Gas Activities Act',
          section: '57',
          subSection: '4',
          legislationDescription: 'Inspection to verify compliance with regulatory requirement'
        }
      ],
      location: 'British Columbia',
      projectName: 'Coastal Gaslink',
      _epicProjectId: new ObjectID('588511c4aaecd9001b825604'),      
      description:
        'Inspection to verify compliance with regulatory requirements. Activities Inspected: activitiesInspection123; Inspection Result: statusCancelled',
      summary: 'Inspection Number 123456',
      outcomeDescription: 'Activities Inspected: activitiesInspection123; Inspection Result: statusCancelled',

      sourceSystemRef: 'bcogc'
    });
  });

  describe('cleanCsVRow', () => {
    it('removes filler `-` from csv rows', () => {
      const result = inspections.cleanCsvRow({ dash: '-', noDash: null, string: 'abcd', number: 123 });

      expect(result).toEqual({ dash: '', noDash: null, string: 'abcd', number: 123 });
    });
  });
});
