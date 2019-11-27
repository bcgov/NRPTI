import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ApiService, IRecordQueryParamSet } from './api.service';

describe('ApiService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ApiService],
      imports: [HttpClientTestingModule]
    });
  });

  it('should be created', () => {
    const service = TestBed.get(ApiService);
    expect(service).toBeTruthy();
  });

  describe('buildRecordQueryParametersString', () => {
    let service;

    beforeEach(() => {
      service = TestBed.get(ApiService);
    });

    it('given undefined query params returns empty string', () => {
      const result = service.buildRecordQueryParametersString(undefined);

      expect(result).toEqual('');
    });

    it('given null query params returns empty string', () => {
      const result = service.buildRecordQueryParametersString(null);

      expect(result).toEqual('');
    });

    it('given all query params', () => {
      const queryParams: IRecordQueryParamSet = {
        pageNum: 0,
        pageSize: 30,
        sortBy: 'status',
        isDeleted: false
      };

      const result = service.buildRecordQueryParametersString(queryParams);

      const expectedResult = 'isDeleted=false&' + 'sortBy=status&' + 'pageNum=0&' + 'pageSize=30';

      expect(result).toEqual(expectedResult);
    });
  });
});
