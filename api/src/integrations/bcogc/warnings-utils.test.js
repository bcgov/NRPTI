const ObjectID = require('mongodb').ObjectID;
const Warnings = require('./warnings-utils');
const RECORD_TYPE = require('../../utils/constants/record-type-enum');

describe('transformRecord', () => {
  const warnings = new Warnings('authPayload', RECORD_TYPE.Warning, null);

  it('throws an error if null csvRow parameter provided', () => {
    expect(() => warnings.transformRecord(null)).toThrow('transformRecord - required csvRow must be non-null.');
  });

  it('returns basic fields if empty csvRow parameter provided', () => {
    const result = warnings.transformRecord({});

    expect(result).toEqual({
      _schemaName: 'Warning',
      _sourceRefOgcWarningId: undefined,

      recordType: 'Warning',
      dateIssued: null,
      document: {
        fileName: undefined,
        url: undefined
      },
      issuedTo: { companyName: '', type: 'Company' },
      issuingAgency: 'AGENCY_OGC',
      author: 'AGENCY_OGC',
      location: 'British Columbia',
      recordName: undefined,
      sourceSystemRef: 'bcogc'
    });
  });

  it('transforms csv row fields into NRPTI record fields', () => {
    const result = warnings.transformRecord({
      Title: 'Warning Letter 20-111',
      'Date Issued': '07/17/2020',
      Proponent: 'Coastal GasLink Pipeline Ltd.',
      Filename: 'Warning-letter-sample.pdf',
      'File URL': 'https://www.bc-er.ca/some/file/Warning-letter-sample.pdf'

    });

    expect(result).toEqual({
      _schemaName: 'Warning',
      _sourceRefOgcWarningId: 'Warning Letter 20-111',

      recordType: 'Warning',
      dateIssued: expect.any(Date),
      document: {
        fileName: 'Warning-letter-sample.pdf',
        url: 'https://www.bc-er.ca/some/file/Warning-letter-sample.pdf'
      },
      issuedTo: { companyName: 'Coastal GasLink Pipeline Ltd.', type: 'Company' },
      issuingAgency: 'AGENCY_OGC',
      author: 'AGENCY_OGC',
      location: 'British Columbia',
      recordName: 'Warning-letter-sample.pdf',
      projectName: 'Coastal Gaslink',
      _epicProjectId: new ObjectID('588511c4aaecd9001b825604'),

      sourceSystemRef: 'bcogc'
    });
  });
});
