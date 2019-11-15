import { Injectable, Injector } from '@angular/core';
import { KeycloakService } from './keycloak.service';

/**
 * TODO: add doc
 *
 * @export
 * @class FactoryService
 */
@Injectable()
export class FactoryService {
  private _keycloakService: KeycloakService;

  public get keycloakService(): KeycloakService {
    if (!this._keycloakService) {
      this._keycloakService = this.injector.get(KeycloakService);
    }
    return this._keycloakService;
  }

  constructor(private injector: Injector) {}

  // TODO expose keycloak methods
}
