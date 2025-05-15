import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActService } from './acts.service';
import { ConfigService } from 'nrpti-angular-components';

describe('ApiService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ActService, ConfigService],
      imports: [HttpClientTestingModule]
    });
  });

  it('should be created', () => {
    const service = TestBed.get(ActService);
    expect(service).toBeTruthy();
  });
});
