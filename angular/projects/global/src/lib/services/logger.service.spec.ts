import { TestBed, inject } from '@angular/core/testing';
import { LoggerService } from 'app/services/logger.service';

describe('LoggerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        LoggerService
      ],
      declarations: [],
      imports: []
    });
  });

  it('should be created', inject([LoggerService], (service: LoggerService) => {
    expect(service).toBeTruthy();
  }));
});
