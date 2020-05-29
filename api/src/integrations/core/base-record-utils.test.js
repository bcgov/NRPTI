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
        _sourceRefId: expect.any(Object),
        _epicMilestoneId: '',

        recordName: '',
        recordType: RECORD_TYPE.Order.displayName,
        dateIssued: null,
        description: '',
        projectName: '',
        location: '',
        centroid: '',

        dateAdded: expect.any(Date),
        dateUpdated: expect.any(Date),

        addedBy: '',
        updatedBy: '',

        sourceDateAdded: null,
        sourceDateUpdated: null,
        sourceSystemRef: 'epic'
      };

      expect(actualRecord).toMatchObject(expectedRecord);
    });

    it('returns a nrpti record with all supported epicRecord fields populated', async () => {
      const baseRecordUtils = new BaseRecordUtils({ displayName: 'userName' }, RECORD_TYPE.Order);

      const epicRecord = {
        _id: 123,
        displayName: 'docDisplay',
        documentFileName: 'docFileName',
        description: 'someDescription',
        project: {
          name: 'projectName',
          centroid: '123',
          location: 'someLocation'
        },
        milestone: 'milestone',
        datePosted: 'someDate'
      };

      const actualRecord = await baseRecordUtils.transformRecord(epicRecord);

      const expectedRecord = {
        _schemaName: RECORD_TYPE.Order._schemaName,

        _epicProjectId: '',
        _sourceRefId: expect.any(Object),
        _epicMilestoneId: 'milestone',

        recordName: 'docDisplay',
        recordType: RECORD_TYPE.Order.displayName,
        dateIssued: 'someDate',
        description: 'someDescription',
        projectName: 'projectName',
        location: 'someLocation',
        centroid: '123',

        dateAdded: expect.any(Date),
        dateUpdated: expect.any(Date),

        addedBy: 'userName',
        updatedBy: 'userName',

        sourceDateAdded: null,
        sourceDateUpdated: null,
        sourceSystemRef: 'epic'
      };

      expect(actualRecord).toMatchObject(expectedRecord);
    });
  });

  describe('createRecord', () => {
    it('throws error if no record provided', async () => {
      const baseRecordUtils = new BaseRecordUtils(null, RECORD_TYPE.Order);
      await expect(baseRecordUtils.createRecord()).rejects.toThrow(
        new Error('createRecord - required nrptiRecord must be non-null.')
      );
    });

    it('catches any errors thrown when creating/saving the record', async () => {
      jest.spyOn(require('../../controllers/record-controller'), 'processPostRequest').mockImplementation(() => {
        throw Error('should be caught');
      });

      const baseRecordUtils = new BaseRecordUtils(null, RECORD_TYPE.Order);

      const orderRecord = { _id: '321' };

      await expect(baseRecordUtils.createRecord(orderRecord)).resolves.not.toThrow();
    });

    it('creates and saves a new record', async () => {
      jest.spyOn(require('../../controllers/record-controller'), 'processPostRequest').mockImplementation(() => {
        return [{ status: 'success' }];
      });

      const baseRecordUtils = new BaseRecordUtils(null, RECORD_TYPE.Order);

      const orderRecord = { _id: '123' };

      const status = await baseRecordUtils.createRecord(orderRecord);

      expect(status).toEqual([{ status: 'success' }]);
    });
  });
});