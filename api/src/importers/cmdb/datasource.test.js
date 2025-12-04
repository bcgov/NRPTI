const CmdbCsvDataSource = require('./datasource');

describe('CmdbCsvDataSource', () => {
  describe('constructor', () => {
    it('sets taskAuditRecord', () => {
      const dataSource = new CmdbCsvDataSource('taskAuditRecord', null, null, null);
      expect(dataSource.taskAuditRecord).toEqual('taskAuditRecord');
    });

    it('sets auth_payload', () => {
      const dataSource = new CmdbCsvDataSource(null, 'authPayload', null, null);
      expect(dataSource.auth_payload).toEqual('authPayload');
    });

    it('sets recordType', () => {
      const dataSource = new CmdbCsvDataSource(null, null, 'recordType', null);
      expect(dataSource.recordType).toEqual('recordType');
    });

    it('sets recordType', () => {
      const dataSource = new CmdbCsvDataSource(null, null, null, []);
      expect(dataSource.csvRows).toEqual([]);
    });

    it('sets default status fields', () => {
      const dataSource = new CmdbCsvDataSource();
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
      const dataSource = new CmdbCsvDataSource(taskAuditRecord, null, null, null);
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
    it('handles batch processing of csv rows', async () => {
      const taskAuditRecord = { updateTaskRecord: jest.fn(() => {}) };
      const dataSource = new CmdbCsvDataSource(taskAuditRecord, null, 'Inspection', []);

      dataSource.csvRows = [
        { 'inspection id': '1', 'regulation section': 'Section A' },
        { 'inspection id': '2', 'regulation section': 'Section B' },
        { 'inspection id': '1', 'regulation section': 'Section C' },
        { 'inspection id': '3', 'regulation section': 'Section D' }
      ];

      const recordTypeUtils = {
        transformRecord: jest.fn(),
        findExistingRecord: jest.fn(),
        createItem: jest.fn(() => [{ status: 'success' }]),
        updateRecord: jest.fn(() => [{ status: 'success' }])
      };

      const recordTypeConfig = {
        getUtil: jest.fn(() => recordTypeUtils)
      };

      dataSource.getRecordTypeConfig = jest.fn(() => recordTypeConfig);

      await dataSource.batchProcessRecords();

      expect(recordTypeUtils.transformRecord).toHaveBeenCalledTimes(4);
      expect(recordTypeUtils.createItem).toHaveBeenCalledTimes(4);
      expect(dataSource.status.itemsProcessed).toEqual(4);
      expect(taskAuditRecord.updateTaskRecord).toHaveBeenCalledWith({ itemsProcessed: 4 });
    });
  });

  describe('processRecord', () => {
    it('sets an error if csvRow is null', async () => {
      const dataSource = new CmdbCsvDataSource();

      await dataSource.processRecord(null, 'recordTypeConfig');

      expect(dataSource.status.individualRecordStatus[0]).toEqual({
        message: 'processRecord - unexpected error',
        error: 'processRecord - required csvRow is null.'
      });
    });

    it('sets an error if recordTypeConfig is null', async () => {
      const dataSource = new CmdbCsvDataSource();

      await dataSource.processRecord('recordTypeConfig', null);

      expect(dataSource.status.individualRecordStatus[0]).toEqual({
        message: 'processRecord - unexpected error',
        error: 'processRecord - required recordTypeConfig is null.'
      });
    });

    it('transforms, saves, and updates the status for the new csvRow', async () => {
      const taskAuditRecord = { updateTaskRecord: jest.fn(() => {}) };

      const dataSource = new CmdbCsvDataSource(taskAuditRecord, null, null, null);

      const csvRow = {};
      const outcomeDescription = '';

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

      expect(recordTypeUtils.transformRecord).toHaveBeenCalledWith(csvRow, outcomeDescription);
      expect(recordTypeUtils.findExistingRecord).toHaveBeenCalledWith({ transformed: true });
      expect(recordTypeUtils.createItem).toHaveBeenCalledWith({ transformed: true });
      expect(dataSource.status.itemsProcessed).toEqual(1);
      expect(taskAuditRecord.updateTaskRecord).toHaveBeenCalledWith({ itemsProcessed: 1 });
    });

    it('transforms, saves, and updates the status for the existing csvRow', async () => {
      const taskAuditRecord = { updateTaskRecord: jest.fn(() => {}) };

      const dataSource = new CmdbCsvDataSource(taskAuditRecord, null, null, null);

      const csvRow = {};
      const outcomeDescription = '';

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

      expect(recordTypeUtils.transformRecord).toHaveBeenCalledWith(csvRow, outcomeDescription);
      expect(recordTypeUtils.findExistingRecord).toHaveBeenCalledWith({ transformed: true });
      expect(recordTypeUtils.updateRecord).toHaveBeenCalledWith({ transformed: true }, { _id: 123 });
      expect(dataSource.status.itemsProcessed).toEqual(1);
      expect(taskAuditRecord.updateTaskRecord).toHaveBeenCalledWith({ itemsProcessed: 1 });
    });
  });
});
