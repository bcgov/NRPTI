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
 * @description Service for serving up-to-date map of actCode to actName and regulations.
 */
@Injectable({
  providedIn: 'root'
})
export class ActService {
  private api: string;
  private actsRegulationsData = {};

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
   * Initialize the service by setting the API endpoint and refreshing acts.
   * @async
   */
  async init() {
    this.api = `${this.configService.config['API_LOCATION']}${this.configService.config['API_PATH']}`;
    await this.refreshAct().toPromise();
  }
  /**
   * Refresh the map of actCodes from the API.
   * @returns {Observable<void>} An observable that completes when acts are refreshed.
   */
  refreshAct(): Observable<void> {
    return new Observable<void>(observer => {
      const apiEndpoint = `${this.api}/acts-regulations`;
      const getActsRegulationsURL = this.http.get<{ [key: string]: string }>(apiEndpoint);

      getActsRegulationsURL.subscribe(
        response => {
          this.actsRegulationsData = response;

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
   * Get the list of acts and regualtions mapped to an actCode.
   * @returns {Object} A dictionary of act codes, names, and regulations.
   */
  getAllActsAndRegulations() {
    return this.actsRegulationsData;
  }
}
