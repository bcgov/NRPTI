const CoorsCsvDataSource = require('./datasource');

describe('CoorsCsvDataSource', () => {
  describe('constructor', () => {
    it('sets taskAuditRecord', () => {
      const dataSource = new CoorsCsvDataSource('taskAuditRecord', null, null, null);
      expect(dataSource.taskAuditRecord).toEqual('taskAuditRecord');
    });

    it('sets auth_payload', () => {
      const dataSource = new CoorsCsvDataSource(null, 'authPayload', null, null);
      expect(dataSource.auth_payload).toEqual('authPayload');
    });

    it('sets recordType', () => {
      const dataSource = new CoorsCsvDataSource(null, null, 'recordType', null);
      expect(dataSource.recordType).toEqual('recordType');
    });

    it('sets recordType', () => {
      const dataSource = new CoorsCsvDataSource(null, null, null, 'csvRows');
      expect(dataSource.csvRows).toEqual('csvRows');
    });

    it('sets default status fields', () => {
      const dataSource = new CoorsCsvDataSource();
      expect(dataSource.status).toEqual({
        itemsProcessed: 0,
        itemTotal: 0,
        individualRecordStatus: []
      });
    });
  });

  describe('run', () => {
    it('sets itemTotal and updates task record status', async () => {
      const taskAuditRecord = { updateTaskRecord: jest.fn() };
      const dataSource = new CoorsCsvDataSource(taskAuditRecord, null, null, [{}, {}]);

      await dataSource.run();

      expect(dataSource.status.itemTotal).toEqual(2);
      expect(taskAuditRecord.updateTaskRecord).toHaveBeenCalledWith({
        status: 'Running',
        itemTotal: 2,
      });
    });
  });

  describe('batchProcessRecords', () => {
    it('processes csvRows in batches', async () => {
      const taskAuditRecord = { updateTaskRecord: jest.fn() };
      const fakeCsvRows = [
        {
          id: 1,
          enforcement_outcome: 'GTYJ',
        },
        {
          id: 2,
          enforcement_outcome: 'Other',
        },
      ];
      const dataSource = new CoorsCsvDataSource(taskAuditRecord, null, "Ticket", fakeCsvRows);

      dataSource.processRecord = jest.fn();

      await dataSource.batchProcessRecords();
  
      expect(dataSource.processRecord).toHaveBeenCalledTimes(2);
    });
  });

  describe('getRecordTypeConfig', () => {
    it('returns the correct record type config for Ticket', () => {
      const dataSource = new CoorsCsvDataSource(null, null, 'Ticket', null);
      const config = dataSource.getRecordTypeConfig();
      expect(config).toBeDefined();
      expect(config.getUtil).toBeDefined();
    });

    it('returns the correct record type config for Court Conviction', () => {
      const dataSource = new CoorsCsvDataSource(null, null, 'Court Conviction', null);
      const config = dataSource.getRecordTypeConfig();
      expect(config).toBeDefined();
      expect(config.getUtil).toBeDefined();
    });

    it('returns the correct record type config for Administrative Sanction', () => {
      const dataSource = new CoorsCsvDataSource(null, null, 'Administrative Sanction', null);
      const config = dataSource.getRecordTypeConfig();
      expect(config).toBeDefined();
      expect(config.getUtil).toBeDefined();
    });

    it('returns null for an unknown record type', () => {
      const dataSource = new CoorsCsvDataSource(null, null, 'Unknown Record Type', null);
      const config = dataSource.getRecordTypeConfig();
      expect(config).toBeNull();
    });
  });

  describe('processRecord', () => {
    it('sets an error if csvRow is null', async () => {
      const dataSource = new CoorsCsvDataSource();

      await dataSource.processRecord(null, 'recordTypeConfig');

      expect(dataSource.status.individualRecordStatus[0]).toEqual({
        message: 'processRecord - unexpected error',
        error: 'processRecord - required csvRow is null.'
      });
    });

    it('sets an error if recordTypeConfig is null', async () => {
      const dataSource = new CoorsCsvDataSource();

      await dataSource.processRecord('recordTypeConfig', null);

      expect(dataSource.status.individualRecordStatus[0]).toEqual({
        message: 'processRecord - unexpected error',
        error: 'processRecord - required recordTypeConfig is null.'
      });
    });

    it('transforms, saves, and updates the status for the new csvRow', async () => {
      const taskAuditRecord = { updateTaskRecord: jest.fn(() => {}) };

      const dataSource = new CoorsCsvDataSource(taskAuditRecord, null, null, null);

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

      const dataSource = new CoorsCsvDataSource(taskAuditRecord, null, null, null);

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
