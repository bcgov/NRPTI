const BaseRecordUtils = require('./base-record-utils');
const RecordController = require('../../controllers/record-controller');
const RECORD_TYPE = require('../../utils/constants/record-type-enum');
const MiscConstants = require('../../utils/constants/misc');

describe('BaseRecordUtils', () => {
  describe('constructor', () => {
    it('throws an error if no recordType provided', () => {
      expect(() => {
        return new BaseRecordUtils(null);
      }).toThrow('BaseRecordUtils - required recordType must be non-null.');
    });
  });

  describe('transformRecord', () => {
    it('throws error if no csvRow provided', () => {
      const baseRecordUtils = new BaseRecordUtils(null, RECORD_TYPE.Order);
      expect(() => baseRecordUtils.transformRecord(null)).toThrow(
        'transformRecord - required csvRow must be non-null.'
      );
    });

    it('returns transformed csvRow record', () => {
      const baseRecordUtils = new BaseRecordUtils(null, RECORD_TYPE.Order);

      const csvRow = {};

      const expectedResult = {
        _schemaName: 'Order',
        recordType: 'Order',

        sourceSystemRef: 'ams-csv'
      };

      const result = baseRecordUtils.transformRecord(csvRow);

      expect(result).toEqual(expectedResult);
    });
  });

  describe('updateRecord', () => {
    it('throws error when nrptiRecord is not provided', async () => {
      const baseRecordUtils = new BaseRecordUtils(null, RECORD_TYPE.Order);
      await expect(baseRecordUtils.updateRecord(null, {})).rejects.toThrow(
        'updateRecord - required nrptiRecord must be non-null.'
      );
    });

    it('throws error when existingRecord is not provided', async () => {
      const baseRecordUtils = new BaseRecordUtils(null, RECORD_TYPE.Order);
      await expect(baseRecordUtils.updateRecord({}, null)).rejects.toThrow(
        'updateRecord - required existingRecord must be non-null.'
      );
    });

    it('calls `processPutRequest` when all arguments provided', async () => {
      const baseRecordUtils = new BaseRecordUtils('authPayload', RECORD_TYPE.Order);

      const processPutRequestSpy = jest.spyOn(RecordController, 'processPutRequest').mockImplementation(() => {
        return Promise.resolve({ test: 'record' });
      });

      const nrptiRecord = { newField: 'abc', issuedTo: { type: MiscConstants.IssuedToEntityTypes.Individual } };
      const existingRecord = { _id: 123, _flavourRecords: [{ _id: 321, _schemaName: 'flavourSchema' }] };

      const result = await baseRecordUtils.updateRecord(nrptiRecord, existingRecord);

      expect(processPutRequestSpy).toHaveBeenCalledWith(
        { swagger: { params: { auth_payload: 'authPayload' } } },
        null,
        null,
        RECORD_TYPE.Order.recordControllerName,
        [
          {
            _id: 123,
            newField: 'abc',
            updatedBy: '',
            dateUpdated: expect.any(Date),
            flavourSchema: {
              _id: 321
            },
            issuedTo: { type: MiscConstants.IssuedToEntityTypes.Individual }
          }
        ]
      );

      expect(result).toEqual({ test: 'record' });
    });
  });

  describe('createItem', () => {
    it('throws error when nrptiRecord is not provided', async () => {
      const baseRecordUtils = new BaseRecordUtils(null, RECORD_TYPE.Order);
      await expect(baseRecordUtils.createItem(null)).rejects.toThrow(
        'createItem - required nrptiRecord must be non-null.'
      );
    });

    it('calls `processPostRequest` when all arguments provided', async () => {
      const baseRecordUtils = new BaseRecordUtils('authPayload', RECORD_TYPE.Order);

      const processPostRequestSpy = jest.spyOn(RecordController, 'processPostRequest').mockImplementation(() => {
        return Promise.resolve({ test: 'record' });
      });

      const nrptiRecord = { newField: 'abc', issuedTo: { type: MiscConstants.IssuedToEntityTypes.Individual } };

      const result = await baseRecordUtils.createItem(nrptiRecord);

      expect(processPostRequestSpy).toHaveBeenCalledWith(
        { swagger: { params: { auth_payload: 'authPayload' } } },
        null,
        null,
        RECORD_TYPE.Order.recordControllerName,
        [
          {
            newField: 'abc',
            addedBy: '',
            dateAdded: expect.any(Date),
            issuedTo: { type: MiscConstants.IssuedToEntityTypes.Individual },
            OrderNRCED: {
              addRole: 'public'
            }
          }
        ]
      );

      expect(result).toEqual({ test: 'record' });
    });
  });
});
