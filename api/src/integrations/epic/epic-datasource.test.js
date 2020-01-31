const EpicDataSource = require('./epic-datasource');

describe('EpicDataSource', () => {
  describe('constructor', () => {
    it('sets params', () => {
      const epicDataSource = new EpicDataSource(null, { params: 1 });
      expect(epicDataSource.params).toEqual({ params: 1 });
    });

    it('sets default params if not provided', () => {
      const epicDataSource = new EpicDataSource();
      expect(epicDataSource.params).toEqual({});
    });

    it('sets auth_payload', () => {
      const epicDataSource = new EpicDataSource({ auth_payload: 'some payload' }, { params: 1 });
      expect(epicDataSource.auth_payload).toEqual({ auth_payload: 'some payload' });
    });

    it('sets default status fields', () => {
      const epicDataSource = new EpicDataSource();
      expect(epicDataSource.status).toEqual({ itemsProcessed: 0, itemTotal: 0, typeStatus: [] });
    });
  });

  describe('_updateRecords', () => {
    it('catches any thrown exceptions and returns gracefully', async () => {
      // mock function to throw an error
      const mockUpdateRecordType = jest.fn(() => {
        throw Error('unexpected error!');
      });

      const epicDataSource = new EpicDataSource();

      epicDataSource.updateRecordType = mockUpdateRecordType;

      const status = await epicDataSource.updateRecords();

      expect(status).toEqual({
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
      const epicDataSource = new EpicDataSource();

      // calling updateRecordType with null parameter will cause an exception
      const recordTypeStatus = await epicDataSource.updateRecordType();

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

      const epicDataSource = new EpicDataSource();

      // mock EpicDataSource functions called by updateRecordType()
      epicDataSource.getBaseParams = jest.fn();
      epicDataSource.getIntegrationUrl = jest.fn(() => {
        return { href: '' };
      });
      epicDataSource.getHostname = jest.fn();
      epicDataSource.getEpicSearchPathname = jest.fn();
      epicDataSource.getEpicProjectPathname = jest.fn();
      epicDataSource.processRecords = jest.fn();

      const recordType = { type: { typeId: '123' }, milestone: { milestoneId: '123' }, getUtil: jest.fn() };

      const recordTypeStatus = await epicDataSource.updateRecordType(recordType);

      expect(recordType.getUtil).not.toHaveBeenCalled();
      expect(epicDataSource.processRecords).not.toHaveBeenCalled();

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

      const epicDataSource = new EpicDataSource(null, { param1: 1 });

      // mock EpicDataSource functions called by updateRecordType()
      epicDataSource.getBaseParams = jest.fn(() => {
        return { baseParams: 1 };
      });
      epicDataSource.getIntegrationUrl = jest.fn(() => {
        return { href: 'url' };
      });
      epicDataSource.getHostname = jest.fn(() => {
        return 'hostname';
      });
      epicDataSource.getEpicSearchPathname = jest.fn(() => {
        return 'searchPathname';
      });
      epicDataSource.processRecords = jest.fn(() => {
        return {
          processStatus: 'someStatus'
        };
      });

      const recordType = { type: { typeId: '111' }, milestone: { milestoneId: '222' }, getUtil: jest.fn(() => 'utils') };

      const status = await epicDataSource.updateRecordType(recordType);

      expect(epicDataSource.getBaseParams).toHaveBeenCalledWith('111', '222', Number.MAX_SAFE_INTEGER, 0);

      expect(epicDataSource.getIntegrationUrl).toHaveBeenCalledWith('hostname', 'searchPathname', {
        param1: 1,
        baseParams: 1
      });

      expect(recordType.getUtil).toHaveBeenCalledTimes(1);

      expect(epicDataSource.processRecords).toHaveBeenCalledWith('utils', [
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
      const epicDataSource = new EpicDataSource();

      await expect(epicDataSource.processRecords(null, [])).rejects.toThrow(
        new Error('processRecords - required recordTypeUtils is null.')
      );
    });

    it('throws an error if epicRecords is null', async () => {
      const epicDataSource = new EpicDataSource();

      await expect(epicDataSource.processRecords({}, null)).rejects.toThrow(
        new Error('processRecords - required epicRecords is null.')
      );
    });

    it('transforms, saves, and updates the status for each epic record', async () => {
      const epicDataSource = new EpicDataSource();

      epicDataSource.getRecordProject = jest.fn(record => {
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

      const recordTypeStatus = await epicDataSource.processRecords(recordTypeUtils, epicRecords);

      expect(epicDataSource.getRecordProject).toHaveBeenNthCalledWith(1, { _id: '123' });
      expect(epicDataSource.getRecordProject).toHaveBeenNthCalledWith(2, { _id: '456' });

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
      const epicDataSource = new EpicDataSource();

      epicDataSource.getRecordProject = jest.fn(record => {
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

      const recordTypeStatus = await epicDataSource.processRecords(recordTypeUtils, epicRecords);

      expect(epicDataSource.getRecordProject).toHaveBeenNthCalledWith(1, { _id: '123' });
      expect(epicDataSource.getRecordProject).toHaveBeenNthCalledWith(2, { _id: '456' });

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
      const epicDataSource = new EpicDataSource();
      const pathName = epicDataSource.getHostname();
      expect(pathName).toEqual(process.env.EPIC_API_HOSTNAME || 'eagle-prod.pathfinder.gov.bc.ca');
    });
  });

  describe('getEpicSearchPathname', () => {
    it('returns epic search pathname', () => {
      const epicDataSource = new EpicDataSource();
      const pathName = epicDataSource.getEpicSearchPathname();
      expect(pathName).toEqual(process.env.EPIC_API_SEARCH_PATHNAME || '/api/public/search');
    });
  });

  describe('getEpicProjectPathname', () => {
    it('returns epic project pathname', () => {
      const epicDataSource = new EpicDataSource();
      const pathName = epicDataSource.getEpicProjectPathname('123456');
      expect(pathName).toEqual(`${process.env.EPIC_API_PROJECT_PATHNAME || '/api/project'}/123456`);
    });
  });

  describe('getBaseParams', () => {
    it('returns base params', () => {
      const epicDataSource = new EpicDataSource();
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
      const epicDataSource = new EpicDataSource();
      const url = epicDataSource.getIntegrationUrl('www.google.com', '/some/path/to/stuff', {
        param1: 1,
        param2: 'hello'
      });
      expect(url).toEqual(new URL('/some/path/to/stuff?param1=1&param2=hello', 'https://www.google.com'));
    });
  });
});
