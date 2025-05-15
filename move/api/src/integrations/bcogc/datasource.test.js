const OgcCsvDataSource = require('./datasource');
const axios = require('axios');
const RECORD_TYPE = require('../../utils/constants/record-type-enum');
const BCOGC_INSPECTIONS_CSV_ENDPOINT = process.env.BCOGC_INSPECTIONS_CSV_ENDPOINT || 'https://reports.bc-er.ca/ogc/f?p=200:501::CSV';
const BCOGC_ORDERS_CSV_ENDPOINT = process.env.BCOGC_ORDERS_CSV_ENDPOINT || 'https://www.bc-er.ca/data-reports/compliance-enforcement/reports/enforcement-order';
const BCOGC_PENALTIES_CSV_ENDPOINT = process.env.BCOGC_PENALTIES_CSV_ENDPOINT || 'https://www.bc-er.ca/data-reports/compliance-enforcement/reports/contravention-decision';
const BCOGC_WARNING_CSV_ENDPOINT = process.env.BCOGC_WARNING_CSV_ENDPOINT  || 'https://www.bc-er.ca/data-reports/compliance-enforcement/reports/warning-letter';
const ENERGY_ACT_CODE = 'ACT_103' //unique code for Energy related activities that map to updated legislation names in the acts_regulations_mapping collection in the db

