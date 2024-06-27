const DataSource = require('./datasource');
const defaultLogger = require('../../utils/logger')('core-datasource');
const integrationUtils = require('../integration-utils');

const mockedTaskAuditRecord = { updateTaskRecord: jest.fn() };
const mockedAuthPayload = 'auth_payload';

describe('Core DataSource', () => {
  describe('constructor', () => {
    it('should set taskAuditRecord and auth_payload', () => {
      const dataSource = new DataSource(mockedTaskAuditRecord, mockedAuthPayload);

      expect(dataSource.taskAuditRecord).toEqual(mockedTaskAuditRecord);
      expect(dataSource.auth_payload).toEqual(mockedAuthPayload);
    });

    it('should set default status fields', () => {
      const dataSource = new DataSource(mockedTaskAuditRecord, mockedAuthPayload);

      expect(dataSource.status).toEqual({
        itemsProcessed: 0,
        itemTotal: 0,
        individualRecordStatus: []
      });
    });
  });

  describe('run', () => {
    it('executes run method successfully', async () => {
      const mockedTaskAuditRecord = { updateTaskRecord: jest.fn().mockResolvedValueOnce({ status: 'Running' }) };
      const dataSource = new DataSource(mockedTaskAuditRecord);
  
      await dataSource.run();
  
      expect(mockedTaskAuditRecord.updateTaskRecord).toHaveBeenCalledWith({ status: 'Running' });
    });
  });

  describe('updateRecords', () => {
    it('handles no records found scenario', async () => {
      const mockedGetAllRecordData = jest.fn().mockResolvedValueOnce([]);
      const errorSpy = jest.spyOn(defaultLogger, 'error').mockImplementation(() => {});
      const mockedTaskAuditRecord = { updateTaskRecord: jest.fn() };
      const dataSource = new DataSource(mockedTaskAuditRecord);
      dataSource.getAllRecordData = mockedGetAllRecordData;

      await dataSource.updateRecords();

      expect(errorSpy).toHaveBeenCalledWith('updateRecords - no records found to update');
    });

    it('handles errors in updateRecords method', async () => {
      const mockedGetAllRecordData = jest.fn().mockRejectedValueOnce(new Error('Test updateRecords error'));
      const errorSpy = jest.spyOn(defaultLogger, 'error').mockImplementation(() => {});
      const mockedTaskAuditRecord = { updateTaskRecord: jest.fn() };
      const dataSource = new DataSource(mockedTaskAuditRecord);
      dataSource.getAllRecordData = mockedGetAllRecordData;

      await expect(dataSource.updateRecords()).rejects.toThrow('Test updateRecords error');
      expect(errorSpy).toHaveBeenCalledWith('updateRecords - unexpected error: Test updateRecords error');
    });
  });

  describe('getAllRecordData', () => {
    it('should handle unexpected error during data retrieval', async () => {
      const dataSource = new DataSource(mockedTaskAuditRecord, mockedAuthPayload);
      integrationUtils.getRecords = jest.fn(() => { throw new Error('Test error') });

      await expect(dataSource.getAllRecordData()).rejects.toThrow('Test error');
    });
  });

  describe('processRecords', () => {
    it('calls `processRecord` on all records', async () => {
      integrationUtils.getRecords = jest.fn(() => ({
        records: []
      }));

      const mockGetIntegrationUrl = jest.fn(() => {
        return 'test/path';
      });

      const dataSource = new DataSource();
      dataSource.getIntegrationUrl = mockGetIntegrationUrl;

      jest.spyOn(dataSource, 'processRecord').mockImplementation((utils, commodities, record) => {
        return Promise.resolve();
      });

      // Number of elements in array should be number of times 
      // processRecord is called.
      const mockRecords = [
        {
          name: 'test'
        },
        {
          name: 'test2'
        }
      ];

      await dataSource.processRecords({}, mockRecords);

      expect(dataSource.processRecord).toHaveBeenCalledTimes(mockRecords.length);
    });

    it('throws error if missing recordTypeUtils param', async () => {
      const dataSource = new DataSource();
      await expect(dataSource.processRecords(null, [])).rejects.toThrow('processRecords - required utils is null.');
    });

    it('throws error if missing coreRecords param', async () => {
      const dataSource = new DataSource();
      await expect(dataSource.processRecords({}, null)).rejects.toThrow('processRecords - required coreRecords is null.');
    });
  });

  describe('processRecord', () => {
    it('silently handles thrown error', async () => {
      const mockRecordUtils = {
        transformRecord: jest.fn(() => {
          throw new Error('Test error')
        })
      };

      const dataSource = new DataSource();
      await expect(dataSource.processRecord(mockRecordUtils, [], {})).resolves.not.toThrow();
    });

    it('handles error if missing mineUtils param', async () => {
      const dataSource = new DataSource();
      const utils = {
        mineUtils: null
      };
      dataSource.processRecord(utils, [], {});
      expect(dataSource.status.individualRecordStatus[0].error).toEqual('processRecord - required mineUtils is null.');
    });

    it('handles error if missing coreRecord param', async () => {
      const dataSource = new DataSource();
      const utils = {
        mineUtils: {},
        permitUtils: {},
        collectionUtils: {}
      }
      dataSource.processRecord(utils, [], null);
      expect(dataSource.status.individualRecordStatus[0].error).toEqual('processRecord - required coreRecord is null.');
    });
  });

  describe('getMinePermits', () => {
    
    it('throws an error when no permit is found in getMinePermits method', async () => {
      const nrptiRecord = null;
      
      const dataSource = new DataSource(null);
      
      await expect(dataSource.getMinePermits(nrptiRecord)).rejects.toThrow('getMinePermits - required nrptiRecord is null.');
    });
  });

  describe('createMinePermit', () => {
    it('throws an error when valid permit cannot be found in createMinePermit method', async () => {
      const permitUtils = {
        transformRecord: jest.fn(),
      };
    
      const nrptiRecord = {};
    
      const dataSource = new DataSource(null);
      dataSource.getMinePermit = jest.fn().mockResolvedValueOnce(null);
    
      await expect(dataSource.createMinePermit(permitUtils, nrptiRecord)).rejects.toThrow('createMinePermit - Cannot find valid permit');
    });
  });

  describe('updateMinePermit', () => {
    it('throws an error when valid permit cannot be found in updateMinePermit method', async () => {
      const permitUtils = {
        transformRecord: jest.fn(),
        getMinePermits: jest.fn(),
        updateRecord: jest.fn(),
      };

      const mineRecord = {}

      const dataSource = new DataSource(null);
      dataSource.getMinePermit = jest.fn().mockResolvedValueOnce(null);

      await expect(dataSource.updateMinePermit(permitUtils, mineRecord)).rejects.toThrow('updateMinePermit - Cannot find valid permit');
    });
  });


  describe('getVerifiedMines', () => {
    global.CORE_API_BATCH_SIZE = 1;
    global.CORE_API_HOST = 'testHost';
    global.CORE_API_PATHNAME = 'testPath';
    
    it('should call getRecords in the getVerifiedMines call', async () => {
      const dataSource = new DataSource(null);
      dataSource.client_token = 'testToken';

      const spy = jest.spyOn(integrationUtils, 'getRecords');
      
      await dataSource.getVerifiedMines();
  
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('createorUpdateCollections', () => {
    it('throws error if collectionUtils param is missing', async () => {
      const dataSource = new DataSource();
      const permit = {};
      const mineRecord = {};
  
      await expect(dataSource.createorUpdateCollections(null, permit, mineRecord)).rejects.toThrow(
        'createorUpdateCollections - param collectionUtils is null.'
      );
    });
  
    it('throws error if permit param is missing', async () => {
      const dataSource = new DataSource();
      const collectionUtils = {};
      const mineRecord = {};
  
      await expect(dataSource.createorUpdateCollections(collectionUtils, null, mineRecord)).rejects.toThrow(
        'createorUpdateCollections - param permit is null.'
      );
    });
  
    it('throws error if mineRecord param is missing', async () => {
      const dataSource = new DataSource();
      const collectionUtils = {};
      const permit = {};
  
      await expect(dataSource.createorUpdateCollections(collectionUtils, permit, null)).rejects.toThrow(
        'createorUpdateCollections - param permit is null.'
      );
    });
  });
});
