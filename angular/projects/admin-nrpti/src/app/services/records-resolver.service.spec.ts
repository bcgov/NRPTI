import { TestBed, async } from '@angular/core/testing';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FactoryService } from './factory.service';
import { RecordsResolverService } from './records-resolver.service';
import { Record } from '../models/record';
import { of, Observable } from 'rxjs';

describe('RecordsResolverService', () => {
  const mockFactoryService = jasmine.createSpyObj('FactoryService', ['getRecord']);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: FactoryService, useValue: mockFactoryService }]
    });
  });

  it('should be created', () => {
    const service = TestBed.get(RecordsResolverService);
    expect(service).toBeTruthy();
  });

  describe('getRecord', () => {
    it('should call factoryService.getRecord', async(() => {
      const service = TestBed.get(RecordsResolverService);

      const expectedRecord = new Record({ _id: '7' });

      const factoryServiceMock = TestBed.get(FactoryService);
      factoryServiceMock.getRecord.and.returnValue(of(expectedRecord));

      const activatedRouteSnapshotStub = { paramMap: { get: () => 7 } };

      const result: Observable<Record> = service.resolve(activatedRouteSnapshotStub);
      result.subscribe(actualRecord => {
        expect(actualRecord._id).toEqual('7');
      });
    }));
  });
});
