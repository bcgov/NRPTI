import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { throwError, Observable } from 'rxjs';

/**
 * TODO: populate this documentation
 *
 * @export
 * @class ApiService
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  public token: string;
  public isMS: boolean; // IE, Edge, etc

  pathAPI: string;
  env: 'local' | 'dev' | 'test' | 'master' | 'prod';

  constructor(public http: HttpClient) {
    const { hostname } = window.location;
    this.isMS = window.navigator.msSaveOrOpenBlob ? true : false;

    switch (hostname) {
      case 'localhost':
        // Local
        this.pathAPI = 'http://localhost:3000/api';
        this.env = 'local';
        break;

      case 'admin-nrpti-dev.pathfinder.gov.bc.ca':
        // Dev
        this.pathAPI = 'https://nrpti-dev.pathfinder.gov.bc.ca/api';
        this.env = 'dev';
        break;

      case 'admin-nrpti-test.pathfinder.gov.bc.ca':
        // Test
        this.pathAPI = 'https://nrpti-test.pathfinder.gov.bc.ca/api';
        this.env = 'test';
        break;

      default:
        // Prod
        this.pathAPI = 'https://nrpti.nrs.gov.bc.ca/api';
        this.env = 'prod';
    }
  }

  /**
   * General error handler.  Used to transform and log error messages before throwing.
   *
   * @param {*} error
   * @returns {Observable<never>}
   * @memberof ApiService
   */
  handleError(error: any): Observable<never> {
    let errorMessage = 'Unknown Server Error';

    if (error) {
      if (error.message) {
        if (error.error) {
          errorMessage = `${error.message} - ${error.error.message}`;
        } else {
          errorMessage = error.message;
        }
      } else if (error.status) {
        errorMessage = `${error.status} - ${error.statusText}`;
      }
    }

    console.log('Server Error:', errorMessage);
    return throwError(error);
  }
}
