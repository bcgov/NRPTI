import { async, TestBed } from '@angular/core/testing';

import { StoreService } from './store.service';

describe('StoreService', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [StoreService]
    });
  }));

  it('should be created', () => {
    const service: StoreService = TestBed.get(StoreService);
    expect(service).toBeTruthy();
  });
});
