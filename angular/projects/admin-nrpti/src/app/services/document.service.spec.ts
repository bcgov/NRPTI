import { TestBed } from '@angular/core/testing';

import { DocumentService } from './document.service';
import { ApiService } from './api.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ConfigService } from 'nrpti-angular-components';

describe('DocumentService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DocumentService, ConfigService, ApiService]
    });
  });

  it('should be created', () => {
    const service = TestBed.get(DocumentService);

    expect(service).toBeTruthy();
  });
});
