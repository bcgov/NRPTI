const EpicOrders = require('./epic-orders');

describe('EpicOrders', () => {
  describe('transformRecord', () => {
    it('throws error if no epicRecord provided', () => {
      const epicOrders = new EpicOrders();
      expect(() => epicOrders.transformRecord()).toThrow(
        new Error('transformRecord - required record must be non-null.')
      );
    });

    it('returns a default nrpti record when empty epicRecord provided', () => {
      const epicOrders = new EpicOrders();

      const epicRecord = {};

      const actualRecord = epicOrders.transformRecord(epicRecord);

      const expectedRecord = {
        _schemaName: 'Order',

        read: ['sysadmin'],
        write: ['sysadmin'],

        recordName: '',
        issuingAgency: '',
        author: '',
        type: ' - ',
        description: '',
        sourceSystemRef: 'epic',
        project: '',

        documentId: '',
        documentType: '',
        documentFileName: '',
        documentDate: null,

        dateUpdated: expect.any(Date),

        sourceDateAdded: null,
        sourceDateUpdated: null
      };

      expect(actualRecord).toMatchObject(expectedRecord);
    });

    it('returns a nrpti record with all supported epicRecord fields populated', () => {
      const epicOrders = new EpicOrders();

      const epicRecord = {
        _id: 123,
        displayName: 'docDisplay',
        documentType: 'docType',
        documentFileName: 'docFileName',
        milestone: 'milestone'
      };

      const actualRecord = epicOrders.transformRecord(epicRecord);

      const expectedRecord = {
        _schemaName: 'Order',

        read: ['sysadmin'],
        write: ['sysadmin'],

        recordName: 'docDisplay',
        issuingAgency: '',
        author: '',
        type: 'docType - milestone',
        description: '',
        sourceSystemRef: 'epic',
        project: '',

        documentId: 123,
        documentType: 'docType',
        documentFileName: 'docFileName',
        documentDate: null,

        dateUpdated: expect.any(Date),

        sourceDateAdded: null,
        sourceDateUpdated: null
      };

      expect(actualRecord).toMatchObject(expectedRecord);
    });
  });

  describe('saveRecord', () => {
    it('throws error if no order record provided', async () => {
      const epicOrders = new EpicOrders();
      await expect(epicOrders.saveRecord()).rejects.toThrow(
        new Error('saveRecord - required record must be non-null.')
      );
    });

    it('catches any errors thrown when creating/saving the order record', async () => {
      // create mock save function
      const mockFindOneAndUpdate = jest.fn(() => {
        throw Error('this should not be thrown');
      });

      // mock mongoose to call mock save function
      const mongoose = require('mongoose');
      mongoose.model = jest.fn(() => {
        return { findOneAndUpdate: mockFindOneAndUpdate };
      });

      const epicOrders = new EpicOrders();

      const orderRecord = { _id: '321' };

      await expect(epicOrders.saveRecord(orderRecord)).resolves.not.toThrow();
    });

    it('creates and saves a new order record', async () => {
      // create mock save function
      const mockFindOneAndUpdate = jest.fn(() => Promise.resolve('saved!'));

      // mock mongoose to call mock save function
      const mongoose = require('mongoose');
      mongoose.model = jest.fn(() => {
        return { findOneAndUpdate: mockFindOneAndUpdate };
      });

      const epicOrders = new EpicOrders();

      const orderRecord = { _id: '123' };

      const dbStatus = await epicOrders.saveRecord(orderRecord);

      expect(mockFindOneAndUpdate).toHaveBeenCalledTimes(1);
      expect(dbStatus).toEqual('saved!');
    });
  });
});
