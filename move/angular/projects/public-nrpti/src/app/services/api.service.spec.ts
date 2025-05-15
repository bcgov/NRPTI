import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ApiService } from './api.service';
import { ConfigService } from 'nrpti-angular-components';

describe('ApiService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ApiService, ConfigService],
      imports: [HttpClientTestingModule]
    });
  });

  it('should be created', () => {
    const service = TestBed.get(ApiService);
    expect(service).toBeTruthy();
  });
});
