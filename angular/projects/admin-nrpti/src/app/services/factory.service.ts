import { Injectable, Injector } from '@angular/core';
import { KeycloakService } from './keycloak.service';
import { RecordService } from './record.service';
import { JwtUtil } from '../utils/jwt-utils';
import { Observable } from 'rxjs';
// import { Record } from '../models/record';
import { ApiService } from './api.service';
import { SearchService } from '../../../../global/src/lib/services/search.service';
import { SearchResults } from '../../../../global/src/lib/models/search';

import { HttpClient } from '@angular/common/http';

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
  private _searchService: SearchService;
  // private _pathAPI: string;

  constructor(private injector: Injector, private http: HttpClient) {
    // The following items are loaded by a file that is only present on cluster builds.
    // Locally, this will be empty and local defaults will be used.
    // const remote_api_path = window.localStorage.getItem('from_admin_server--remote_api_path');
    // // const remote_public_path = window.localStorage.getItem('from_admin_server--remote_public_path');  // available in case its ever needed
    // const deployment_env = window.localStorage.getItem('from_admin_server--deployment_env');
    // this._pathAPI = 'http://localhost:3000/api/public';
  }

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
   * Inject record service if it hasn't already been injected.
   *
   * @readonly
   * @type {SearchService}
   * @memberof FactoryService
   */
  public get searchService(): SearchService {
    if (!this._searchService) {
      this._searchService = this.injector.get(SearchService);
    }
    return this._searchService;
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
  public getRecord(recordId: string, schema: string): Observable<SearchResults[]> {
    return this.searchService.getItem('http://localhost:3000/api', recordId, schema);
  }

  // public getFullList(schema: string): Observable<Record[]> {
  //   return this.searchService.getFullList(schema);
  // }

  /**
   * Get the current environment.
   *
   * @returns {String} environment.
   * @memberof FactoryService
   */
  public getEnvironment(): string {
    return this.apiService.env;
  }

  public startTask(obj: any) {
    // TODO: Convert this to a service
    return this.http.post<any>('http://localhost:3000/api/task', { dataSource: 'epic' }, {});
  }
}
