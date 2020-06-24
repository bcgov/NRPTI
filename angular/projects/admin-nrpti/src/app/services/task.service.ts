import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiService } from './api.service';

export interface ITaskParams {
  /**
   * Data source type to update.
   *
   * @type {string}
   * @memberof ITaskParams
   */
  dataSourceType: string;
  /**
   * Specific record types to update.  If not specified, all record types are updated.
   *
   * @type {string[]}
   * @memberof ITaskParams
   */
  recordTypes?: string[];
}

export interface ICsvTaskParams {
  /**
   * Data source type to update.
   *
   * @type {string}
   * @memberof ICsvTaskParams
   */
  dataSourceType: string;
  /**
   * Specific record type to update.
   *
   * @type {string}
   * @memberof ICsvTaskParams
   */
  recordType: string;
  /**
   * Csv file data to import records from.
   *
   * @type {string}
   * @memberof ICsvTaskParams
   */
   csvData: string;
}

/**
 * Task request handlers.
 *
 * @export
 * @class ApiService
 */
@Injectable({ providedIn: 'root' })
export class TaskService {
  constructor(public apiService: ApiService, public http: HttpClient) {}

  /**
   * Send request to start a task.
   *
   * @param {ITaskParams} taskParams
   * @returns {Observable<object>}
   * @memberof ApiService
   */
  startTask(taskParams: ITaskParams): Observable<object> {
    const queryString = 'task';
    return this.http.post<object>(`${this.apiService.pathAPI}/${queryString}`, taskParams, {});
  }

  /**
   * Send request to start a csv task.
   *
   * @param {ICsvTaskParams} csvTaskParams
   * @returns {Observable<object>}
   * @memberof ApiService
   */
  startCsvTask(csvTaskParams: ICsvTaskParams): Observable<object> {
    const formData = new FormData();
    formData.append('dataSourceType', csvTaskParams.dataSourceType);
    formData.append('recordType', csvTaskParams.recordType);
    formData.append('csvData', csvTaskParams.csvData);

    const queryString = 'task/csv';
    return this.http.post<object>(`${this.apiService.pathAPI}/${queryString}`, formData, {});
  }
}
