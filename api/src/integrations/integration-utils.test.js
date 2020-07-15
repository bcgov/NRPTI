const IntegrationUtils = require('./integration-utils');

describe('IntegrationUtils', () => {
  describe('getRecords', () => {
    it('throws error if an unexpected error occurs', async () => {
      const mockAxios = jest.spyOn(require('axios'), 'get').mockImplementation(() => {
        throw Error('unexpected error!');
      });

      await expect(IntegrationUtils.getRecords({ href: 'url' })).rejects.toThrow(
        new Error(`getRecords - error: unexpected error!.`)
      );
      expect(mockAxios).toHaveBeenCalledWith('url', undefined);
    });

    it('throws error if the response is null', async () => {
      const mockAxios = jest.spyOn(require('axios'), 'get').mockImplementation(() => {
        return null;
      });

      await expect(IntegrationUtils.getRecords({ href: 'url' })).rejects.toThrow(
        new Error(`getRecords - returned null response.`)
      );
      expect(mockAxios).toHaveBeenCalledWith('url', undefined);
    });

    it('throws error if the response status is not 200', async () => {
      const mockAxios = jest.spyOn(require('axios'), 'get').mockImplementation(() => {
        return { status: 999 };
      });

      await expect(IntegrationUtils.getRecords({ href: 'url' })).rejects.toThrow(
        new Error(`getRecords - returned non-200 status: 999.`)
      );
      expect(mockAxios).toHaveBeenCalledWith('url', undefined);
    });

    it('returns response.data', async () => {
      const mockAxios = jest.spyOn(require('axios'), 'get').mockImplementation(() => {
        return { status: 200, data: [{ value: 1 }] };
      });

      const data = await IntegrationUtils.getRecords({ href: 'url' });

      expect(data).toEqual([{ value: 1 }]);
      expect(mockAxios).toHaveBeenCalledWith('url', undefined);
    });
  });

  describe('getIntegrationUrl', () => {
    it('builds and returns a URL', () => {
      const url = IntegrationUtils.getIntegrationUrl('https://www.google.com', '/some/path/to/stuff', {
        param1: 1,
        param2: 'hello'
      });
      expect(url).toEqual(new URL('/some/path/to/stuff?param1=1&param2=hello', 'https://www.google.com'));
    });
  });

  describe('getAuthHeader', () => {
    const expectedHeader = {
      headers: {
        Authorization: 'Bearer testing'
      }
    };

    const header = IntegrationUtils.getAuthHeader('testing');

    expect(header).toEqual(expectedHeader);
  });
});
