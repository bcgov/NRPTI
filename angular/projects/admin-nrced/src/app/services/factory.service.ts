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
  private _exportService: KeycloakService;
  public get keycloakService(): KeycloakService {
    if (!this._exportService) {
      this._exportService = this.injector.get(KeycloakService);
    }
    return this._exportService;
  }

  constructor(private injector: Injector) {}

  // TODO expose keycloak methods
}
