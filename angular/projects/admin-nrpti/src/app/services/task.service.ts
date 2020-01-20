import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiService } from './api.service';

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
   * @param {*} obj post body payload
   * @returns {Observable<any>}
   * @memberof ApiService
   */
  startTask(obj: any): Observable<any> {
    const queryString = 'task';
    return this.http.post<any>(`${this.apiService.pathAPI}/${queryString}`, obj, {});
  }
}
