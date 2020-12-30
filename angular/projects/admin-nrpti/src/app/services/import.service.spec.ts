import { TestBed } from '@angular/core/testing';

import { ImportService } from './import.service';
import { ConfigService } from 'nrpti-angular-components';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FactoryService } from './factory.service';

describe('ImportService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ConfigService, FactoryService]
    });
  });

  it('should be created', () => {
    const service: ImportService = TestBed.get(ImportService);
    expect(service).toBeTruthy();
  });
});
