const BaseRecordUtils = require('./base-record-utils');
const RecordController = require('../../controllers/record-controller');
const RECORD_TYPE = require('../../utils/constants/record-type-enum');

describe('BaseRecordUtils', () => {
  describe('constructor', () => {
    it('throws an error if no recordType provided', () => {
      expect(() => {
        new BaseRecordUtils({}, null);
      })
      .toThrow('BaseRecordUtils - required recordType must be non-null.');

    });
  });

  describe('transformRecord', () => {
    it('throws error if no coreRecord provided', async () => {
      const baseRecordUtils = new BaseRecordUtils({}, RECORD_TYPE.MineBCMI);
      expect(baseRecordUtils.transformRecord).toThrow('transformRecord - required coreRecord must be non-null.');
    });

    it('returns transformed Core record', () => {
      const baseRecordUtils = new BaseRecordUtils({}, RECORD_TYPE.MineBCMI);

      const coreRecord = { mine_guid: 1 };

      const expectedResult = {
        _schemaName: 'MineBCMI',
        dateAdded: expect.any(Date),
        dateUpdated: expect.any(Date),
        addedBy: undefined,
        updatedBy: undefined,
        sourceSystemRef: 'core'
      };

      const result = baseRecordUtils.transformRecord(coreRecord);

      expect(result).toEqual(expectedResult);
    })
  });

  describe('updateRecord', () => {
    it('throws error when nrptiRecord is not provided', async () => {
      const baseRecordUtils = new BaseRecordUtils({}, RECORD_TYPE.MineBCMI);
      await expect(baseRecordUtils.updateRecord(null, {})).rejects.toThrow('updateRecord - required nrptiRecord must be non-null.');
    });

    it('throws error when existingRecord is not provided', async () => {
      const baseRecordUtils = new BaseRecordUtils({}, RECORD_TYPE.MineBCMI);
      await expect(baseRecordUtils.updateRecord({}, null)).rejects.toThrow('updateRecord - required existingRecord must be non-null.');
    });

    it('calls `processPutRequest` when all arguments provided', async () => {
      const baseRecordUtils = new BaseRecordUtils({}, RECORD_TYPE.MineBCMI);

      const spy = jest.spyOn(RecordController, 'processPutRequest').mockImplementation(() => {
        return Promise.resolve({ test: 'record' });
      });

      const testExistingRecord = { _id: 123 };

      await baseRecordUtils.updateRecord({}, testExistingRecord);

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('createRecord', () => {
    it('throws error when nrptiRecord is not provided', async () => {
      const baseRecordUtils = new BaseRecordUtils({}, RECORD_TYPE.MineBCMI);
      await expect(baseRecordUtils.createRecord(null)).rejects.toThrow('createRecord - required nrptiRecord must be non-null.');
    });

    it('calls `processPostRequest` when all arguments provided', async () => {
      const baseRecordUtils = new BaseRecordUtils({}, RECORD_TYPE.MineBCMI);

      const spy = jest.spyOn(RecordController, 'processPostRequest').mockImplementation(() => {
        return Promise.resolve({ test: 'record' });
      });

      await baseRecordUtils.createRecord({});

      expect(spy).toHaveBeenCalled();
    });
  });
});
