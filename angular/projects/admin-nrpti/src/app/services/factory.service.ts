import { Injectable, Injector } from '@angular/core';
import { KeycloakService } from './keycloak.service';
import { RecordService } from './record.service';
import { JwtUtil } from '../utils/jwt-utils';
import { Observable, of } from 'rxjs';
import { Record } from '../models/record';
import { ApiService } from './api.service';

/**
 * Facade service for all admin-nrpti services.
 *
 * Note: All services should be accessed through this parent service only.
 *
 * @export
 * @class FactoryService
 */
@Injectable({ providedIn: 'root' })
export class FactoryService {
  private _keycloakService: KeycloakService;
  private _recordService: RecordService;
  private _apiService: ApiService;

  constructor(private injector: Injector) {}

  /**
   * Inject keycloak service if it hasn't already been injected.
   *
   * @readonly
   * @type {KeycloakService}
   * @memberof FactoryService
   */
  public get keycloakService(): KeycloakService {
    if (!this._keycloakService) {
      this._keycloakService = this.injector.get(KeycloakService);
    }

    return this._keycloakService;
  }

  /**
   * Inject record service if it hasn't already been injected.
   *
   * @readonly
   * @type {RecordService}
   * @memberof FactoryService
   */
  public get recordService(): RecordService {
    if (!this._recordService) {
      this._recordService = this.injector.get(RecordService);
    }
    return this._recordService;
  }

  /**
   * Inject api service if it hasn't already been injected.
   *
   * @readonly
   * @type {ApiService}
   * @memberof FactoryService
   */
  public get apiService(): ApiService {
    if (!this._apiService) {
      this._apiService = this.injector.get(ApiService);
    }
    return this._apiService;
  }

  /**
   * True if the user is authenticated, false otherwise.
   *
   * @returns {boolean}
   * @memberof FactoryService
   */
  public isAuthenticated(): boolean {
    return this.keycloakService.isAuthenticated();
  }

  /**
   * Returns the current auth token.
   *
   * @returns {string} auth token
   * @memberof FactoryService
   */
  public getToken(): string {
    console.log(this.keycloakService.getToken());
    return this.keycloakService.getToken();
  }

  /**
   * Refreshes the current auth token.
   *
   * @returns {string} auth token
   * @memberof FactoryService
   */
  public refreshToken(): Observable<any> {
    return this.keycloakService.refreshToken();
  }

  /**
   * Builds a welcome message based on the username in the auth token.  Returns empty string if no token found, or token
   * is invalid.
   *
   * @returns {string} welcome message
   * @memberof FactoryService
   */
  public getWelcomeMessage(): string {
    const token = this.getToken();

    if (!token) {
      return '';
    }

    const jwt = JwtUtil.decodeToken(token);

    if (!jwt) {
      return '';
    }

    return `Hello ${jwt.displayName}`;
  }

  /**
   * Return the record for the given id.
   *
   * @param {string} recordId record id.
   * @returns {Observable<Record>} An observable that emits the matching record or null if none found.
   * @memberof FactoryService
   */
  public getRecord(recordId: string): Observable<Record> {
    return this.recordService.getbyId({ _id: recordId });
  }

  // TODO: This is just a dummy function to satisfy the current list page.
  public getAll(...args: any): Observable<Record[]> {
    return of([]);
  }

  // TODO: This is just a dummy function to satisfy the current list page.
  public getCount(...args: any): Observable<number> {
    return of(0);
  }

  /**
   * Get the current environment.
   *
   * @returns {String} environment.
   * @memberof FactoryService
   */
  public getEnvironment(): string {
    return this.apiService.env;
  }
}
