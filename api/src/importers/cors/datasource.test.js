const CorsCsvDataSource = require('./datasource');

describe('CorsCsvDataSource', () => {
  describe('constructor', () => {
    it('sets taskAuditRecord', () => {
      const dataSource = new CorsCsvDataSource('taskAuditRecord', null, null, null);
      expect(dataSource.taskAuditRecord).toEqual('taskAuditRecord');
    });

    it('sets auth_payload', () => {
      const dataSource = new CorsCsvDataSource(null, 'authPayload', null, null);
      expect(dataSource.auth_payload).toEqual('authPayload');
    });

    it('sets recordType', () => {
      const dataSource = new CorsCsvDataSource(null, null, 'recordType', null);
      expect(dataSource.recordType).toEqual('recordType');
    });

    it('sets recordType', () => {
      const dataSource = new CorsCsvDataSource(null, null, null, 'csvRows');
      expect(dataSource.csvRows).toEqual('csvRows');
    });

    it('sets default status fields', () => {
      const dataSource = new CorsCsvDataSource();
      expect(dataSource.status).toEqual({
        itemsProcessed: 0,
        itemTotal: 0,
        individualRecordStatus: []
      });
    });
  });

  describe('processRecord', () => {
    it('sets an error if csvRow is null', async () => {
      const dataSource = new CorsCsvDataSource();

      await dataSource.processRecord(null, 'recordTypeConfig');

      expect(dataSource.status.individualRecordStatus[0]).toEqual({
        message: 'processRecord - unexpected error',
        error: 'processRecord - required csvRow is null.'
      });
    });

    it('sets an error if recordTypeConfig is null', async () => {
      const dataSource = new CorsCsvDataSource();

      await dataSource.processRecord('recordTypeConfig', null);

      expect(dataSource.status.individualRecordStatus[0]).toEqual({
        message: 'processRecord - unexpected error',
        error: 'processRecord - required recordTypeConfig is null.'
      });
    });

    it('transforms, saves, and updates the status for the new csvRow', async () => {
      const taskAuditRecord = { updateTaskRecord: jest.fn(() => {}) };

      const dataSource = new CorsCsvDataSource(taskAuditRecord, null, null, null);

      const csvRow = {};

      const recordTypeConfig = { getUtil: () => recordTypeUtils };
      const recordTypeUtils = {
        transformRecord: jest.fn(() => {
          return { transformed: true };
        }),
        findExistingRecord: jest.fn(() => null),
        createRecord: jest.fn(() => {
          return [{ status: 'success' }];
        }),
        updateRecord: jest.fn(() => {
          return [{ status: 'failure' }];
        })
      };

      await dataSource.processRecord(csvRow, recordTypeConfig);

      expect(recordTypeUtils.transformRecord).toHaveBeenCalledWith(csvRow);

      expect(recordTypeUtils.findExistingRecord).toHaveBeenCalledWith({ transformed: true });

      expect(recordTypeUtils.createRecord).toHaveBeenCalledWith({ transformed: true });

      expect(dataSource.status.itemsProcessed).toEqual(1);

      expect(taskAuditRecord.updateTaskRecord).toHaveBeenCalledWith({ itemsProcessed: 1 });
    });

    it('transforms, saves, and updates the status for the existing csvRow', async () => {
      const taskAuditRecord = { updateTaskRecord: jest.fn(() => {}) };

      const dataSource = new CorsCsvDataSource(taskAuditRecord, null, null, null);

      const csvRow = {};

      const recordTypeConfig = { getUtil: () => recordTypeUtils };
      const recordTypeUtils = {
        transformRecord: jest.fn(() => {
          return { transformed: true };
        }),
        findExistingRecord: jest.fn(() => {
          return { _id: 123 };
        }),
        createRecord: jest.fn(() => {
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
