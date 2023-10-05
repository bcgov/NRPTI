/**
 * @description This service is used for fetching issuing agencies and storing them in the database.
 * @class IssuingAgencyService
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { ApiService } from './api.service';

/**
 * @class
 * @description Service for managing issuing agencies.
 */
@Injectable({ providedIn: 'root' })
export class IssuingAgencyService {
  /**
   * @constructor
   * @param {ApiService} apiService - The API service for handling API requests.
   * @param {HttpClient} http - The HTTP client for making API requests.
   */
  constructor(public apiService: ApiService, public http: HttpClient) {}

  /**
   * Get the list of issuing agencies from the API.
   * @returns {Promise<any>} A promise that resolves with the list of issuing agencies.
   */
  public getIssuingAgencies(): Promise<any> {
    return this.http
      .get<any>(`${this.apiService.pathAPI}/list-agencies`)
      .toPromise()
      .catch(error => {
        console.error('API call error:', error);
        throw error;
      });
  }

  /**
   * Update an agency's information in the database.
   * @param {string} agencyCode - The code of the agency to update.
   * @param {any} agencyName - The updated agency name.
   * @returns {Promise<any>} A promise that resolves with the result of the update operation.
   */
  public updateAgency(agencyCode: string, agencyName: any): Promise<any> {
    const apiUrl = `${this.apiService.pathAPI}/update-agencies`;
    const updatedAgency = { agencies: [{ agencyCode: agencyCode, agencyName: agencyName }] }; // Wrap the array in an object
    console.log(JSON.stringify(updatedAgency));
    return this.http
      .put<any>(apiUrl, updatedAgency)
      .toPromise()
      .catch(error => {
        console.error('API call error:', error);
        throw error;
      });
  }
}
