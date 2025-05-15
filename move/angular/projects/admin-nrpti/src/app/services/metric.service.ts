import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class MetricService {
  constructor(
    public apiService: ApiService,
    public http: HttpClient
  ) {}

  public getMetric(code: string): Promise<any> {
    if (!code) {
      throw Error('MetricService - getMetric - missing required code param');
    }

    const queryString = `metric/${code}/data`;
    return this.http.get<any>(`${this.apiService.pathAPI}/${queryString}`).toPromise();
  }
}
