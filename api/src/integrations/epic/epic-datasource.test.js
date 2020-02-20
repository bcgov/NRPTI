const EpicDataSource = require('./epic-datasource');

fdescribe('EpicDataSource', () => {
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
      expect(epicDataSource.status).toEqual({
        itemsProcessed: 0,
        itemTotal: 0,
        typeStatus: [],
        individualRecordStatus: []
      });
    });
  });

  describe('updateRecords', () => {
    it('catches any thrown exceptions and returns gracefully', async () => {
      // mock function to throw an error
      const mockUpdateRecordType = jest.fn(() => {
        throw Error('unexpected error!');
      });

      const epicDataSource = new EpicDataSource();

      epicDataSource.updateRecordType = mockUpdateRecordType;

      const status = await epicDataSource.updateRecords();

      expect(status).toEqual({
        message: 'updateRecords - unexpected error',
        error: 'unexpected error!',
        itemsProcessed: 0,
        itemTotal: 0,
        typeStatus: [],
        individualRecordStatus: []
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
        error: 'updateRecordType - required recordType is null.',
        type: undefined,
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
      epicDataSource.processRecord = jest.fn();

      const recordType = { type: { typeId: '123' }, milestone: { milestoneId: '123' }, getUtil: jest.fn() };

      const recordTypeStatus = await epicDataSource.updateRecordType(recordType);

      expect(recordType.getUtil).not.toHaveBeenCalled();
      expect(epicDataSource.processRecord).not.toHaveBeenCalled();

      expect(recordTypeStatus).toEqual({
        message: 'updateRecordType - no records found',
        type: recordType,
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
      epicDataSource.processRecord = jest.fn(() => {});

      const recordType = {
        type: { typeId: '111' },
        milestone: { milestoneId: '222' },
        getUtil: jest.fn(() => 'utils')
      };

      const status = await epicDataSource.updateRecordType(recordType);

      expect(epicDataSource.getBaseParams).toHaveBeenCalledWith('111', '222', Number.MAX_SAFE_INTEGER, 0);

      expect(epicDataSource.getIntegrationUrl).toHaveBeenCalledWith('hostname', 'searchPathname', {
        param1: 1,
        baseParams: 1
      });

      expect(recordType.getUtil).toHaveBeenCalledTimes(1);

      expect(epicDataSource.processRecord).toHaveBeenNthCalledWith(1, 'utils', { _id: '123' });
      expect(epicDataSource.processRecord).toHaveBeenNthCalledWith(2, 'utils', { _id: '456' });
      expect(epicDataSource.processRecord).toHaveBeenNthCalledWith(3, 'utils', { _id: '789' });

      expect(status).toEqual({
        type: recordType,
        itemTotal: 3,
        url: 'url',
        epicMeta: 'meta!'
      });
    });
  });

  describe('processRecord', () => {
    it('throws an error if recordTypeUtils is null', async () => {
      const epicDataSource = new EpicDataSource();

      await epicDataSource.processRecord(null, { _id: '333' });

      expect(epicDataSource.status.individualRecordStatus[0]).toEqual({
        epicId: '333',
        message: 'processRecord - unexpected error',
        error: 'processRecord - required recordTypeUtils is null.'
      });
    });

    it('throws an error if epicRecords is null', async () => {
      const epicDataSource = new EpicDataSource();

      await expect(epicDataSource.processRecord({}, null));

      expect(epicDataSource.status.individualRecordStatus[0]).toEqual({
        epicId: null,
        message: 'processRecord - unexpected error',
        error: 'processRecord - required epicRecord is null.'
      });
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

      const epicRecord = { _id: '123' };

      await epicDataSource.processRecord(recordTypeUtils, epicRecord);

      expect(epicDataSource.getRecordProject).toHaveBeenCalledWith({ _id: '123' });

      expect(recordTypeUtils.transformRecord).toHaveBeenCalledWith({
        _id: '123',
        project: { name: '123' }
      });

      expect(recordTypeUtils.saveRecord).toHaveBeenCalledWith({
        _id: '123',
        project: { name: '123' },
        transformed: true
      });

      expect(epicDataSource.status.itemsProcessed).toEqual(1);
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
