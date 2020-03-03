const NrisDataSource = require('./datasource');

describe('NrisDataSource', () => {
  describe('constructor', () => {
    it('sets params', () => {
      const dataSource = new NrisDataSource(null, { params: 1 });
      expect(dataSource.params).toEqual({ params: 1 });
    });

    it('sets default params if not provided', () => {
      const dataSource = new NrisDataSource();
      expect(dataSource.params).toEqual({});
    });

    it('sets auth_payload', () => {
      const dataSource = new NrisDataSource({ auth_payload: 'some payload' }, { params: 1 });
      expect(dataSource.auth_payload).toEqual({ auth_payload: 'some payload' });
    });

    it('sets default status fields', () => {
      const dataSource = new NrisDataSource();
      expect(dataSource).toEqual({ auth_payload: undefined, params: {} });
    });
  });
});
