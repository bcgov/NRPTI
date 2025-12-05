const BaseRecordUtils = require('./base-record-utils');
const RecordController = require('../../controllers/record-controller');
const RECORD_TYPE = require('../../utils/constants/record-type-enum');
const moment = require('moment');

describe('BaseRecordUtils', () => {
  describe('constructor', () => {
    it('throws an error if no recordType provided', () => {
      expect(() => {
        new BaseRecordUtils(null);
      }).toThrow('BaseRecordUtils - required recordType must be non-null.');
    });
  });

  describe('findExistingRecord', () => {
    it('returns existing NRPTI master record if found', async () => {
      const RECORD_TYPE = { Ticket: { _schemaName: 'Ticket', displayName: 'Ticket' } };
      const baseRecordUtils = new BaseRecordUtils('authPayload', RECORD_TYPE.Ticket);

      const nrptiRecord = { _sourceRefCoorsId: '123' };

      const masterRecordModelMock = {
        findOne: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue({
            test: 'existingRecord',
            _flavourRecords: [{ _id: 321, _schemaName: 'flavourSchema' }]
          })
        })
      };
      const mongoose = require('mongoose');
      jest.spyOn(mongoose, 'model').mockReturnValue(masterRecordModelMock);

      const result = await baseRecordUtils.findExistingRecord(nrptiRecord);

      expect(result).toEqual({ test: 'existingRecord', _flavourRecords: [{ _id: 321, _schemaName: 'flavourSchema' }] });
      expect(masterRecordModelMock.findOne).toHaveBeenCalledWith({
        _schemaName: 'Ticket',
        _sourceRefCoorsId: '123'
      });
    });

    it('returns null if _sourceRefCoorsId is null', async () => {
      const baseRecordUtils = new BaseRecordUtils('authPayload', RECORD_TYPE.Ticket);

      const nrptiRecord = { _sourceRefCoorsId: null };

      const result = await baseRecordUtils.findExistingRecord(nrptiRecord);

      expect(result).toBeNull();
    });
  });

  describe('transformRecord', () => {
    it('throws error if no csvRow provided', () => {
      const baseRecordUtils = new BaseRecordUtils(null, RECORD_TYPE.Ticket);
      expect(() => baseRecordUtils.transformRecord(null)).toThrow(
        'transformRecord - required csvRow must be non-null.'
      );
    });

    it('returns transformed csvRow record', () => {
      const baseRecordUtils = new BaseRecordUtils(null, RECORD_TYPE.Ticket);

      const csvRow = {};

      const expectedResult = {
        _schemaName: 'Ticket',
        recordType: 'Ticket',

        sourceSystemRef: 'coors-csv'
      };

      const result = baseRecordUtils.transformRecord(csvRow);

      expect(result).toEqual(expectedResult);
    });
  });

  describe('updateRecord', () => {
    it('throws error when nrptiRecord is not provided', async () => {
      const baseRecordUtils = new BaseRecordUtils(null, RECORD_TYPE.Ticket);
      await expect(baseRecordUtils.updateRecord(null, {})).rejects.toThrow(
        'updateRecord - required nrptiRecord must be non-null.'
      );
    });

    it('throws error when existingRecord is not provided', async () => {
      const baseRecordUtils = new BaseRecordUtils(null, RECORD_TYPE.Ticket);
      await expect(baseRecordUtils.updateRecord({}, null)).rejects.toThrow(
        'updateRecord - required existingRecord must be non-null.'
      );
    });

    it('calls `processPutRequest` when all arguments provided', async () => {
      const baseRecordUtils = new BaseRecordUtils('authPayload', RECORD_TYPE.Ticket);

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
        RECORD_TYPE.Ticket.recordControllerName,
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

    it('calls `processPutRequest` when all arguments provided - Court Conviction', async () => {
      const baseRecordUtils = new BaseRecordUtils('authPayload', RECORD_TYPE.CourtConviction);

      const processPutRequestSpy = jest.spyOn(RecordController, 'processPutRequest').mockImplementation(() => {
        return Promise.resolve({ test: 'record' });
      });

      const nrptiRecord = { newField: 'abc', penalties: [{ type: 'Fined', penalty: { type: 'Dollars', value: 100 } }] };
      const existingRecord = {
        _id: 123,
        penalties: [{ type: 'Fined', penalty: { type: 'Dollars', value: 50 } }],
        _flavourRecords: [{ _id: 321, _schemaName: 'flavourSchema' }]
      };

      const result = await baseRecordUtils.updateRecord(nrptiRecord, existingRecord);

      expect(processPutRequestSpy).toHaveBeenCalledWith(
        { swagger: { params: { auth_payload: 'authPayload' } } },
        null,
        null,
        RECORD_TYPE.CourtConviction.recordControllerName,
        [
          {
            _id: 123,
            newField: 'abc',
            updatedBy: '',
            penalties: [{ type: 'Fined', penalty: { type: 'Dollars', value: 100 } }],
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

  describe('createItem', () => {
    it('throws error when nrptiRecord is not provided', async () => {
      const baseRecordUtils = new BaseRecordUtils(null, RECORD_TYPE.Ticket);
      await expect(baseRecordUtils.createItem(null)).rejects.toThrow(
        'createItem - required nrptiRecord must be non-null.'
      );
    });

    it('calls `processPostRequest` when all arguments provided', async () => {
      const baseRecordUtils = new BaseRecordUtils('authPayload', RECORD_TYPE.Ticket);

      const processPostRequestSpy = jest.spyOn(RecordController, 'processPostRequest').mockImplementation(() => {
        return Promise.resolve({ test: 'record' });
      });

      const nrptiRecord = { newField: 'abc' };

      const result = await baseRecordUtils.createItem(nrptiRecord);

      expect(processPostRequestSpy).toHaveBeenCalledWith(
        { swagger: { params: { auth_payload: 'authPayload' } } },
        null,
        null,
        RECORD_TYPE.Ticket.recordControllerName,
        [
          {
            newField: 'abc',
            addedBy: '',
            dateAdded: expect.any(Date),
            sourceDateAdded: expect.any(Date),
            TicketNRCED: {
              addRole: 'public'
            }
          }
        ]
      );

      expect(result).toEqual({ test: 'record' });
    });

    it('calls `processPostRequest` when all arguments provided - Court Conviction', async () => {
      const baseRecordUtils = new BaseRecordUtils('authPayload', RECORD_TYPE.CourtConviction);

      const processPostRequestSpy = jest.spyOn(RecordController, 'processPostRequest').mockImplementation(() => {
        return Promise.resolve({ test: 'record' });
      });

      const nrptiRecord = { newField: 'abc', penalties: [] };

      const result = await baseRecordUtils.createItem(nrptiRecord);

      expect(processPostRequestSpy).toHaveBeenCalledWith(
        { swagger: { params: { auth_payload: 'authPayload' } } },
        null,
        null,
        RECORD_TYPE.CourtConviction.recordControllerName,
        [
          {
            newField: 'abc',
            addedBy: '',
            dateAdded: expect.any(Date),
            sourceDateAdded: expect.any(Date),
            penalties: [],
            CourtConvictionNRCED: {
              addRole: 'public'
            }
          }
        ]
      );

      expect(result).toEqual({ test: 'record' });
    });
  });

  describe('handleConvictionPenalties', () => {
    it('appends penalty and returns updated penalties array when penalty does not exist', () => {
      const baseRecordUtils = new BaseRecordUtils(null, RECORD_TYPE.CourtConviction);

      const existingRecord = {
        dateAdded: moment(),
        dateUpdated: moment(),
        penalties: [{ type: 'Fined', penalty: { type: 'Dollars', value: 50 } }]
      };
      const updatedPenalty = { type: 'Imprisonment', penalty: { type: 'Months', value: 12 } };

      const result = baseRecordUtils.handleConvictionPenalties(updatedPenalty, existingRecord);

      expect(result).toEqual([
        { type: 'Fined', penalty: { type: 'Dollars', value: 50 } },
        { type: 'Imprisonment', penalty: { type: 'Months', value: 12 } }
      ]);
    });

    it('does not append penalty and returns the existing penalties array when penalty already exists', () => {
      const baseRecordUtils = new BaseRecordUtils(null, RECORD_TYPE.CourtConviction);

      const existingRecord = {
        dateAdded: moment(),
        dateUpdated: moment(),
        penalties: [{ type: 'Fined', penalty: { type: 'Dollars', value: 50 } }]
      };
      const updatedPenalty = { type: 'Fined', penalty: { type: 'Dollars', value: 50 } };

      const result = baseRecordUtils.handleConvictionPenalties(updatedPenalty, existingRecord);

      expect(result).toEqual([{ type: 'Fined', penalty: { type: 'Dollars', value: 50 } }]);
    });
  });
});
