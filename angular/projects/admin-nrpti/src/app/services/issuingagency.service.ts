import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class IssuingAgencyService {
  constructor(public apiService: ApiService, public http: HttpClient) {}

  public getIssuingAgencies(): Promise<any> {
    return this.http
      .get<any>(`${this.apiService.pathAPI}/list-agencies`)
      .toPromise()
      .catch(error => {
        console.error('API call error:', error);
        throw error; // Rethrow the error to propagate it further
      });
  }

  public updateAgency(agencyCode: string, agencyName: any): Promise<any> {
    const apiUrl = `${this.apiService.pathAPI}/update-agencies`;
    let updatedAgency = { agencies: [{ agencyCode: agencyCode, agencyName: agencyName }] }; // Wrap the array in an object
    console.log(JSON.stringify(updatedAgency));
    return this.http
      .put<any>(apiUrl, updatedAgency)
      .toPromise()
      .catch(error => {
        console.error('API call error:', error);
        throw error; // Rethrow the error to propagate it further
      });
  }

  public async getIssuingAgencyMap() {
    try {
      const response = await this.getIssuingAgencies();
      const issuingAgencyMap: { [key: string]: string } = {};
      if (response && Array.isArray(response)) {
        response.forEach(agency => {
          issuingAgencyMap[agency.agencyCode] = agency.agencyName;
        });
      }
      return issuingAgencyMap;
    } catch (error) {
      console.error('getIssuingAgencyMap() API call error:', error);
      throw error;
    }
  }
}
