import { TableTemplateUtils } from './table-template-utils';

describe('TableTemplateUtils', () => {
  const mockPlatformLocation = jasmine.createSpyObj('PlatformLocation', ['getBaseHrefFromDOM']);
  mockPlatformLocation.getBaseHrefFromDOM.and.returnValue('http://test.com/');

  const mockRouter = jasmine.createSpyObj('Router', ['navigate', 'url']);
  mockRouter.navigate.and.returnValue('navigated');
  mockRouter.url = '/test;abc';

  describe('updateUrl', () => {
    const tableTemplateUtils = new TableTemplateUtils(mockPlatformLocation, mockRouter);
    it('throws error if tableObject is null or undefined.', () => {
      expect(() => tableTemplateUtils.updateUrl(null)).toThrow(new Error('Navigation Object cannot be null.'));
    });
  });

  describe('getBaseUrl', () => {
    const tableTemplateUtils = new TableTemplateUtils(mockPlatformLocation, mockRouter);
    it('returns base url without params', () => {
      const baseUrl = tableTemplateUtils.getBaseUrl();
      expect(baseUrl).toEqual('http://test.com/test');
    });
  });

  describe('setPaginationInUrl', () => {
    const tableTemplateUtils = new TableTemplateUtils(mockPlatformLocation, mockRouter);
    it('returns url with current page and page size as params', () => {
      const url = tableTemplateUtils.setPaginationInUrl('http://test.com/test', 1, 10);
      expect(url).toEqual('http://test.com/test;currentPage=1;pageSize=10');
    });
  });

  describe('setKeywordsInUrl', () => {
    const tableTemplateUtils = new TableTemplateUtils(mockPlatformLocation, mockRouter);
    it('returns url with keywords as params', () => {
      const url = tableTemplateUtils.setKeywordsInUrl('http://test.com/test', 'testkeyword');
      expect(url).toEqual('http://test.com/test;keywords=testkeyword');
    });
    it('returns url without keywords as params', () => {
      const url = tableTemplateUtils.setKeywordsInUrl('http://test.com/test', '');
      expect(url).toEqual('http://test.com/test');
    });
  });

  describe('setSortByInUrl', () => {
    const tableTemplateUtils = new TableTemplateUtils(mockPlatformLocation, mockRouter);
    it('returns url with sort by as params', () => {
      const url = tableTemplateUtils.setSortByInUrl('http://test.com/test', '+description');
      expect(url).toEqual('http://test.com/test;sortBy=+description');
    });
    it('returns url without sort by as params', () => {
      const url = tableTemplateUtils.setSortByInUrl('http://test.com/test', '');
      expect(url).toEqual('http://test.com/test');
    });
  });

  describe('setFilterInUrl', () => {
    const tableTemplateUtils = new TableTemplateUtils(mockPlatformLocation, mockRouter);
    it('returns url with filter as params', () => {
      const url = tableTemplateUtils.setFilterInUrl('http://test.com/test', { foo: 'bar' });
      expect(url).toEqual('http://test.com/test;foo=bar');
    });
    it('returns url with multiple filters as params', () => {
      const url = tableTemplateUtils.setFilterInUrl('http://test.com/test', { foo1: 'bar1', foo2: 'bar2' });
      expect(url).toEqual('http://test.com/test;foo1=bar1;foo2=bar2');
    });
    it('returns url without filter as params', () => {
      const url = tableTemplateUtils.setFilterInUrl('http://test.com/test', {});
      expect(url).toEqual('http://test.com/test');
    });
  });
});
