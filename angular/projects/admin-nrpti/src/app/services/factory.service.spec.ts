import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { FactoryService } from './factory.service';

describe('FactoryService', () => {
  beforeEach((() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    }).compileComponents();
  }));

  it('should be created', () => {
    const service: FactoryService = TestBed.get(FactoryService);
    expect(service).toBeTruthy();
  });
});
