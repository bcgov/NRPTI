const BaseRecordUtils = require('./base-record-utils');
const RECORD_TYPE = require('../../utils/constants/record-type-enum');

describe('BaseRecordUtils', () => {
  describe('constructor', () => {
    it('throws an error if no recordType provided', () => {
      try {
        new BaseRecordUtils(null, null);
      } catch (error) {
        expect(error).toEqual(new Error('BaseRecordUtils - required recordType must be non-null.'));
      }
    });
  });

  describe('transformRecord', () => {
    it('throws error if no epicRecord provided', async () => {
      const baseRecordUtils = new BaseRecordUtils(null, RECORD_TYPE.Order);

      try {
        await baseRecordUtils.transformRecord();
      } catch (error) {
        expect(error).toEqual(new Error('transformRecord - required epicRecord must be non-null.'));
      }
    });

    it('returns a default nrpti record when empty epicRecord provided', async () => {
      const baseRecordUtils = new BaseRecordUtils(null, RECORD_TYPE.Order);

      const epicRecord = {};

      const actualRecord = await baseRecordUtils.transformRecord(epicRecord);

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
      jest.spyOn(require('../../controllers/document-controller'), 'createDocument').mockImplementation(() => {
        return { _id: '310d2dddc9834cbab11282f3c8426fad' };
      });

      const baseRecordUtils = new BaseRecordUtils({ displayName: 'userName' }, RECORD_TYPE.Order);

      const epicRecord = {
        _id: 123,
        displayName: 'docDisplay',
        documentFileName: 'docFileName',
        project: {
          name: 'projectName',
          centroid: '123',
          location: 'someLocation'
        },
        milestone: 'milestone',
        documentDate: 'someDate'
      };

      const actualRecord = await baseRecordUtils.transformRecord(epicRecord);

      const expectedRecord = {
        _schemaName: RECORD_TYPE.Order._schemaName,

        _epicProjectId: '',
        _sourceRefId: 123,
        _epicMilestoneId: 'milestone',

        read: ['sysadmin'],
        write: ['sysadmin'],

        recordName: 'docDisplay',
        recordType: RECORD_TYPE.Order.displayName,
        dateIssued: 'someDate',
        projectName: 'projectName',
        location: 'someLocation',
        centroid: '123',

        dateAdded: expect.any(Date),
        dateUpdated: expect.any(Date),
        documents: ['310d2dddc9834cbab11282f3c8426fad'],
        updatedBy: 'userName',
        sourceDateAdded: null,
        sourceDateUpdated: null,
        sourceSystemRef: 'epic'
      };

      expect(actualRecord).toMatchObject(expectedRecord);
    });
  });

  describe('saveRecord', () => {
    it('throws error if no record provided', async () => {
      const baseRecordUtils = new BaseRecordUtils(null, RECORD_TYPE.Order);
      await expect(baseRecordUtils.saveRecord()).rejects.toThrow(
        new Error('saveRecord - required nrptiRecord must be non-null.')
      );
    });

    it('catches any errors thrown when creating/saving the record', async () => {
      // create mock save function
      const mockFindOneAndUpdate = jest.fn(() => {
        throw Error('this should not be thrown');
      });

      // mock mongoose to call mock save function
      const mongoose = require('mongoose');
      mongoose.model = jest.fn(() => {
        return { findOneAndUpdate: mockFindOneAndUpdate };
      });

      const baseRecordUtils = new BaseRecordUtils(null, RECORD_TYPE.Order);

      const orderRecord = { _id: '321' };

      await expect(baseRecordUtils.saveRecord(orderRecord)).resolves.not.toThrow();
    });

    it('creates and saves a new record', async () => {
      // create mock save function
      const mockFindOneAndUpdate = jest.fn(() => Promise.resolve('saved!'));

      // mock mongoose to call mock save function
      const mongoose = require('mongoose');
      mongoose.model = jest.fn(() => {
        return { findOneAndUpdate: mockFindOneAndUpdate };
      });

      const baseRecordUtils = new BaseRecordUtils(null, RECORD_TYPE.Order);

      const orderRecord = { _id: '123' };

      const dbStatus = await baseRecordUtils.saveRecord(orderRecord);

      expect(mockFindOneAndUpdate).toHaveBeenCalledTimes(1);
      expect(dbStatus).toEqual('saved!');
    });
  });
});
