import { Injectable, Injector } from '@angular/core';
import { KeycloakService } from './keycloak.service';
import { JwtUtil } from '../utils/jwt-utils';
import { Observable, of } from 'rxjs';
import { ApiService } from './api.service';
import { SearchService, SearchResults } from 'nrpti-angular-components';
import { RecordService } from './record.service';
import { catchError } from 'rxjs/operators';
import {
  Inspection,
  Permit,
  SelfReport,
  Ticket,
  Warning,
  ConstructionPlan,
  ManagementPlan
} from '../../../../common/src/app/models/master';
import { TaskService, ITaskParams } from './task.service';
import { DocumentService } from './document.service';

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
   * @returns {Observable<SearchResults[]>} An observable that emits the matching record or null if none found.
   * @memberof FactoryService
   */
  public getRecord(recordId: string, schema: string): Observable<SearchResults[]> {
    if (!recordId || !schema) {
      return of([] as SearchResults[]);
    }
    return this.searchService.getItem(this.apiService.pathAPI, recordId, schema);
  }

  public getRecordWithFlavours(recordId: string, schema: string): Observable<SearchResults[]> {
    if (!recordId || !schema) {
      return of([] as SearchResults[]);
    }
    return this.searchService.getItem(this.apiService.pathAPI, recordId, schema, true);
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
    pageNum: number = 1,
    pageSize: number = 10,
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

  // Orders
  public createOrder(order: any): Observable<object> {
    const outboundObject = {
      orders: [order]
    };
    return this.recordService
      .createRecord(outboundObject)
      .pipe(catchError(error => this.apiService.handleError(error)));
  }

  public editOrder(order: any): Observable<object> {
    const outboundObject = {
      orders: [order]
    };
    return this.recordService.editRecord(outboundObject).pipe(catchError(error => this.apiService.handleError(error)));
  }

  // Inspections
  public createInspection(inspection: Inspection): Observable<object> {
    const outboundObject = {
      inspections: [inspection]
    };
    return this.recordService
      .createRecord(outboundObject)
      .pipe(catchError(error => this.apiService.handleError(error)));
  }

  public editInspection(inspection: Inspection): Observable<object> {
    const outboundObject = {
      inspections: [inspection]
    };
    return this.recordService.editRecord(outboundObject).pipe(catchError(error => this.apiService.handleError(error)));
  }

  // Certificates
  public createCertificate(certificate: any): Observable<object> {
    const outboundObject = {
      certificates: [certificate]
    };
    return this.recordService
      .createRecord(outboundObject)
      .pipe(catchError(error => this.apiService.handleError(error)));
  }

  public editCertificate(certificate: any): Observable<object> {
    const outboundObject = {
      certificates: [certificate]
    };
    return this.recordService.editRecord(outboundObject).pipe(catchError(error => this.apiService.handleError(error)));
  }

  // Permits
  public createPermit(permit: Permit): Observable<object> {
    const outboundObject = {
      permits: [permit]
    };
    return this.recordService
      .createRecord(outboundObject)
      .pipe(catchError(error => this.apiService.handleError(error)));
  }

  public editPermit(permit: Permit): Observable<object> {
    const outboundObject = {
      permits: [permit]
    };
    return this.recordService.editRecord(outboundObject).pipe(catchError(error => this.apiService.handleError(error)));
  }

  // Agreements
  public createAgreement(agreement: any): Observable<object> {
    const outboundObject = {
      agreements: [agreement]
    };
    return this.recordService
      .createRecord(outboundObject)
      .pipe(catchError(error => this.apiService.handleError(error)));
  }

  public editAgreement(agreement: any): Observable<object> {
    const outboundObject = {
      agreements: [agreement]
    };
    return this.recordService.editRecord(outboundObject).pipe(catchError(error => this.apiService.handleError(error)));
  }

  // SelfReports
  public createSelfReport(selfReport: SelfReport): Observable<object> {
    const outboundObject = {
      selfReports: [selfReport]
    };
    return this.recordService
      .createRecord(outboundObject)
      .pipe(catchError(error => this.apiService.handleError(error)));
  }

  public editSelfReport(selfReport: SelfReport): Observable<object> {
    const outboundObject = {
      selfReports: [selfReport]
    };
    return this.recordService.editRecord(outboundObject).pipe(catchError(error => this.apiService.handleError(error)));
  }

  // Restorative Justices
  public createRestorativeJustice(restorativeJustice: any): Observable<object> {
    const outboundObject = {
      restorativeJustices: [restorativeJustice]
    };
    return this.recordService
      .createRecord(outboundObject)
      .pipe(catchError(error => this.apiService.handleError(error)));
  }

  public editRestorativeJustice(restorativeJustice: any): Observable<object> {
    const outboundObject = {
      restorativeJustices: [restorativeJustice]
    };
    return this.recordService.editRecord(outboundObject).pipe(catchError(error => this.apiService.handleError(error)));
  }

  // Tickets
  public createTicket(ticket: Ticket): Observable<object> {
    const outboundObject = {
      tickets: [ticket]
    };
    return this.recordService
      .createRecord(outboundObject)
      .pipe(catchError(error => this.apiService.handleError(error)));
  }

  public editTicket(ticket: Ticket): Observable<object> {
    const outboundObject = {
      tickets: [ticket]
    };
    return this.recordService.editRecord(outboundObject).pipe(catchError(error => this.apiService.handleError(error)));
  }

  // Administrative Penalties
  public createAdministrativePenalty(administrativePenalty: any): Observable<object> {
    const outboundObject = {
      administrativePenalties: [administrativePenalty]
    };
    return this.recordService
      .createRecord(outboundObject)
      .pipe(catchError(error => this.apiService.handleError(error)));
  }

  public editAdministrativePenalty(administrativePenalty: any): Observable<object> {
    const outboundObject = {
      administrativePenalties: [administrativePenalty]
    };
    return this.recordService.editRecord(outboundObject).pipe(catchError(error => this.apiService.handleError(error)));
  }

  // Administrative Sanctions
  public createAdministrativeSanction(administrativeSanction: any): Observable<object> {
    const outboundObject = {
      administrativeSanctions: [administrativeSanction]
    };
    return this.recordService
      .createRecord(outboundObject)
      .pipe(catchError(error => this.apiService.handleError(error)));
  }

  public editAdministrativeSanction(administrativeSanction: any): Observable<object> {
    const outboundObject = {
      administrativeSanctions: [administrativeSanction]
    };
    return this.recordService.editRecord(outboundObject).pipe(catchError(error => this.apiService.handleError(error)));
  }

  // Warnings
  public createWarning(warning: Warning): Observable<object> {
    const outboundObject = {
      warnings: [warning]
    };
    return this.recordService
      .createRecord(outboundObject)
      .pipe(catchError(error => this.apiService.handleError(error)));
  }

  public editWarning(warning: Warning): Observable<object> {
    const outboundObject = {
      warnings: [warning]
    };
    return this.recordService.editRecord(outboundObject).pipe(catchError(error => this.apiService.handleError(error)));
  }

  // Construction Plans
  public createConstructionPlan(constructionPlan: ConstructionPlan): Observable<object> {
    const outboundObject = {
      constructionPlans: [constructionPlan]
    };
    return this.recordService
      .createRecord(outboundObject)
      .pipe(catchError(error => this.apiService.handleError(error)));
  }

  public editConstructionPlan(constructionPlan: ConstructionPlan): Observable<object> {
    const outboundObject = {
      constructionPlans: [constructionPlan]
    };
    return this.recordService.editRecord(outboundObject).pipe(catchError(error => this.apiService.handleError(error)));
  }

  // Management Plans
  public createManagementPlan(managementPLan: ManagementPlan): Observable<object> {
    const outboundObject = {
      managementPlans: [managementPLan]
    };
    return this.recordService
      .createRecord(outboundObject)
      .pipe(catchError(error => this.apiService.handleError(error)));
  }

  public editManagementPlan(managementPLan: ManagementPlan): Observable<object> {
    const outboundObject = {
      managementPlans: [managementPLan]
    };
    return this.recordService.editRecord(outboundObject).pipe(catchError(error => this.apiService.handleError(error)));
  }

  // Documents
  public createDocument(document: FormData, recordId: string): Promise<any> {
    return this.documentService.createDocument(document, recordId);
  }

  public deleteDocument(docId: string, recordId: string): Promise<any> {
    return this.documentService.deleteDocument(docId, recordId);
  }
}
