const ObjectID = require('mongodb').ObjectID;
const Warnings = require('./warnings-utils');
const RECORD_TYPE = require('../../utils/constants/record-type-enum');
const mongoose = require('mongoose');
const { createURLDocument } = require('../../controllers/document-controller');

describe('warnings-utils', () => {
  const warnings = new Warnings('authPayload', RECORD_TYPE.Warning, null);

  describe('transformRecord', () => {
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

  describe('createItem', () => {
    const Document = require('../../models/document');
    const utils = require('../../utils/constants/misc');
    const mongo = 'mongodb://127.0.0.1/nrpti-testing';
    mongoose.connect(mongo);

    beforeAll(async () => {
      await Document.remove({});
    });

    beforeEach(async () => {
      await Document.remove({});
    });

    afterAll(async () => {
      mongoose.connection.db.dropDatabase();
      await mongoose.connection.close();
    });

    jest.fn('../../controllers/document-controller', () => ({
      createURLDocument: jest.fn((fileName, addedBy, url, readRoles = [], writeRoles = []) => {
        const Document = mongoose.model('Document');
        let document = new Document();

        document.fileName = fileName;
        document.addedBy = addedBy;
        document.url = url;
        document.read = [utils.ApplicationRoles.ADMIN, ...readRoles];
        document.write = [utils.ApplicationRoles.ADMIN, ...writeRoles];

        return document.save();
      })
    }));

    it('throws error when nrptiRecord is not provided', async () => {
      await expect(warnings.createItem(null)).rejects.toThrow('createItem - required nrptiRecord must be non-null.');
    });

    it('creates a document', async () => {
      const baseCsvRow = {
        Title: '123',
        author: 'AGENCY_OGC',
        issuingAgency: 'AGENCY_OGC',
        recordName: 'record name',
        'Date Issued': '11-07-2023',
        Proponent: 'Proponent',
        Filename: 'Filename',
        'File URL': 'File URL'
      };
      const nrptiRecord = await warnings.transformRecord(baseCsvRow);

      const result = await createURLDocument(nrptiRecord.document.fileName, 'BCOGC Import', nrptiRecord.document.url, [
        'public'
      ]);
      const resultRead = [...result.read];
      const resultWrite = [...result.write];

      expect(result.fileName).toEqual('Filename');
      expect(result.url).toEqual('File URL');
      expect(result.addedBy).toEqual('BCOGC Import');
      expect(resultRead).toEqual(['sysadmin', 'public']);
      expect(resultWrite).toEqual(['sysadmin']);
    });
  });

  describe('findExistingRecord', () => {
    it('returns null if _sourceRefOgcWarningId is not provided in nrptiRecord', async () => {
      const result = await warnings.findExistingRecord({});

      expect(result).toBeNull();
    });

    it('finds and populates existing record by _sourceRefOgcWarningId', async () => {
      const mockFindOne = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue({
          _id: 'mockId',
          _schemaName: 'Warning',
          _flavourRecords: [{ _id: 'flavourId', _schemaName: 'Flavour' }]
        })
      });

      mongoose.model = jest.fn().mockReturnValue({ findOne: mockFindOne });

      const nrptiRecord = { _sourceRefOgcWarningId: 'existingWarningId' };

      const result = await warnings.findExistingRecord(nrptiRecord);

      expect(result).toEqual({
        _id: 'mockId',
        _schemaName: 'Warning',
        _flavourRecords: [{ _id: 'flavourId', _schemaName: 'Flavour' }]
      });
      expect(mockFindOne).toHaveBeenCalledWith({
        _schemaName: 'Warning',
        _sourceRefOgcWarningId: 'existingWarningId'
      });
      expect(mockFindOne().populate).toHaveBeenCalledWith('_flavourRecords', '_id _schemaName');
    });
  });
});
