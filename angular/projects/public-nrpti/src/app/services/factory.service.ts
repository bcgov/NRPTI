import { Injectable, Injector, ViewContainerRef, Type, ComponentRef } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ApiService } from './api.service';
import { SearchService, SearchResults, InjectComponentService } from 'nrpti-angular-components';

/**
 * Facade service for all public-nrced services.
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
  private _injectComponentService: InjectComponentService;

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
   * Inject inject component service if it hasn't already been injected.
   *
   * @readonly
   * @type {InjectComponentService}
   * @memberof FactoryService
   */
  public get injectComponentService(): InjectComponentService {
    if (!this._injectComponentService) {
      this._injectComponentService = this.injector.get(InjectComponentService);
    }
    return this._injectComponentService;
  }

  /**
   * Return the record for the given _id.
   *
   * @param {string} recordId record _id.
   * @param {string} schema model schema name for this record type.
   * @returns {Observable<SearchResults[]>} An observable that emits the matching record or null if none found.
   * @memberof FactoryService
   */
  public getRecord(recordId: string, schema: string, populate = false): Observable<SearchResults[]> {
    if (!recordId || !schema) {
      return of([] as SearchResults[]);
    }
    return this.searchService.getItem(this.apiService.pathAPI, recordId, schema, populate);
  }

  /**
   * Return matching records for the given search parameters.
   *
   * @param {string} keys
   * @param {string[]} dataset
   * @param {any[]} fields
   * @param {number} [pageNum=1]
   * @param {number} [pageSize=10]
   * @param {string} [sortBy=null]
   * @param {object} [queryModifier={}]
   * @param {boolean} [populate=false]
   * @param {object} [filter={}]
   * @returns {Observable<any[]>}
   * @memberof FactoryService
   */
  public getRecords(
    keys: string,
    dataset: string[],
    fields: any[],
    pageNum: number = 0,
    pageSize: number = 25,
    sortBy: string = null,
    queryModifier: object = {},
    populate: boolean = false,
    filter: object = {}
  ): Observable<any[]> {
    return this.searchService.getSearchResults(
      this.getApiPath(),
      keys,
      dataset,
      fields,
      pageNum,
      pageSize,
      sortBy,
      queryModifier,
      populate,
      filter
    );
  }

  /**
   * Get documents for the given Document _ids
   *
   * @param {string[]} documentIds array of document _ids
   * @returns {Observable<any[]>}
   * @memberof FactoryService
   */
  public getDocuments(documentIds: string[]): Observable<any[]> {
    if (!documentIds || !documentIds.length) {
      return of([]);
    }

    return this.getRecords(null, ['Document'], null, null, null, null, null, null, {
      _id: documentIds.join(',')
    });
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
   * Get the current environment.
   *
   * @returns {String} environment.
   * @memberof FactoryService
   */
  public getApiPath(): string {
    return this.apiService.pathAPI;
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

  /**
   * Resolves, Builds, and Injects a component of type T into the provided view.
   *
   * @param {ViewContainerRef} viewContainerRef
   * @param {Type<any>} comonentToInject
   * @returns {ComponentRef<any>}
   * @memberof FactoryService
   */
  public injectComponentIntoView(viewContainerRef: ViewContainerRef, comonentToInject: Type<any>): ComponentRef<any> {
    return this.injectComponentService.injectComponentIntoView(viewContainerRef, comonentToInject);
  }
}
