const BaseRecordUtils = require('./base-record-utils');
const RecordController = require('../../controllers/record-controller');
const RECORD_TYPE = require('../../utils/constants/record-type-enum');
const MiscConstants = require('../../utils/constants/misc');

describe('BaseRecordUtils', () => {
  describe('constructor', () => {
    it('throws an error if no recordType provided', () => {
      expect(() => {
        new BaseRecordUtils(null);
      }).toThrow('BaseRecordUtils - required recordType must be non-null.');
    });
  });

  describe('transformRecord', () => {
    it('throws error if no csvRow provided', () => {
      const baseRecordUtils = new BaseRecordUtils(null, RECORD_TYPE.Inspection);
      expect(() => baseRecordUtils.transformRecord(null)).toThrow(
        'transformRecord - required csvRow must be non-null.'
      );
    });

    it('returns transformed csvRow record', () => {
      const baseRecordUtils = new BaseRecordUtils(null, RECORD_TYPE.Inspection);

      const csvRow = {};

      const expectedResult = {
        _schemaName: 'Inspection',
        recordType: 'Inspection',

        sourceSystemRef: 'bcogc-csv'
      };

      const result = baseRecordUtils.transformRecord(csvRow);

      expect(result).toEqual(expectedResult);
    });
  });

  describe('updateRecord', () => {
    it('throws error when nrptiRecord is not provided', async () => {
      const baseRecordUtils = new BaseRecordUtils(null, RECORD_TYPE.Inspection);
      await expect(baseRecordUtils.updateRecord(null, {})).rejects.toThrow(
        'updateRecord - required nrptiRecord must be non-null.'
      );
    });

    it('throws error when existingRecord is not provided', async () => {
      const baseRecordUtils = new BaseRecordUtils(null, RECORD_TYPE.Inspection);
      await expect(baseRecordUtils.updateRecord({}, null)).rejects.toThrow(
        'updateRecord - required existingRecord must be non-null.'
      );
    });

    it('calls `processPutRequest` when all arguments provided', async () => {
      const baseRecordUtils = new BaseRecordUtils('authPayload', RECORD_TYPE.Inspection);

      const processPutRequestSpy = jest.spyOn(RecordController, 'processPutRequest').mockImplementation(() => {
        return Promise.resolve({ test: 'record' });
      });

      const nrptiRecord = { newField: 'abc' };
      const existingRecord = { _id: 123, _flavourRecords: [{ _id: 321, _schemaName: 'flavourSchema' }] };

      const result = await baseRecordUtils.updateRecord(nrptiRecord, existingRecord);

      expect(processPutRequestSpy).toHaveBeenCalledWith(
        { swagger: { params: { auth_payload: 'authPayload' } } },
        null,
        null,
        RECORD_TYPE.Inspection.recordControllerName,
        [
          {
            _id: 123,
            newField: 'abc',
            updatedBy: '',
            dateUpdated: expect.any(Date),
            sourceDateUpdated: expect.any(Date),
            flavourSchema: {
              _id: 321,
              addRole: 'public'
            }
          }
        ]
      );

      expect(result).toEqual({ test: 'record' });
    });
  });

  describe('createRecord', () => {
    it('throws error when nrptiRecord is not provided', async () => {
      const baseRecordUtils = new BaseRecordUtils(null, RECORD_TYPE.Inspection);
      await expect(baseRecordUtils.createRecord(null)).rejects.toThrow(
        'createRecord - required nrptiRecord must be non-null.'
      );
    });

    it('calls `processPostRequest` when all arguments provided', async () => {
      const baseRecordUtils = new BaseRecordUtils('authPayload', RECORD_TYPE.Inspection);

      const processPostRequestSpy = jest.spyOn(RecordController, 'processPostRequest').mockImplementation(() => {
        return Promise.resolve({ test: 'record' });
      });

      const nrptiRecord = { newField: 'abc', _epicProjectId: MiscConstants.EpicProjectIds.lngCanadaId };

      const result = await baseRecordUtils.createRecord(nrptiRecord);

      expect(processPostRequestSpy).toHaveBeenCalledWith(
        { swagger: { params: { auth_payload: 'authPayload' } } },
        null,
        null,
        RECORD_TYPE.Inspection.recordControllerName,
        [
          {
            newField: 'abc',
            addedBy: '',
            dateAdded: expect.any(Date),
            sourceDateAdded: expect.any(Date),
            _epicProjectId: MiscConstants.EpicProjectIds.lngCanadaId,
            InspectionLNG: {
              addRole: 'public'
            },
            InspectionNRCED: {
              addRole: 'public'
            }
          }
        ]
      );

      expect(result).toEqual({ test: 'record' });
    });
  });
});
