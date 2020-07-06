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
      issuingAgency: 'BC Oil and Gas Commission',
      author: 'BC Government',
      recordName: 'Inspection Number -',
      legislation: { act: 'Oil and Gas Activities Act', regulation: '', section: '57', subSection: '4' },
      location: 'British Columbia',
      legislationDescription: 'Inspection to verify compliance with regulatory requirement',
      description:
        'Inspection to verify compliance with regulatory requirements. Activities Inspected: -; Inspection Result: -',
      outcomeDescription: 'Activities Inspected: -; Inspection Result: -',

      sourceSystemRef: 'bcogc-csv'
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
      dateIssued: expect.any(String),
      issuedTo: { companyName: 'Coastal GasLink Pipeline Ltd.', type: 'Company' },
      issuingAgency: 'BC Oil and Gas Commission',
      author: 'BC Government',
      recordName: 'Inspection Number 123456',
      legislation: {
        act: 'Oil and Gas Activities Act',
        regulation: 'Oil and Gas activities Act',
        section: '57',
        subSection: '4'
      },
      location: 'British Columbia',
      projectName: 'Coastal Gaslink',
      _epicProjectId: new ObjectID('588511c4aaecd9001b825604'),
      legislationDescription: 'Inspection to verify compliance with regulatory requirement',
      description:
        'Inspection to verify compliance with regulatory requirements. Activities Inspected: activitiesInspection123; Inspection Result: statusCancelled',
      outcomeDescription: 'Activities Inspected: activitiesInspection123; Inspection Result: statusCancelled',

      sourceSystemRef: 'bcogc-csv'
    });
  });

  describe('cleanCsVRow', () => {
    it('removes filler `-` from csv rows', () => {
      const result = inspections.cleanCsvRow({ dash: '-', noDash: null, string: 'abcd', number: 123 });

      expect(result).toEqual({ dash: '', noDash: null, string: 'abcd', number: 123 });
    });
  });
});
