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
export class ActService {
  private api: string;
  //private agencies: { [key: string]: string } = {};
  private actInfo = '';

  /**
   * @constructor
   * @param {ConfigService} configService - The configuration service.
   * @param {HttpClient} http - The HTTP client for making API requests.
   */
  constructor(private configService: ConfigService, public http: HttpClient) {}

  /**
   * Initialize the service by setting the API endpoint and refreshing agencies.
   * @asyncx
   */
  async init() {
    this.api = `${this.configService.config['API_LOCATION']}${this.configService.config['API_PATH']}`;
    await this.refreshAct().toPromise();
  }
  // public getActTitle(actCode: string): Promise<any> {
  //   if (!actCode) {
  //     throw Error('ActService - agencyCode - missing required code param');
  //   }

  //   const queryString = `actTitle/${actCode}`;
  //   return this.http.get<any>(`${this.apiService.pathAPI}/${queryString}`).toPromise();
  // }

   /**
   * Refresh the list of agencies from the API.
   * @returns {Observable<void>} An observable that completes when agencies are refreshed.
   */
   refreshAct(): Observable<void> {
    return new Observable<void>(observer => {
      let actCode = 'ACT_ERA'
      const apiEndpoint = `${this.api}/actTitle/${actCode}`;
      const getActTitle = this.http.get<{ [key: string]: string }>(apiEndpoint);

      getActTitle.subscribe(
        response => {
          // Data transformation to make the data easier to work with
          // const agencyList = {};
          // for (const record in response) {
          //   if (response.hasOwnProperty(record)) {
          //     agencyList[response[record]['agencyCode']] = response[record]['agencyName'];
          //   }
          // }
          this.actInfo = response['ACT_ERA'];
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
    getERA() {
      console.log('getERA>>>actInfo>>>' + JSON.stringify(this.actInfo) );
      return this.actInfo;
    }

  //   /**
  //  * Get the list of agencies.
  //  * @returns {Object} A dictionary of agency codes and names.
  //  */
  //   getAgencies(): { [key: string]: string } {
  //     return this.agencies;
  //   }
}
