import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed, inject } from '@angular/core/testing';
import { ConfigService } from 'nrpti-angular-components';

import { KeycloakService } from './keycloak.service';

describe('KeycloakService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [KeycloakService, ConfigService],
      imports: [HttpClientTestingModule]
    });
  });

  it('should be created', inject([KeycloakService], (service: KeycloakService) => {
    expect(service).toBeTruthy();
  }));
});
