import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiService } from './api.service';

/**
 * Defines a recordObject used by batch api operations.
 *
 * @export
 * @interface IRecordObject
 */
export interface IRecordObject {
  recordId: string;
  recordType: string;
}

/**
 * Order http request handlers.
 *
 * @export
 * @class ApiService
 */
@Injectable({ providedIn: 'root' })
export class RecordService {
  constructor(public apiService: ApiService, public http: HttpClient) {}

  publishRecord(records: IRecordObject[]): Observable<object> {
    const queryString = 'records/publish';
    return this.http.post<object>(`${this.apiService.pathAPI}/${queryString}`, records, {});
  }

  unPublishRecord(records: IRecordObject[]): Observable<object> {
    const queryString = 'records/unpublish';
    return this.http.post<object>(`${this.apiService.pathAPI}/${queryString}`, records, {});
  }
}
