import { TestBed } from '@angular/core/testing';

import { RecordService } from './record.service';
import { ApiService } from './api';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('RecordService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [RecordService, ApiService]
    });
  });

  it('should be created', () => {
    const service = TestBed.get(RecordService);
    expect(service).toBeTruthy();
  });
});
