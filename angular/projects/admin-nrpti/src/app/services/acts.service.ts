import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class ActService {
  constructor(public apiService: ApiService, public http: HttpClient) {}

  public getAllActsAndRegulations(): Promise<any> {
    // if (!actCode) {
    //   throw Error('ActService - agencyCode - missing required code param');
    // }

    const queryString = `acts-regulations`;
    return this.http.get<any>(`${this.apiService.pathAPI}/${queryString}`).toPromise();
  }
}
