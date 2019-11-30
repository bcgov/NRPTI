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
        documents: [
          {
            documentId: null,
            documentType: '',
            documentFileName: ''
          }
        ],
        read: ['sysadmin'],
        write: ['sysadmin']
      };

      expect(actualRecord).toEqual(expectedRecord);
    });

    it('returns a nrpti record with all supported epicRecord fields populated', () => {
      const epicOrders = new EpicOrders();

      const epicRecord = { _id: 123, documentType: 'docType', documentFileName: 'docFileName' };

      const actualRecord = epicOrders.transformRecord(epicRecord);

      const expectedRecord = {
        _schemaName: 'Order',
        documents: [
          {
            documentId: 123,
            documentType: 'docType',
            documentFileName: 'docFileName'
          }
        ],
        read: ['sysadmin'],
        write: ['sysadmin']
      };

      expect(actualRecord).toEqual(expectedRecord);
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
      // create mock Save function
      const mockSaveFunction = jest.fn(() => {
        throw Error('this should not be thrown');
      });

      // create mock order class
      const mockOrder = jest.fn().mockImplementation(() => {
        return { save: mockSaveFunction };
      });

      // spy on mongoose.model to return mock order class
      jest.spyOn(require('mongoose'), 'model').mockImplementation(() => {
        return mockOrder;
      });

      const epicOrders = new EpicOrders();

      const orderRecord = { _id: '321' };

      await expect(epicOrders.saveRecord(orderRecord)).resolves.not.toThrow();
    });

    it('creates and saves a new order record', async () => {
      // create mock Save function
      const mockSaveFunction = jest.fn(() => Promise.resolve('saved!'));

      // create mock order class
      const mockOrder = jest.fn().mockImplementation(() => {
        return { save: mockSaveFunction };
      });

      // spy on mongoose.model to return mock order class
      jest.spyOn(require('mongoose'), 'model').mockImplementation(() => {
        return mockOrder;
      });

      const epicOrders = new EpicOrders();

      const orderRecord = { _id: '123' };

      const dbStatus = await epicOrders.saveRecord(orderRecord);

      expect(mockOrder).toHaveBeenCalledWith(orderRecord);
      expect(mockSaveFunction).toHaveBeenCalledTimes(1);
      expect(dbStatus).toEqual('saved!');
    });
  });
});
