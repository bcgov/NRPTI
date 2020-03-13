import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiService } from './api.service';

/**
 * Order http request handlers.
 *
 * @export
 * @class ApiService
 */
@Injectable({ providedIn: 'root' })
export class RecordService {
  constructor(public apiService: ApiService, public http: HttpClient) {}

  /**
   * Publish a record.
   *
   * @param {string} record record to publish
   * @returns {Observable<object>} the updated record
   * @memberof RecordService
   */
  publishRecord(record: any): Observable<object> {
    if (!record) {
      throw Error('RecordService - publishRecord - missing required record');
    }

    const queryString = `record/${record._id}/publish`;
    return this.http.post<object>(`${this.apiService.pathAPI}/${queryString}`, record, {});
  }

  /**
   * Unpublish a record.
   *
   * @param {string} record record to unpublish
   * @returns {Observable<object>} the updated record
   * @memberof RecordService
   */
  unPublishRecord(record: any): Observable<object> {
    if (!record) {
      throw Error('RecordService - unPublishRecord - missing required record');
    }

    const queryString = `record/${record._id}/unpublish`;
    return this.http.post<object>(`${this.apiService.pathAPI}/${queryString}`, record, {});
  }

  createRecord(record: any): Observable<object> {
    const queryString = 'record';
    return this.http.post<object>(`${this.apiService.pathAPI}/${queryString}`, record, {});
  }

  editRecord(record: any): Observable<object> {
    const queryString = 'record';
    return this.http.put<object>(`${this.apiService.pathAPI}/${queryString}`, record, {});
  }
}
