/**
 * @description This service provides methods to fetch and store issuing agencies.
 * @class ApplicationAgencyService
 */

import { Injectable } from '@angular/core';
import { ConfigService } from 'nrpti-angular-components';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

/**
 * @class
 * @description Service for managing issuing agencies.
 */
@Injectable()
export class ApplicationAgencyService {
  private api: string;
  private agencies: { [key: string]: string } = {};

  /**
   * @constructor
   * @param {ConfigService} configService - The configuration service.
   * @param {HttpClient} http - The HTTP client for making API requests.
   */
  constructor(
    private configService: ConfigService,
    public http: HttpClient
  ) {}

  /**
   * Initialize the service by setting the API endpoint and refreshing agencies.
   * @async
   */
  async init() {
    this.api = `${this.configService.config['API_LOCATION']}${this.configService.config['API_PATH']}`;
    await this.refreshAgencies().toPromise();
  }

  /**
   * Refresh the list of agencies from the API.
   * @returns {Observable<void>} An observable that completes when agencies are refreshed.
   */
  refreshAgencies(): Observable<void> {
    return new Observable<void>(observer => {
      const apiEndpoint = `${this.api}/list-agencies`;
      const getAgencies = this.http.get<{ [key: string]: string }>(apiEndpoint);

      getAgencies.subscribe(
        response => {
          // Data transformation to make the data easier to work with
          const agencyList = {};
          for (const record in response) {
            if (response.hasOwnProperty(record)) {
              agencyList[response[record]['agencyCode']] = response[record]['agencyName'];
            }
          }
          this.agencies = agencyList;
          observer.next();
          observer.complete();
        },
        error => {
          console.error('HTTP Request Error: ', error);
          observer.error(error);
        }
      );
    });
  }

  /**
   * Get the list of agencies.
   * @returns {Object} A dictionary of agency codes and names.
   */
  getAgencies(): { [key: string]: string } {
    return this.agencies;
  }
}
