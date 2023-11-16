const Orders = require('./orders-utils');
const RECORD_TYPE = require('../../utils/constants/record-type-enum');
const mongoose = require('mongoose');
const { createURLDocument } = require('../../controllers/document-controller');

describe('orders-utils testing', () => {
  const orders = new Orders('authPayload', RECORD_TYPE.Order, null);
  
  describe('transformRecord', () => {

    it('throws an error if null csvRow parameter provided', () => {
      expect(() => orders.transformRecord(null)).toThrow('transformRecord - required csvRow must be non-null.');
    });

    it('returns basic fields if empty csvRow parameter provided', () => {
      const result = orders.transformRecord({});

      expect(result).toEqual({
        _schemaName: 'Order',
        _sourceRefOgcOrderId: undefined,

        recordType: 'Order',
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
        legislation: [
          {
            act: 'Oil and Gas Activities Act',
            section: null,
            legislationDescription: "Action Order"
          }
        ],
        sourceSystemRef: 'bcogc'
      });
    });

    it('transforms csv row fields into NRPTI record fields', () => {
      const result = orders.transformRecord({
        Title: 'General Order 123',
        Proponent: 'Test Proponent',
        Filename: 'sample-order.pdf',
        'File URL': 'https://www.example.com/sample-order.pdf'
      });

      expect(result).toEqual({
        _schemaName: 'Order',
        _sourceRefOgcOrderId: 'General Order 123',
        dateIssued: null,
        recordType: 'Order',
        document: {
          fileName: 'sample-order.pdf',
          url: 'https://www.example.com/sample-order.pdf'
        },
        issuedTo: { companyName: 'Test Proponent', type: 'Company' },
        issuingAgency: 'AGENCY_OGC',
        author: 'AGENCY_OGC',
        location: 'British Columbia',
        recordName: 'General Order 123',
        legislation: [
          {
            act: 'Oil and Gas Activities Act',
            section: 49,
            legislationDescription: 'General Order'
          }
        ],

        sourceSystemRef: 'bcogc'
      });
    });
  });

  describe('createItem', () => {
    const Document = require ('../../models/document');
    const utils = require('../../utils/constants/misc');
    const mongo = 'mongodb://127.0.0.1/nrpti-testing'
    mongoose.connect(mongo);

    beforeAll(async () => {
      await Document.remove({});
    });
    
    beforeEach(async () => {
      await Document.remove({});
    });

    afterAll(async () => {
      await mongoose.connections.close();
    });

    jest.fn('../../controllers/document-controller', () => ({
      createURLDocument: jest.fn((fileName, addedBy, url, readRoles = [], writeRoles = []) => {
        const Document = mongoose.model('Document');
        let document = new Document();

        document.fileName = fileName;
        document.addedBy = addedBy;
        document.url = url;
        document.read = [utils.ApplicationRoles.ADMIN, ...readRoles];
        document.write = [utils.ApplicationRoles.ADMIN, ...writeRoles];;

        return document.save();
      })
    }));

    it('throws error when nrptiRecord is not provided', async () => {
      await expect(orders.createItem(null)).rejects.toThrow(
        'createItem - required nrptiRecord must be non-null.'
      );
    });

    it('creates a document', async () => {
      const baseCsvRow = {
        'Title': '123',
        'author': 'AGENCY_OGC',
        'issuingAgency': 'AGENCY_OGC',
        'recordName': 'record name',
        'Date Issued': '11-07-2023',
        'Proponent': 'Proponent',
        'Filename': 'Filename',
        'File URL': 'File URL',
      };
      const nrptiRecord = await orders.transformRecord(baseCsvRow);

      const result = await createURLDocument(nrptiRecord.document.fileName, 'BCOGC Import', nrptiRecord.document.url, ['public'])
      const resultRead = [...result.read];
      const resultWrite = [...result.write];

      expect(result.fileName).toEqual('Filename')
      expect(result.url).toEqual('File URL')
      expect(result.addedBy).toEqual('BCOGC Import')
      expect(resultRead).toEqual(['sysadmin', 'public'])
      expect(resultWrite).toEqual(['sysadmin'])
    });
  });

  describe('findExistingRecord', () => {
    it('returns null if _sourceRefOgcOrderId is not provided in nrptiRecord', async () => {
      const result = await orders.findExistingRecord({});

      expect(result).toBeNull();
    });

    it('finds and populates existing record by _sourceRefOgcOrderId', async () => {
      const mockFindOne = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue({
          _id: 'mockId',
          _schemaName: 'Order',
          _flavourRecords: [{ _id: 'flavourId', _schemaName: 'Flavour' }]
        })
      });

      mongoose.model = jest.fn().mockReturnValue({ findOne: mockFindOne });

      const nrptiRecord = { _sourceRefOgcOrderId: 'existingOrderId' };

      const result = await orders.findExistingRecord(nrptiRecord);

      expect(result).toEqual({
        _id: 'mockId',
        _schemaName: 'Order',
        _flavourRecords: [{ _id: 'flavourId', _schemaName: 'Flavour' }]
      });
      expect(mockFindOne).toHaveBeenCalledWith({
        _schemaName: 'Order',
        _sourceRefOgcOrderId: 'existingOrderId'
      });
      expect(mockFindOne().populate).toHaveBeenCalledWith('_flavourRecords', '_id _schemaName');
    });
  });

  describe('getOrderSection', () => {
    const orders = new Orders('authPayload', RECORD_TYPE.Order, null);

    it('returns 49 for "General Order" in csvRow Title', () => {
      const csvRow = { Title: 'This is a General Order' };
      const result = orders.getOrderSection(csvRow);
      expect(result).toBe(49);
    });

    it('returns 50 for "Action Order" in csvRow Title', () => {
      const csvRow = { Title: 'This is an Action Order' };
      const result = orders.getOrderSection(csvRow);
      expect(result).toBe(50);
    });

    it('returns null for a non-specific title in csvRow Title', () => {
      const csvRow = { Title: 'This is something else' };
      const result = orders.getOrderSection(csvRow);
      expect(result).toBeNull();
    });

    it('returns 49 for partial match with "General Order" in csvRow Title', () => {
      const csvRow = { Title: 'General Order is mentioned here' };
      const result = orders.getOrderSection(csvRow);
      expect(result).toBe(49);
    });

    it('returns 50 for partial match with "Action Order" in csvRow Title', () => {
      const csvRow = { Title: 'An Action Order is mentioned here' };
      const result = orders.getOrderSection(csvRow);
      expect(result).toBe(50);
    });

    it('returns null if Title is not provided in csvRow', () => {
      const csvRow = { SomeOtherField: 'This is something else' };
      const result = orders.getOrderSection(csvRow);
      expect(result).toBeNull();
    });
  });
});
