import { Injectable, Injector } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { SearchService, SearchResults } from 'nrpti-angular-components';

/**
 * Facade service for all public-nrpti services.
 *
 * Note: All services should be accessed through this parent service only.
 *
 * @export
 * @class FactoryService
 */
@Injectable({ providedIn: 'root' })
export class FactoryService {
  private _apiService: ApiService;
  private _searchService: SearchService;
  // private _pathAPI: string;

  constructor(private injector: Injector) {
    // The following items are loaded by a file that is only present on cluster builds.
    // Locally, this will be empty and local defaults will be used.
    // const remote_api_path = window.localStorage.getItem('from_admin_server--remote_api_path');
    // // const remote_public_path = window.localStorage.getItem('from_admin_server--remote_public_path');  // available in case its ever needed
    // const deployment_env = window.localStorage.getItem('from_admin_server--deployment_env');
    // this._pathAPI = 'http://localhost:3000/api/public';
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
   * Return the record for the given id.
   *
   * @param {string} recordId record id.
   * @returns {Observable<Record>} An observable that emits the matching record or null if none found.
   * @memberof FactoryService
   */
  public getRecord(recordId: string, schema: string): Observable<SearchResults[]> {
    return this.searchService.getItem(this.apiService.pathAPI, recordId, schema);
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

  /**
   * Sends request to start a task.
   *
   * @param {*} obj request payload
   * @returns {*}
   * @memberof FactoryService
   */
  public startTask(obj: any): any {
    return this.apiService.startTask(obj);
  }
}
