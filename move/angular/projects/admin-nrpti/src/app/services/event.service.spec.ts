import { TestBed } from '@angular/core/testing';

import { ConfigService } from 'nrpti-angular-components';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FactoryService } from './factory.service';
import { EventService } from './event.service';

describe('EventService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ConfigService, FactoryService]
    });
  });

  it('should be created', () => {
    const service: EventService = TestBed.get(EventService);
    expect(service).toBeTruthy();
  });
});
