const EpicDataSource = require('./epic-datasource');
const EpicOrders = require('./epic-orders');
const EpicInspections = require('./epic-inspections');
const EPIC_TYPE = require('./epic-type-enum');

describe('EpicDataSource', () => {
  describe('constructor', () => {
    it('throws error if recordType not provided', () => {
      expect(() => new EpicDataSource()).toThrow(new Error('EpicDataSource - missing required recordType parameter'));
    });

    it('throws error if recordType is not in the EPIC_TYPE enum', () => {
      expect(() => new EpicDataSource('notAValidType')).toThrow(
        new Error('EpicDataSource - recordType parameter is not supported')
      );
    });

    it('sets type', () => {
      const epicDataSource = new EpicDataSource('order');
      expect(epicDataSource.type).toEqual(EPIC_TYPE.order);
    });

    it('sets params', () => {
      const epicDataSource = new EpicDataSource('order', { params: 1 });
      expect(epicDataSource.params).toEqual({ params: 1 });
    });

    it('sets default params if not provided', () => {
      const epicDataSource = new EpicDataSource('order');
      expect(epicDataSource.params).toEqual({});
    });

    it('sets default status fields', () => {
      const epicDataSource = new EpicDataSource('order');
      expect(epicDataSource.status).toEqual({ itemsProcessed: 0, itemTotal: 0 });
    });
  });

  describe('updateRecords', () => {
    it('catches any thrown exceptions and returns gracefully', async () => {
      // mock utils called by updateRecords()
      const mockResponse = [{ searchResults: [], meta: 'meta!' }];
      jest.spyOn(require('../integration-utils'), 'getRecords').mockImplementation(() => {
        return Promise.resolve(mockResponse);
      });

      const epicDataSource = new EpicDataSource('order', { param1: 1 });

      // mock EpicDataSource functions called by updateRecords()
      epicDataSource.getRecordTypeId = jest.fn(() => {
        throw Error('unexpected error!');
      });
      epicDataSource.getBaseParams = jest.fn();
      epicDataSource.getIntegrationUrl = jest.fn();
      epicDataSource.getHostname = jest.fn();
      epicDataSource.getPathname = jest.fn();
      epicDataSource.processRecords = jest.fn();

      const status = await epicDataSource.updateRecords();

      expect(epicDataSource.getRecordTypeId).toHaveBeenCalledTimes(1);
      expect(epicDataSource.getBaseParams).not.toHaveBeenCalled();
      expect(epicDataSource.getIntegrationUrl).not.toHaveBeenCalled();
      expect(epicDataSource.processRecords).not.toHaveBeenCalled();

      expect(status).toEqual({
        message: 'unexpected error',
        error: JSON.stringify(new Error('unexpected error!')),
        itemsProcessed: 0,
        itemTotal: 0
      });
    });

    it('returns early if no epic records are found', async () => {
      // mock utils called by updateRecords()
      const mockResponse = [{ searchResults: [], meta: 'meta!' }];
      jest.spyOn(require('../integration-utils'), 'getRecords').mockImplementation(() => {
        return Promise.resolve(mockResponse);
      });

      const epicDataSource = new EpicDataSource('order', { param1: 1 });

      // mock EpicDataSource functions called by updateRecords()
      epicDataSource.getRecordTypeId = jest.fn(() => {
        return Promise.resolve('321');
      });
      epicDataSource.getBaseParams = jest.fn(() => {
        return { baseparams: 1 };
      });
      epicDataSource.getIntegrationUrl = jest.fn(() => {
        return 'url';
      });
      epicDataSource.getHostname = jest.fn(() => {
        return 'hostname';
      });
      epicDataSource.getEpicSearchPathname = jest.fn(() => {
        return 'searchPathname';
      });
      epicDataSource.getEpicProjectPathname = jest.fn(() => {
        return 'projectPathname';
      });
      epicDataSource.processRecords = jest.fn();

      const status = await epicDataSource.updateRecords();

      expect(epicDataSource.getRecordTypeId).toHaveBeenCalledTimes(1);
      expect(epicDataSource.getBaseParams).toHaveBeenCalledWith(
        '321',
        '5cf00c03a266b7e1877504ef', // TODO don't hardcode milestone
        Number.MAX_SAFE_INTEGER,
        0
      );
      expect(epicDataSource.getIntegrationUrl).toHaveBeenCalledWith('hostname', 'searchPathname', {
        param1: 1,
        baseparams: 1
      });

      expect(epicDataSource.processRecords).not.toHaveBeenCalled();

      expect(status).toEqual({
        message: 'no records found',
        itemsProcessed: 0,
        itemTotal: 0,
        dataSource: 'url'
      });
    });

    it('calls all functions necessary to update epic records for the given type', async () => {
      // mock utils called by updateRecords()
      const mockResponse = [
        {
          searchResults: [{ _id: '123' }, { _id: '456' }, { _id: '789' }],
          meta: 'meta!'
        }
      ];
      jest.spyOn(require('../integration-utils'), 'getRecords').mockImplementation(() => {
        return Promise.resolve(mockResponse);
      });

      const epicDataSource = new EpicDataSource('order', { param1: 1 });

      // mock EpicDataSource functions called by updateRecords()
      epicDataSource.getRecordTypeId = jest.fn(() => {
        return Promise.resolve('321');
      });
      epicDataSource.getBaseParams = jest.fn(() => {
        return { baseparams: 1 };
      });
      epicDataSource.getIntegrationUrl = jest.fn(() => {
        return 'url';
      });
      epicDataSource.getHostname = jest.fn(() => {
        return 'hostname';
      });
      epicDataSource.getEpicSearchPathname = jest.fn(() => {
        return 'searchPathname';
      });
      epicDataSource.processRecords = jest.fn();

      const status = await epicDataSource.updateRecords();

      expect(epicDataSource.getRecordTypeId).toHaveBeenCalledTimes(1);
      expect(epicDataSource.getBaseParams).toHaveBeenCalledWith(
        '321',
        '5cf00c03a266b7e1877504ef', // TODO don't hardcode milestone
        Number.MAX_SAFE_INTEGER,
        0
      );

      expect(epicDataSource.getIntegrationUrl).toHaveBeenCalledWith('hostname', 'searchPathname', {
        param1: 1,
        baseparams: 1
      });

      expect(status).toEqual({ itemsProcessed: 0, itemTotal: 3, dataSource: 'url', epicMeta: 'meta!' });
    });
  });

  describe('processRecords', () => {
    it('transforms, saves, and updates the status for each epic record', async () => {
      // mock epic inspection utils
      const mockEpicInspections = {
        transformRecord: jest.fn(record => {
          return { ...record, transformed: true };
        }),
        saveRecord: jest.fn(record => {
          return 'saved!';
        })
      };

      const epicDataSource = new EpicDataSource('inspection');

      epicDataSource.getRecordProject = jest.fn(record => {
        return { name: record._id };
      });

      // return our mock utils instead of the real ones.
      epicDataSource.getRecordTypeUtils = () => {
        return mockEpicInspections;
      };

      const epicRecords = [{ _id: '123' }, { _id: '456' }];

      await epicDataSource.processRecords(epicRecords);

      expect(epicDataSource.getRecordProject).toHaveBeenNthCalledWith(1, { _id: '123' });
      expect(epicDataSource.getRecordProject).toHaveBeenNthCalledWith(2, { _id: '456' });

      expect(mockEpicInspections.transformRecord).toHaveBeenNthCalledWith(1, {
        _id: '123',
        project: { name: '123' }
      });
      expect(mockEpicInspections.transformRecord).toHaveBeenNthCalledWith(2, {
        _id: '456',
        project: { name: '456' }
      });

      expect(mockEpicInspections.saveRecord).toHaveBeenNthCalledWith(1, {
        _id: '123',
        project: { name: '123' },
        transformed: true
      });
      expect(mockEpicInspections.saveRecord).toHaveBeenNthCalledWith(2, {
        _id: '456',
        project: { name: '456' },
        transformed: true
      });

      // itemTotal is 0 here because it is set elsewhere in the class
      expect(epicDataSource.status).toEqual({ itemTotal: 0, itemsProcessed: 2 });
    });

    it('continues processing records even if one record fails and throws an exception', async () => {
      // mock epic inspection utils
      const mockEpicInspections = {
        transformRecord: jest.fn(record => {
          // force an error if _id is '123'
          if (record._id === '123') {
            throw Error('an unexpected error!');
          }

          return { ...record, transformed: true };
        }),
        saveRecord: jest.fn(() => 'saved!')
      };

      const epicDataSource = new EpicDataSource('inspection');

      epicDataSource.getRecordProject = jest.fn(record => {
        return { name: record._id };
      });

      // return our mock utils instead of the real ones.
      epicDataSource.getRecordTypeUtils = () => {
        return mockEpicInspections;
      };

      const epicRecords = [{ _id: '123' }, { _id: '456' }];

      await epicDataSource.processRecords(epicRecords);

      expect(epicDataSource.getRecordProject).toHaveBeenNthCalledWith(1, { _id: '123' });
      expect(epicDataSource.getRecordProject).toHaveBeenNthCalledWith(2, { _id: '456' });

      expect(mockEpicInspections.transformRecord).toHaveBeenNthCalledWith(1, { _id: '123', project: { name: '123' } });
      expect(mockEpicInspections.transformRecord).toHaveBeenNthCalledWith(2, { _id: '456', project: { name: '456' } });

      // saveRecord is not called on _id=123 because it threw an error during the transformRecord call
      expect(mockEpicInspections.saveRecord).toHaveBeenNthCalledWith(1, {
        _id: '456',
        project: { name: '456' },
        transformed: true
      });

      // itemTotal is 0 here because it is set elsewhere in the class
      expect(epicDataSource.status).toEqual({ itemTotal: 0, itemsProcessed: 1 });
    });
  });

  describe('getHostname', () => {
    it('returns hostname for epic urls', () => {
      const epicDataSource = new EpicDataSource('order');
      const pathName = epicDataSource.getHostname();
      expect(pathName).toEqual(process.env.EPIC_API_HOSTNAME || 'eagle-prod.pathfinder.gov.bc.ca');
    });
  });

  describe('getEpicSearchPathname', () => {
    it('returns epic search pathname', () => {
      const epicDataSource = new EpicDataSource('order');
      const pathName = epicDataSource.getEpicSearchPathname();
      expect(pathName).toEqual(process.env.EPIC_API_SEARCH_PATHNAME || '/api/public/search');
    });
  });

  describe('getEpicProjectPathname', () => {
    it('returns epic project pathname', () => {
      const epicDataSource = new EpicDataSource('order');
      const pathName = epicDataSource.getEpicProjectPathname('123456');
      expect(pathName).toEqual(`${process.env.EPIC_API_PROJECT_PATHNAME || '/api/project'}/123456`);
    });
  });

  describe('getBaseParams', () => {
    it('returns base params', () => {
      const epicDataSource = new EpicDataSource('order');
      const baseParams = epicDataSource.getBaseParams('123', '456', 22, 7);
      expect(baseParams).toEqual({
        dataset: 'Document',
        populate: false,
        pageSize: 22,
        pageNum: 7,
        and: { type: '123', milestone: '456' }
      });
    });
  });

  describe('getIntegrationUrl', () => {
    it('builds and returns an https url', () => {
      const epicDataSource = new EpicDataSource('order');
      const url = epicDataSource.getIntegrationUrl('www.google.com', '/some/path/to/stuff', {
        param1: 1,
        param2: 'hello'
      });
      expect(url).toEqual(new URL('/some/path/to/stuff?param1=1&param2=hello', 'https://www.google.com'));
    });
  });

  describe('getRecordTypeUtils', () => {
    it('throws an error if the type utils cannot be found', () => {
      const epicDataSource = new EpicDataSource('order');
      epicDataSource.type = 'notAValidType';
      expect(() => epicDataSource.getRecordTypeUtils()).toThrow(
        new Error(`getTypeUtil - failed to find utils for type: ${epicDataSource.type}`)
      );
    });

    it('returns typeUtils for type order', () => {
      const epicDataSource = new EpicDataSource('order');
      const typeUtils = epicDataSource.getRecordTypeUtils();
      expect(typeUtils).toBeInstanceOf(EpicOrders);
    });

    it('returns typeUtils for type inspection', () => {
      const epicDataSource = new EpicDataSource('inspection');
      const typeUtils = epicDataSource.getRecordTypeUtils();
      expect(typeUtils).toBeInstanceOf(EpicInspections);
    });
  });

  describe('getRecordTypeId', () => {
    it('throws an error if the response array is null', async () => {
      // create mock response
      const mockResponse = null;

      // spy on integration-utils to return mock response
      jest.spyOn(require('../integration-utils'), 'getRecords').mockImplementation(() => {
        return mockResponse;
      });

      const epicDataSource = new EpicDataSource('inspection');
      await expect(epicDataSource.getRecordTypeId()).rejects.toThrow(
        new Error('getTypeUtil - failed to fetch List dataset.')
      );
    });

    it('throws an error if the response array is empty', async () => {
      // create mock response
      const mockResponse = [];

      // spy on integration-utils to return mock response
      jest.spyOn(require('../integration-utils'), 'getRecords').mockImplementation(() => {
        return mockResponse;
      });

      const epicDataSource = new EpicDataSource('inspection');
      await expect(epicDataSource.getRecordTypeId()).rejects.toThrow(
        new Error('getTypeUtil - failed to fetch List dataset.')
      );
    });

    it('throws an error if the response array element does not contain searchResults', async () => {
      // create mock response
      const mockResponse = [{}];

      // spy on integration-utils to return mock response
      jest.spyOn(require('../integration-utils'), 'getRecords').mockImplementation(() => {
        return mockResponse;
      });

      const epicDataSource = new EpicDataSource('inspection');
      await expect(epicDataSource.getRecordTypeId()).rejects.toThrow(
        new Error('getTypeUtil - failed to fetch List dataset.')
      );
    });

    it('throws an error if the response does not contain a doctype element', async () => {
      // create mock response
      const mockResponse = [{ searchResults: [{ type: 'notDocType', name: EPIC_TYPE.inspection.epicType }] }];

      // spy on integration-utils to return mock response
      jest.spyOn(require('../integration-utils'), 'getRecords').mockImplementation(() => {
        return mockResponse;
      });

      const epicDataSource = new EpicDataSource('inspection');
      await expect(epicDataSource.getRecordTypeId()).rejects.toThrow(
        new Error(`getTypeUtil - failed to find type _id for epic type: ${EPIC_TYPE.inspection.epicType}`)
      );
    });

    it('throws an error if the response does not contain a doctype element with matching epic type', async () => {
      // create mock response
      const mockResponse = [{ searchResults: [{ type: 'doctype', name: 'notInspectionType' }] }];

      // spy on integration-utils to return mock response
      jest.spyOn(require('../integration-utils'), 'getRecords').mockImplementation(() => {
        return mockResponse;
      });

      const epicDataSource = new EpicDataSource('inspection');
      await expect(epicDataSource.getRecordTypeId()).rejects.toThrow(
        new Error(`getTypeUtil - failed to find type _id for epic type: ${EPIC_TYPE.inspection.epicType}`)
      );
    });

    it('returns the _id of the doctype element with matching epic type', async () => {
      // create mock response
      const mockResponse = [{ searchResults: [{ type: 'doctype', name: EPIC_TYPE.inspection.epicType, _id: '123' }] }];

      // spy on integration-utils to return mock response
      jest.spyOn(require('../integration-utils'), 'getRecords').mockImplementation(() => {
        return mockResponse;
      });

      const epicDataSource = new EpicDataSource('inspection');
      const id = await epicDataSource.getRecordTypeId();

      expect(id).toEqual('123');
    });
  });
});
