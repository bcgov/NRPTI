const DataSource = require('./datasource');

describe('DataSource', () => {
  describe('constructor', () => {
    it('sets params', () => {
      const dataSource = new DataSource(null, { params: 1 });
      expect(dataSource.params).toEqual({ params: 1 });
    });

    it('sets default params if not provided', () => {
      const dataSource = new DataSource();
      expect(dataSource.params).toEqual({});
    });

    it('sets auth_payload', () => {
      const dataSource = new DataSource({ auth_payload: 'some payload' }, { params: 1 });
      expect(dataSource.auth_payload).toEqual({ auth_payload: 'some payload' });
    });

    it('sets default status fields', () => {
      const dataSource = new DataSource();
      expect(dataSource.status).toEqual({ itemsProcessed: 0, itemTotal: 0, typeStatus: [] });
    });
  });

  describe('updateRecords', () => {
    it('catches any thrown exceptions and returns gracefully', async () => {
      // mock function to throw an error
      const mock_updateRecords = jest.fn(() => {
        throw Error('unexpected error!');
      });

      const dataSource = new DataSource();

      dataSource._updateRecords = mock_updateRecords;

      const status = await dataSource.updateRecords();

      expect(status).toEqual({
        message: 'updateRecords - unexpected error',
        error: 'unexpected error!',
        itemsProcessed: 0,
        itemTotal: 0,
        typeStatus: []
      });
    });
  });

  describe('_updateRecords', () => {
    it('catches any thrown exceptions and returns gracefully', async () => {
      // mock function to throw an error
      const mockUpdateRecordType = jest.fn(() => {
        throw Error('unexpected error!');
      });

      const dataSource = new DataSource();

      dataSource.updateRecordType = mockUpdateRecordType;

      await dataSource._updateRecords([{}]);

      expect(dataSource.status).toEqual({
        message: '_updateRecords - unexpected error',
        error: 'unexpected error!',
        itemsProcessed: 0,
        itemTotal: 0,
        typeStatus: []
      });
    });
  });

  describe('updateRecordType', () => {
    it('catches any thrown exceptions and returns gracefully', async () => {
      const dataSource = new DataSource();

      // calling updateRecordType with null parameter will cause an exception
      const recordTypeStatus = await dataSource.updateRecordType();

      expect(recordTypeStatus).toEqual({
        message: 'updateRecordType - unexpected error',
        error: "Cannot read property 'type' of undefined",
        itemsProcessed: 0,
        itemTotal: 0,
        url: ''
      });
    });

    it('returns early if no epic records are found', async () => {
      // mock utils called by updateRecordType()
      jest.spyOn(require('../integration-utils'), 'getRecords').mockImplementation(() => {
        return Promise.resolve([{ searchResults: [], meta: 'meta!' }]);
      });

      const dataSource = new DataSource();

      // mock DataSource functions called by updateRecordType()
      dataSource.getBaseParams = jest.fn();
      dataSource.getIntegrationUrl = jest.fn(() => {
        return { href: '' };
      });
      dataSource.getHostname = jest.fn();
      dataSource.getSearchPathname = jest.fn();
      dataSource.getProjectPathname = jest.fn();
      dataSource.processRecords = jest.fn();

      const recordType = { type: { typeId: '123' }, milestone: { milestoneId: '123' }, getUtil: jest.fn() };

      const recordTypeStatus = await dataSource.updateRecordType(recordType);

      expect(recordType.getUtil).not.toHaveBeenCalled();
      expect(dataSource.processRecords).not.toHaveBeenCalled();

      expect(recordTypeStatus).toEqual({
        message: 'updateRecordType - no records found',
        itemsProcessed: 0,
        itemTotal: 0,
        url: ''
      });
    });

    it('calls all functions necessary to update epic records for the given type', async () => {
      // mock utils called by updateRecordType()
      const mockResponse = [
        {
          searchResults: [{ _id: '123' }, { _id: '456' }, { _id: '789' }],
          meta: 'meta!'
        }
      ];
      jest.spyOn(require('../integration-utils'), 'getRecords').mockImplementation(() => {
        return Promise.resolve(mockResponse);
      });

      const dataSource = new DataSource(null, { param1: 1 });

      // mock DataSource functions called by updateRecordType()
      dataSource.getBaseParams = jest.fn(() => {
        return { baseParams: 1 };
      });
      dataSource.getIntegrationUrl = jest.fn(() => {
        return { href: 'url' };
      });
      dataSource.getHostname = jest.fn(() => {
        return 'hostname';
      });
      dataSource.getSearchPathname = jest.fn(() => {
        return 'searchPathname';
      });
      dataSource.processRecords = jest.fn(() => {
        return {
          processStatus: 'someStatus'
        };
      });

      const recordType = { type: { typeId: '111' }, milestone: { milestoneId: '222' }, getUtil: jest.fn(() => 'utils') };

      const status = await dataSource.updateRecordType(recordType);

      expect(dataSource.getBaseParams).toHaveBeenCalledWith('111', '222', Number.MAX_SAFE_INTEGER, 0);

      expect(dataSource.getIntegrationUrl).toHaveBeenCalledWith('hostname', 'searchPathname', {
        param1: 1,
        baseParams: 1
      });

      expect(recordType.getUtil).toHaveBeenCalledTimes(1);

      expect(dataSource.processRecords).toHaveBeenCalledWith('utils', [
        { _id: '123' },
        { _id: '456' },
        { _id: '789' }
      ]);

      expect(status).toEqual({
        itemsProcessed: 0,
        itemTotal: 3,
        url: 'url',
        epicMeta: 'meta!',
        processStatus: 'someStatus'
      });
    });
  });

  describe('processRecords', () => {
    it('throws an error if recordTypeUtils is null', async () => {
      const dataSource = new DataSource();

      await expect(dataSource.processRecords(null, [])).rejects.toThrow(
        new Error('processRecords - required recordTypeUtils is null.')
      );
    });

    it('throws an error if epicRecords is null', async () => {
      const dataSource = new DataSource();

      await expect(dataSource.processRecords({}, null)).rejects.toThrow(
        new Error('processRecords - required epicRecords is null.')
      );
    });

    it('transforms, saves, and updates the status for each epic record', async () => {
      const dataSource = new DataSource();

      dataSource.getRecordProject = jest.fn(record => {
        return { name: record._id };
      });

      // mock record type utils
      const recordTypeUtils = {
        transformRecord: jest.fn(record => {
          return { ...record, transformed: true };
        }),
        saveRecord: jest.fn(record => {
          return 'saved!';
        })
      };

      const epicRecords = [{ _id: '123' }, { _id: '456' }];

      const recordTypeStatus = await dataSource.processRecords(recordTypeUtils, epicRecords);

      expect(dataSource.getRecordProject).toHaveBeenNthCalledWith(1, { _id: '123' });
      expect(dataSource.getRecordProject).toHaveBeenNthCalledWith(2, { _id: '456' });

      expect(recordTypeUtils.transformRecord).toHaveBeenNthCalledWith(1, {
        _id: '123',
        project: { name: '123' }
      });
      expect(recordTypeUtils.transformRecord).toHaveBeenNthCalledWith(2, {
        _id: '456',
        project: { name: '456' }
      });

      expect(recordTypeUtils.saveRecord).toHaveBeenNthCalledWith(1, {
        _id: '123',
        project: { name: '123' },
        transformed: true
      });
      expect(recordTypeUtils.saveRecord).toHaveBeenNthCalledWith(2, {
        _id: '456',
        project: { name: '456' },
        transformed: true
      });

      expect(recordTypeStatus).toEqual({ itemsProcessed: 2 });
    });

    it('continues processing records even if one record fails and throws an exception', async () => {
      const dataSource = new DataSource();

      dataSource.getRecordProject = jest.fn(record => {
        return { name: record._id };
      });

      // mock record type utils
      const recordTypeUtils = {
        transformRecord: jest.fn(record => {
          // force an error if _id is '123'
          if (record._id === '123') {
            throw Error('an unexpected error!');
          }

          return { ...record, transformed: true };
        }),
        saveRecord: jest.fn(() => 'saved!')
      };

      const epicRecords = [{ _id: '123' }, { _id: '456' }];

      const recordTypeStatus = await dataSource.processRecords(recordTypeUtils, epicRecords);

      expect(dataSource.getRecordProject).toHaveBeenNthCalledWith(1, { _id: '123' });
      expect(dataSource.getRecordProject).toHaveBeenNthCalledWith(2, { _id: '456' });

      expect(recordTypeUtils.transformRecord).toHaveBeenNthCalledWith(1, { _id: '123', project: { name: '123' } });
      expect(recordTypeUtils.transformRecord).toHaveBeenNthCalledWith(2, { _id: '456', project: { name: '456' } });

      // saveRecord is not called on _id=123 because it threw an error during the transformRecord call
      expect(recordTypeUtils.saveRecord).toHaveBeenNthCalledWith(1, {
        _id: '456',
        project: { name: '456' },
        transformed: true
      });

      // itemTotal is 0 here because it is set elsewhere in the class
      expect(recordTypeStatus).toEqual({ itemsProcessed: 1 });
    });
  });

  describe('getHostname', () => {
    it('returns hostname for epic urls', () => {
      const dataSource = new DataSource();
      const pathName = dataSource.getHostname();
      expect(pathName).toEqual(process.env.EPIC_API_HOSTNAME || 'eagle-prod.pathfinder.gov.bc.ca');
    });
  });

  describe('getSearchPathname', () => {
    it('returns epic search pathname', () => {
      const dataSource = new DataSource();
      const pathName = dataSource.getSearchPathname();
      expect(pathName).toEqual(process.env.EPIC_API_SEARCH_PATHNAME || '/api/public/search');
    });
  });

  describe('getProjectPathname', () => {
    it('returns epic project pathname', () => {
      const dataSource = new DataSource();
      const pathName = dataSource.getProjectPathname('123456');
      expect(pathName).toEqual(`${process.env.EPIC_API_PROJECT_PATHNAME || '/api/project'}/123456`);
    });
  });

  describe('getBaseParams', () => {
    it('returns base params', () => {
      const dataSource = new DataSource();
      const baseParams = dataSource.getBaseParams('123', '456', 22, 7);
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
      const dataSource = new DataSource();
      const url = dataSource.getIntegrationUrl('www.google.com', '/some/path/to/stuff', {
        param1: 1,
        param2: 'hello'
      });
      expect(url).toEqual(new URL('/some/path/to/stuff?param1=1&param2=hello', 'https://www.google.com'));
    });
  });
});
