import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class IssuingAgencyService {
  constructor(public apiService: ApiService, public http: HttpClient) { }

  public getIssuingAgencies(): Promise<any> {

    return this.http.get<any>(`${this.apiService.pathAPI}/list-agencies`)
    .toPromise()
    .catch((error) => {
      console.error('API call error:', error);
      throw error; // Rethrow the error to propagate it further
    });
  }

  public updateAgency(agencyCode: string, agencyName: any): Promise<any> {
    const apiUrl = `${this.apiService.pathAPI}/update-agencies`;
    let updatedAgency = { "agencies": [{"agencyCode": agencyCode, "agencyName": agencyName}]}
    console.log(updatedAgency)
    alert(updatedAgency)
    return this.http.put<any>(apiUrl, updatedAgency)
      .toPromise()
      .catch((error) => {
        console.error('API call error:', error);
        throw error; // Rethrow the error to propagate it further
      });
}
}
