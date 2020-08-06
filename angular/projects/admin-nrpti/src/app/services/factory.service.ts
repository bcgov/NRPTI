import { Injectable, Injector } from '@angular/core';
import { KeycloakService } from './keycloak.service';
import { JwtUtil } from '../utils/jwt-utils';
import { Observable, of } from 'rxjs';
import { ApiService } from './api.service';
import { SearchService, SearchResults } from 'nrpti-angular-components';
import { RecordService } from './record.service';
import { catchError } from 'rxjs/operators';
import { TaskService, ITaskParams } from './task.service';
import { DocumentService } from './document.service';
import { ApplicationRoles } from '../../../../common/src/app/utils/record-constants';

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
  private _apiService: ApiService;
  private _searchService: SearchService;
  private _recordService: RecordService;
  private _taskService: TaskService;
  private _documentService: DocumentService;

  constructor(private injector: Injector) {
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
   * Inject task service if it hasn't already been injected.
   *
   * @readonly
   * @type {TaskService}
   * @memberof FactoryService
   */
  public get taskService(): TaskService {
    if (!this._taskService) {
      this._taskService = this.injector.get(TaskService);
    }
    return this._taskService;
  }

  public get documentService(): DocumentService {
    if (!this._documentService) {
      this._documentService = this.injector.get(DocumentService);
    }
    return this._documentService;
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
   * Checks if the current authenticate user is a member
   * of the requested scope/role
   *
   * @param role
   * @returns {boolean} Is the user a member of this scope/role?
   * @memberof FactoryService
   */
  public userInRole(role): boolean {
    const token = this.getToken();

    if (token) {
      const jwt = JwtUtil.decodeToken(token);
      if (jwt && jwt.realm_access && jwt.realm_access.roles) {
        // to handle any case issues with role or the scopes, convert them
        // all to lower case first
        const userRoles = jwt.realm_access.roles.map((userRole: string) => userRole.toLowerCase());
        return userRoles.includes(ApplicationRoles.ADMIN) || userRoles.includes(role.toLowerCase());
      }
    }

    return false;
  }

  userInLngRole() {
    return this.userInRole(ApplicationRoles.ADMIN_LNG);
  }

  userInBcmiRole() {
    return this.userInRole(ApplicationRoles.ADMIN_BCMI);
  }

  userInNrcedRole() {
    return this.userInRole(ApplicationRoles.ADMIN_NRCED);
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
   * @param {string} schema model schema name for this record type.
   * @param {boolean} [populate=false] populate child records
   * @returns {Observable<SearchResults[]>} An observable that emits the matching record or null if none found.
   * @memberof FactoryService
   */
  public getRecord(recordId: string, schema: string, populate: boolean = false): Observable<SearchResults[]> {
    if (!recordId || !schema) {
      return of([] as SearchResults[]);
    }
    return this.searchService.getItem(this.apiService.pathAPI, recordId, schema, populate);
  }

  public getRecordWithFlavours(recordId: string, schema: string): Observable<SearchResults[]> {
    return this.getRecord(recordId, schema, true);
  }

  /**
   * Get records via the search service.
   *
   * @param {string} keys
   * @param {string[]} dataset
   * @param {any[]} fields
   * @param {number} [pageNum=1]
   * @param {number} [pageSize=10]
   * @param {string} [sortBy=null]
   * @param {object} [and={}]
   * @param {boolean} [populate=false]
   * @param {object} [or={}]
   * @param {object} [subset=[]]
   * @param {object} [nor={}]
   * @param {object} [in={}]
   * @returns {Observable<any[]>}
   * @memberof FactoryService
   */
  public getRecords(
    keys: string,
    dataset: string[],
    fields: any[],
    pageNum: number = 1,
    pageSize: number = 10,
    sortBy: string = null,
    and: object = {},
    populate: boolean = false,
    or: object = {},
    subset: string[] = [],
    nor: object = {},
    _in: object = {}
  ): Observable<any[]> {
    return this.searchService.getSearchResults(
      this.getApiPath(),
      keys,
      dataset,
      fields,
      pageNum,
      pageSize,
      sortBy,
      and,
      populate,
      or,
      subset,
      nor,
      _in
    );
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
   * Sends request to start an import task.
   *
   * @param {ITaskParams} taskParams import task parameters
   * @returns {Observable<object>}
   * @memberof FactoryService
   */
  public startTask(taskParams: ITaskParams): Observable<object> {
    return this.taskService.startTask(taskParams);
  }

  /**
   * Publish a record.
   *
   * @param {string} record record to publish
   * @returns {Observable<object>} the updated record
   * @memberof FactoryService
   */
  public publishRecord(record: any): Observable<object> {
    return this.recordService.publishRecord(record).pipe(catchError(error => this.apiService.handleError(error)));
  }

  /**
   * Unpublish a record.
   *
   * @param {string} record record to unpublish
   * @returns {Observable<object>} the updated record
   * @memberof FactoryService
   */
  public unPublishRecord(record: any): Observable<object> {
    return this.recordService.unPublishRecord(record).pipe(catchError(error => this.apiService.handleError(error)));
  }

  /**
   * Edit a mine record.
   *
   * @param {*} mine object containing mine values to update into mine record.
   * @returns {Observable<object>}
   * @memberof FactoryService
   */
  public editMine(mine: any): Observable<object> {
    const outboundObject = {
      mines: [mine]
    };
    return this.recordService.editRecord(outboundObject).pipe(catchError(error => this.apiService.handleError(error)));
  }

  /**
   * Delete a mine collection.
   *
   * @param {string} collectionId _id of the collection to delete.
   * @returns {Promise<any>}
   * @memberof FactoryService
   */
  public deleteCollection(collectionId: string): Promise<any> {
    return this.recordService.deleteRecord(collectionId, 'collection');
  }

  /**
   * Edit a mine record.
   *
   * @param {*} record object containing mine record values to update into a record item.
   * @returns {Observable<object>}
   * @memberof FactoryService
   */
  public editMineRecord(record: any): Observable<object> {
    const outboundObject = {};

    switch (record.recordType) {
      case 'Administrative Penalty':
        outboundObject['administrativePenalties'] = [record];
        break;
      case 'Administrative Sanction':
        outboundObject['administrativeSanctions'] = [record];
        break;
      case 'Agreement':
        outboundObject['aggrements'] = [record];
        break;
      case 'Annual Report':
        outboundObject['annualReports'] = [record];
        break;
      case 'Certificate':
        outboundObject['certificates'] = [record];
        break;
      case 'Certificate Amendment':
        outboundObject['certificateAmendments'] = [record];
        break;
      case 'Compliance Self-report':
        outboundObject['selfReports'] = [record];
        break;
      case 'Construction Plan':
        outboundObject['constructionPlans'] = [record];
        break;
      case 'Correspondence':
        outboundObject['correspondences'] = [record];
        break;
      case 'Dam Safety Inspection':
        outboundObject['damSafetyInspections'] = [record];
        break;
      case 'Inspection':
        outboundObject['inspections'] = [record];
        break;
      case 'Management Plan':
        outboundObject['managementPlans'] = [record];
        break;
      case 'Order':
        outboundObject['orders'] = [record];
        break;
      case 'Permit':
        outboundObject['permits'] = [record];
        break;
      case 'Report':
        outboundObject['reports'] = [record];
        break;
      case 'Restoritive Justice':
        outboundObject['restorativeJustices'] = [record];
        break;
      case 'Ticket':
        outboundObject['tickets'] = [record];
        break;
      case 'Warning':
        outboundObject['warnings'] = [record];
        break;
      default:
        outboundObject['records'] = [record];
        break;
    }

    return this.recordService.editRecord(outboundObject).pipe(catchError(error => this.apiService.handleError(error)));
  }

  // todo determine payload type to set
  public createMineRecord(record: any) {
    switch (record.recordType) {
      case 'Administrative Penalty':
        return this.writeRecord(record, 'administrativePenalties', true);
      case 'Agreement':
        return this.writeRecord(record, 'aggrements', true);
      case 'Annual Report':
        return this.writeRecord(record, 'annualReports', true);
      case 'Administrative Sanction':
        return this.writeRecord(record, 'administrativeSanctions', true);
      case 'Certificate':
        return this.writeRecord(record, 'certificates', true);
      case 'Certificate Amendment':
        return this.writeRecord(record, 'certificateAmendments', true);
      case 'Compliance Self-report':
        return this.writeRecord(record, 'selfReports', true);
      case 'Construction Plan':
        return this.writeRecord(record, 'constructionPlans', true);
      case 'Correspondence':
        return this.writeRecord(record, 'correspondences', true);
      case 'Inspection':
        return this.writeRecord(record, 'inspections', true);
      case 'Management Plan':
        return this.writeRecord(record, 'managementPlans', true);
      case 'Dam Safety Inspection':
        return this.writeRecord(record, 'damSafetyInspections', true);
      case 'Order':
        return this.writeRecord(record, 'orders', true);
      case 'Permit':
        return this.writeRecord(record, 'permits', true);
      case 'Report':
        return this.writeRecord(record, 'reports', true);
      case 'Restoritive Justice':
        return this.writeRecord(record, 'restorativeJustices', true);
      case 'Ticket':
        return this.writeRecord(record, 'tickets', true);
      case 'Warning':
        return this.writeRecord(record, 'warnings', true);
      default:
        return null;
    }
  }

  /**
   * Delete a mine record.
   *
   * @param {string} recordId _id of the record to delete.
   * @param {string} model schema of record to delete
   * @returns {Promise<any>}
   * @memberof FactoryService
   */
  public deleteMineRecord(recordId: string, model: string): Promise<any> {
    return this.recordService.deleteRecord(recordId, model);
  }

  // News
  public createNews(news: any): Observable<object> {
    const outboundObject = {
      newsItems: [news]
    };
    return this.recordService
      .createRecord(outboundObject)
      .pipe(catchError(error => this.apiService.handleError(error)));
  }

  public editNews(news: any): Observable<object> {
    const outboundObject = {
      newsItems: [news]
    };
    return this.recordService.editRecord(outboundObject).pipe(catchError(error => this.apiService.handleError(error)));
  }

  public deleteNewsItem(recordId: string, model: string): Promise<any> {
    return this.recordService.deleteRecord(recordId, model);
  }

  // Documents
  public createDocument(document: FormData, recordId: string): Promise<any> {
    return this.documentService.createDocument(document, recordId);
  }

  public deleteDocument(docId: string, recordId: string): Promise<any> {
    return this.documentService.deleteDocument(docId, recordId);
  }

  public getS3SignedUrl(docId: string): Observable<any> {
    return this.documentService.getS3SignedUrl(docId);
  }

  // Collections
  public createCollection(collection: any): Observable<object> {
    const outboundObject = {
      collections: [collection]
    };
    return this.recordService
      .createRecord(outboundObject)
      .pipe(catchError(error => this.apiService.handleError(error)));
  }

  public editCollection(collection: any): Observable<object> {
    const outboundObject = {
      collections: [collection]
    };
    return this.recordService.editRecord(outboundObject).pipe(catchError(error => this.apiService.handleError(error)));
  }

  // Record insert/edit helper
  // Could replace record: any with record: IRecordModel,however this would mean
  // more expansive updates to the existing add-edit components.
  public writeRecord(record: any, containerName: string, isInsert: boolean = true): Observable<object> {
    const dataPackage = {};
    dataPackage[containerName] = [record];

    return isInsert ? this.recordService
                          .createRecord(dataPackage)
                          .pipe(catchError(error => this.apiService.handleError(error)))
                    : this.recordService
                          .editRecord(dataPackage)
                          .pipe(catchError(error => this.apiService.handleError(error)));
  }
}
