const AlcCsvDataSource = require('./datasource');

describe('AlcCsvDataSource', () => {
  describe('constructor', () => {
    it('sets taskAuditRecord', () => {
      const dataSource = new AlcCsvDataSource('taskAuditRecord', null, null, null);
      expect(dataSource.taskAuditRecord).toEqual('taskAuditRecord');
    });

    it('sets auth_payload', () => {
      const dataSource = new AlcCsvDataSource(null, 'authPayload', null, null);
      expect(dataSource.auth_payload).toEqual('authPayload');
    });

    it('sets recordType', () => {
      const dataSource = new AlcCsvDataSource(null, null, 'recordType', null);
      expect(dataSource.recordType).toEqual('recordType');
    });

    it('sets recordType', () => {
      const dataSource = new AlcCsvDataSource(null, null, null, []);
      expect(dataSource.csvRows).toEqual([]);
    });

    it('sets default status fields', () => {
      const dataSource = new AlcCsvDataSource();
      expect(dataSource.status).toEqual({
        itemsProcessed: 0,
        itemTotal: 0,
        individualRecordStatus: []
      });
    });
  });

  describe('run', () => {
    it('updates the status and runs batch processing', async () => {
      const taskAuditRecord = { updateTaskRecord: jest.fn(() => {}) };
      const dataSource = new AlcCsvDataSource(taskAuditRecord, null, null, null);
      dataSource.csvRows = [{}, {}, {}];

      dataSource.batchProcessRecords = jest.fn();

      const status = await dataSource.run();

      expect(status).toEqual({
        itemTotal: 3,
        itemsProcessed: 0,
        individualRecordStatus: []
      });

      expect(taskAuditRecord.updateTaskRecord).toHaveBeenCalledWith({
        status: 'Running',
        itemTotal: 3
      });

      expect(dataSource.batchProcessRecords).toHaveBeenCalled();
    });
  });

  describe('batchProcessRecords', () => {
    it('throws an error if recordTypeConfig is not found', async () => {
      const dataSource = new AlcCsvDataSource();
      dataSource.csvRows = [{}];

      try {
        await dataSource.batchProcessRecords();
      } catch (error) {
        expect(error.message).toEqual('batchProcessRecords - failed to find matching recordTypeConfig.');
      }
    });

    it('processes records in batches according to the batch size', async () => {
      const recordTypeConfig = { getUtil: () => ({}) };
      const dataSource = new AlcCsvDataSource();
      dataSource.csvRows = Array.from({ length: 275 }, (_, i) => ({ id: i }));

      dataSource.getRecordTypeConfig = jest.fn(() => recordTypeConfig);
      dataSource.processRecord = jest.fn();

      await dataSource.batchProcessRecords();

      expect(dataSource.processRecord).toHaveBeenCalledWith({ id: 0 }, recordTypeConfig);
      expect(dataSource.processRecord).toHaveBeenCalledWith({ id: 99 }, recordTypeConfig);
      expect(dataSource.processRecord).toHaveBeenCalledWith({ id: 199 }, recordTypeConfig);
      expect(dataSource.processRecord).toHaveBeenCalledWith({ id: 274 }, recordTypeConfig);
    });

    it('handles errors during processing and updates the status', async () => {
      const recordTypeConfig = { getUtil: () => ({}) };
      const dataSource = new AlcCsvDataSource();
      dataSource.csvRows = [{ id: 1 }, { id: 2 }, { id: 3 }];

      dataSource.getRecordTypeConfig = jest.fn(() => recordTypeConfig);
      dataSource.processRecord = jest.fn().mockRejectedValueOnce(new Error('Some error'));

      await dataSource.batchProcessRecords();

      expect(dataSource.status.message).toEqual('batchProcessRecords - unexpected error');
      expect(dataSource.status.error).toEqual('Some error');
    });
  });

  describe('processRecord', () => {
    it('sets an error if csvRow is null', async () => {
      const dataSource = new AlcCsvDataSource();

      await dataSource.processRecord(null, 'recordTypeConfig');

      expect(dataSource.status.individualRecordStatus[0]).toEqual({
        message: 'processRecord - unexpected error',
        error: 'processRecord - required csvRow is null.'
      });
    });

    it('sets an error if recordTypeConfig is null', async () => {
      const dataSource = new AlcCsvDataSource();

      await dataSource.processRecord('recordTypeConfig', null);

      expect(dataSource.status.individualRecordStatus[0]).toEqual({
        message: 'processRecord - unexpected error',
        error: 'processRecord - required recordTypeConfig is null.'
      });
    });

    it('transforms, saves, and updates the status for the new csvRow', async () => {
      const taskAuditRecord = { updateTaskRecord: jest.fn(() => {}) };

      const dataSource = new AlcCsvDataSource(taskAuditRecord, null, null, null);

      const csvRow = {};

      const recordTypeConfig = { getUtil: () => recordTypeUtils };
      const recordTypeUtils = {
        transformRecord: jest.fn(() => {
          return { transformed: true };
        }),
        findExistingRecord: jest.fn(() => null),
        createItem: jest.fn(() => {
          return [{ status: 'success' }];
        }),
        updateRecord: jest.fn(() => {
          return [{ status: 'failure' }];
        })
      };

      await dataSource.processRecord(csvRow, recordTypeConfig);

      expect(recordTypeUtils.transformRecord).toHaveBeenCalledWith(csvRow);
      expect(recordTypeUtils.findExistingRecord).toHaveBeenCalledWith({ transformed: true });
      expect(recordTypeUtils.createItem).toHaveBeenCalledWith({ transformed: true });
      expect(dataSource.status.itemsProcessed).toEqual(1);
      expect(taskAuditRecord.updateTaskRecord).toHaveBeenCalledWith({ itemsProcessed: 1 });
    });

    it('transforms, saves, and updates the status for the existing csvRow', async () => {
      const taskAuditRecord = { updateTaskRecord: jest.fn(() => {}) };

      const dataSource = new AlcCsvDataSource(taskAuditRecord, null, null, null);

      const csvRow = {};

      const recordTypeConfig = { getUtil: () => recordTypeUtils };
      const recordTypeUtils = {
        transformRecord: jest.fn(() => {
          return { transformed: true };
        }),
        findExistingRecord: jest.fn(() => {
          return { _id: 123 };
        }),
        createItem: jest.fn(() => {
          return [{ status: 'failure' }];
        }),
        updateRecord: jest.fn(() => {
          return [{ status: 'success' }];
        })
      };

      await dataSource.processRecord(csvRow, recordTypeConfig);

      expect(recordTypeUtils.transformRecord).toHaveBeenCalledWith(csvRow);
      expect(recordTypeUtils.findExistingRecord).toHaveBeenCalledWith({ transformed: true });
      expect(recordTypeUtils.updateRecord).toHaveBeenCalledWith({ transformed: true }, { _id: 123 });
      expect(dataSource.status.itemsProcessed).toEqual(1);
      expect(taskAuditRecord.updateTaskRecord).toHaveBeenCalledWith({ itemsProcessed: 1 });
    });
  });
});
