import { TestBed } from '@angular/core/testing';
import { ApiService } from './api';
import { DocumentService } from './document.service';

describe('DocumentService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ApiService,
          useValue: jasmine.createSpyObj('ApiService', ['getDocumentsByAppId', 'handleError'])
        },
        DocumentService
      ]
    });
  });

  it('should be created', () => {
    const service: DocumentService = TestBed.get(DocumentService);
    expect(service).toBeTruthy();
  });
});
