const OrdersUtils = require('./orders-utils');
const RECORD_TYPE = require('../../utils/constants/record-type-enum');

describe('OrdersUtils', () => {
  describe('transformRecord', () => {
    it('throws error if no epicRecord provided', async () => {
      const ordersUtils = new OrdersUtils();

      try {
        await ordersUtils.transformRecord();
      } catch (error) {
        expect(error).toEqual(new Error('transformRecord - required record must be non-null.'));
      }
    });

    it('returns a default nrpti record when empty epicRecord provided', async () => {
      jest.spyOn(require('./../../controllers/document-controller'), 'createLinkDocument').mockImplementation(() => {
        return '310d2dddc9834cbab11282f3c8426fad';
      });

      const ordersUtils = new OrdersUtils();

      const epicRecord = {};

      const actualRecord = await ordersUtils.transformRecord(epicRecord);

      const expectedRecord = {
        _schemaName: RECORD_TYPE.Order._schemaName,

        _epicProjectId: '',
        _sourceRefId: '',
        _epicMilestoneId: '',

        read: ['sysadmin'],
        write: ['sysadmin'],

        recordName: '',
        recordType: RECORD_TYPE.Order.displayName,
        dateIssued: null,
        issuingAgency: 'Environmental Assessment Office',
        author: '',
        legislation: {
          act: ''
        },
        projectName: '',
        location: '',
        centroid: '',
        dateAdded: expect.any(Date),
        dateUpdated: expect.any(Date),
        documents: [],
        updatedBy: '',
        sourceDateAdded: null,
        sourceDateUpdated: null,
        sourceSystemRef: 'epic'
      };

      expect(actualRecord).toMatchObject(expectedRecord);
    });

    it('returns a nrpti record with all supported epicRecord fields populated', async () => {
      jest.spyOn(require('./../../controllers/document-controller'), 'createLinkDocument').mockImplementation(() => {
        return '310d2dddc9834cbab11282f3c8426fad';
      });

      const ordersUtils = new OrdersUtils();

      const epicRecord = {
        _id: 123,
        displayName: 'docDisplay',
        documentFileName: 'docFileName',
        project: {
          name: 'projectName',
          legislation: 'projectLegislation'
        },
        milestone: 'milestone'
      };

      const actualRecord = await ordersUtils.transformRecord(epicRecord);

      const expectedRecord = {
        _schemaName: RECORD_TYPE.Order._schemaName,

        _epicProjectId: '',
        _sourceRefId: 123,
        _epicMilestoneId: 'milestone',

        read: ['sysadmin'],
        write: ['sysadmin'],

        recordName: 'docDisplay',
        recordType: RECORD_TYPE.Order.displayName,
        dateIssued: null,
        issuingAgency: 'Environmental Assessment Office',
        author: '',
        legislation: {
          act: 'projectLegislation'
        },
        projectName: 'projectName',
        location: '',
        centroid: '',

        dateAdded: expect.any(Date),
        dateUpdated: expect.any(Date),
        documents: ['310d2dddc9834cbab11282f3c8426fad'],
        updatedBy: '',
        sourceDateAdded: null,
        sourceDateUpdated: null,
        sourceSystemRef: 'epic'
      };

      expect(actualRecord).toMatchObject(expectedRecord);
    });
  });

  describe('saveRecord', () => {
    it('throws error if no order record provided', async () => {
      const ordersUtils = new OrdersUtils();
      await expect(ordersUtils.saveRecord()).rejects.toThrow(
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

      const ordersUtils = new OrdersUtils();

      const orderRecord = { _id: '321' };

      await expect(ordersUtils.saveRecord(orderRecord)).resolves.not.toThrow();
    });

    it('creates and saves a new order record', async () => {
      // create mock save function
      const mockFindOneAndUpdate = jest.fn(() => Promise.resolve('saved!'));

      // mock mongoose to call mock save function
      const mongoose = require('mongoose');
      mongoose.model = jest.fn(() => {
        return { findOneAndUpdate: mockFindOneAndUpdate };
      });

      const ordersUtils = new OrdersUtils();

      const orderRecord = { _id: '123' };

      const dbStatus = await ordersUtils.saveRecord(orderRecord);

      expect(mockFindOneAndUpdate).toHaveBeenCalledTimes(1);
      expect(dbStatus).toEqual('saved!');
    });
  });
});