describe('OgcCsvDataSource', () => {
  describe('constructor', () => {
    it('sets default status fields with zero values', () => {
      const dataSource = new OgcCsvDataSource();
      const expectedStatus = {
        itemsProcessed: 0,
        itemTotal: 0,
        individualRecordStatus: []
      };
      expect(dataSource.status).toEqual(expectedStatus);
    });

    it('sets taskAuditRecord', () => {
      const dataSource = new OgcCsvDataSource('taskAuditRecord', null, null, null);
      expect(dataSource.taskAuditRecord).toEqual('taskAuditRecord');
    });

    it('sets auth_payload', () => {
      const dataSource = new OgcCsvDataSource(null, 'authPayload', null, null);
      expect(dataSource.auth_payload).toEqual('authPayload');
    });

    it('sets recordType', () => {
      const dataSource = new OgcCsvDataSource(null, null, null, 'recordTypes');
      expect(dataSource.recordTypes).toEqual('recordTypes');
    });

    it('sets params', () => {
      const dataSource = new OgcCsvDataSource(null, null, 'params', null);
      expect(dataSource.params).toEqual('params');
    });

    it('sets default status fields', () => {
      const dataSource = new OgcCsvDataSource();
      expect(dataSource.status).toEqual({
        itemsProcessed: 0,
        itemTotal: 0,
        individualRecordStatus: []
      });
    });
  });

  describe('run', () => {
    it('should fetch CSV data and process records', async () => {
      const taskAuditRecord = { updateTaskRecord: jest.fn(() => {}) };
      const dataSource = new OgcCsvDataSource(taskAuditRecord, null, null, null);

      const inspections = [{
        Title: 'Inspection Letter 1234-1234',
        'Date Issued': '11/30/2023',
        Proponent: 'Company Ltd.',
        Filename: 'Inspection-Letter-.pdf',
        'File URL': 'www.example.com'
      }]
      const orders = [{
        Title: 'Order Letter 1234-1234',
        'Date Issued': '11/30/2023',
        Proponent: 'Company Ltd.',
        Filename: 'Order-Letter-.pdf',
        'File URL': 'www.example.com'
      }]
      const penalties = [{
        Title: 'AdminPenalty Letter 1234-1234',
        'Date Issued': '11/30/2023',
        Proponent: 'Company Ltd.',
        Filename: 'AdminPenalty-Letter-.pdf',
        'File URL': 'www.example.com'
      }]
      const warnings = [{
        Title: 'Warning Letter 1234-1234',
        'Date Issued': '11/30/2023',
        Proponent: 'Company Ltd.',
        Filename: 'Warning-Letter-.pdf',
        'File URL': 'www.example.com'
      }]

      jest.spyOn(dataSource, 'fetchAllBcogcCsvs').mockResolvedValue({
        [RECORD_TYPE.Inspection._schemaName]: inspections,
        [RECORD_TYPE.Order._schemaName]: orders,
        [RECORD_TYPE.AdministrativePenalty._schemaName]: penalties,
        [RECORD_TYPE.Warning._schemaName]: warnings,
        types: [RECORD_TYPE.AdministrativePenalty._schemaName, RECORD_TYPE.Order._schemaName, RECORD_TYPE.Inspection._schemaName, RECORD_TYPE.Warning._schemaName],
        getLength: () => orders.length + inspections.length + penalties.length + warnings.length,
      });

      await dataSource.run();

      expect(dataSource.fetchAllBcogcCsvs).toHaveBeenCalledTimes(1);
      expect(taskAuditRecord.updateTaskRecord).toHaveBeenCalledWith({
        status: 'Running',
        itemTotal: 4
      });
    });
  });

  describe('processRecord', () => {
    it('sets an error if csvRow is null', async () => {
      const dataSource = new OgcCsvDataSource();

      await dataSource.processRecord(null, 'recordTypeConfig');

      expect(dataSource.status.individualRecordStatus[0]).toEqual({
        message: 'processRecord - unexpected error',
        error: 'processRecord - required csvRow is null.'
      });
    });

    it('sets an error if recordTypeConfig is null', async () => {
      const dataSource = new OgcCsvDataSource();

      await dataSource.processRecord('recordTypeConfig', null);

      expect(dataSource.status.individualRecordStatus[0]).toEqual({
        message: 'processRecord - unexpected error',
        error: 'processRecord - required recordTypeConfig is null.'
      });
    });

    it('transforms, saves, and updates the status for the new csvRow', async () => {
      const taskAuditRecord = { updateTaskRecord: jest.fn(() => {}) };

      const dataSource = new OgcCsvDataSource(taskAuditRecord, null, null, null);

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

      expect(recordTypeUtils.transformRecord).toHaveBeenCalledWith(csvRow, ENERGY_ACT_CODE );
      expect(recordTypeUtils.findExistingRecord).toHaveBeenCalledWith({ transformed: true });
      expect(recordTypeUtils.createItem).toHaveBeenCalledWith({ transformed: true });
      expect(dataSource.status.itemsProcessed).toEqual(1);
      expect(taskAuditRecord.updateTaskRecord).toHaveBeenCalledWith({ itemsProcessed: 1 });
    });

    it('transforms, saves, and updates the status for the existing csvRow', async () => {
      const taskAuditRecord = { updateTaskRecord: jest.fn(() => {}) };

      const dataSource = new OgcCsvDataSource(taskAuditRecord, null, null, null);

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

      expect(recordTypeUtils.transformRecord).toHaveBeenCalledWith(csvRow, ENERGY_ACT_CODE);
      expect(recordTypeUtils.findExistingRecord).toHaveBeenCalledWith({ transformed: true });
      expect(recordTypeUtils.updateRecord).toHaveBeenCalledWith({ transformed: true }, { _id: 123 });
      expect(dataSource.status.itemsProcessed).toEqual(1);
      expect(taskAuditRecord.updateTaskRecord).toHaveBeenCalledWith({ itemsProcessed: 1 });
    });
  });

  jest.mock('axios');

  describe('fetchAllBcogcCsvs', () => {
    let dataSource;
  
    beforeEach(() => {
      const taskAuditRecord = { updateTaskRecord: jest.fn(() => {}) };
      dataSource = new OgcCsvDataSource(taskAuditRecord, null, null, null);
    });
  
    afterEach(() => {
      jest.restoreAllMocks();
      dataSource = null;
    });
  
    it('should fetch all CSV data', async () => {
      const mockResponseData = 'CSV Data';
  
      jest.spyOn(axios, 'get').mockResolvedValue({ data: mockResponseData });
  
      const result = await dataSource.fetchAllBcogcCsvs();
  
      expect(axios.get).toHaveBeenCalledWith(BCOGC_INSPECTIONS_CSV_ENDPOINT, undefined);
      expect(axios.get).toHaveBeenCalledWith(BCOGC_ORDERS_CSV_ENDPOINT);
      expect(axios.get).toHaveBeenCalledWith(BCOGC_PENALTIES_CSV_ENDPOINT);
      expect(axios.get).toHaveBeenCalledWith(BCOGC_WARNING_CSV_ENDPOINT);
  
      expect(result).toHaveProperty('Inspection');
      expect(result).toHaveProperty('Order');
      expect(result).toHaveProperty('AdministrativePenalty');
      expect(result).toHaveProperty('Warning');
    });
  
    it('should have correct data types', async () => {
      const mockResponseData = 'CSV Data';
  
      jest.spyOn(axios, 'get').mockResolvedValue({ data: mockResponseData });
  
      const result = await dataSource.fetchAllBcogcCsvs();
  
      expect(Array.isArray(result.Order)).toBe(true);
      expect(Array.isArray(result.AdministrativePenalty)).toBe(true);
      expect(Array.isArray(result.Warning)).toBe(true);
    });
  
    it('should have a valid getLength function', async () => {
      const mockResponseData = 'CSV Data';
  
      jest.spyOn(axios, 'get').mockResolvedValue({ data: mockResponseData });
  
      const result = await dataSource.fetchAllBcogcCsvs();
  
      expect(typeof result.getLength).toBe('function');
    });
  });

  describe('processBcogcHtml', () => {
    it('should handle empty HTML content', () => {
      const mockHtmlResponse = '';

      const dataSource = new OgcCsvDataSource();
      const processedRows = dataSource.processBcogcHtml(mockHtmlResponse, 'export-table');

      expect(processedRows).toEqual([]);
    });
    
    it('should process BCOGC HTML table correctly', async () => {
      const mockHtmlResponse = '<table class="export-table"><tr><th>Heading 1</th><th>Heading 2</th></tr><tr><td>Data 1</td><td>Data 2</td></tr></table>';

      const dataSource = new OgcCsvDataSource();
      const result = await dataSource.processBcogcHtml(mockHtmlResponse, 'export-table');
  
      expect(result).toEqual([
        { 'Heading 1': 'Data 1', 'Heading 2': 'Data 2' },
      ]);
    });    
  });
});
