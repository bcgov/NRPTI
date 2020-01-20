const EpicOrders = require('./epic-orders');
const RECORD_TYPE = require('../../utils/constants/record-type-enum');

describe('EpicOrders', () => {
  describe('transformRecord', () => {
    it('throws error if no epicRecord provided', async () => {
      const epicOrders = new EpicOrders();

      try {
        await epicOrders.transformRecord();
      } catch (error) {
        expect(error).toEqual(new Error('transformRecord - required record must be non-null.'));
      }
    });

    it('returns a default nrpti record when empty epicRecord provided', async () => {
      const epicOrders = new EpicOrders();

      const epicRecord = {};

      const actualRecord = await epicOrders.transformRecord(epicRecord);

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
        legislation: '',
        projectName: '',
        location: '',
        centroid: '',

        dateAdded: expect.any(Date),
        dateUpdated: expect.any(Date),
        updatedBy: '',
        sourceDateAdded: null,
        sourceDateUpdated: null,
        sourceSystemRef: 'epic'
      };

      expect(actualRecord).toMatchObject(expectedRecord);
    });

    it('returns a nrpti record with all supported epicRecord fields populated', async () => {
      const epicOrders = new EpicOrders();

      const epicRecord = {
        _id: 123,
        displayName: 'docDisplay',
        documentType: 'docType',
        documentFileName: 'docFileName',
        project: {
          name: 'projectName',
          legislation: 'projectLegislation'
        },
        milestone: 'milestone'
      };

      const actualRecord = await epicOrders.transformRecord(epicRecord);

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
        legislation: 'projectLegislation',
        projectName: 'projectName',
        location: '',
        centroid: '',

        dateAdded: expect.any(Date),
        dateUpdated: expect.any(Date),
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
