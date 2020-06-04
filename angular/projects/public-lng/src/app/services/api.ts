import { Injectable } from '@angular/core';

import { Observable, throwError } from 'rxjs';

@Injectable()
export class ApiService {
  // public token: string;
  public isMS: boolean; // IE, Edge, etc
  public apiPath: string;
  public adminUrl: string;
  public env: 'local' | 'dev' | 'test' | 'demo' | 'scale' | 'beta' | 'master' | 'prod';

  constructor() {
    this.isMS = window.navigator.msSaveOrOpenBlob ? true : false;
    const { hostname } = window.location;
    switch (hostname) {
      // This needs to change according to: https://github.com/bcgov/NRPTI/issues/25

      case 'localhost':
        // Local
        this.apiPath = 'http://localhost:3000/api/public';
        this.adminUrl = 'http://localhost:4200';
        this.env = 'local';
        break;

      case 'public-lng-dev.pathfinder.gov.bc.ca':
        // Dev
        this.apiPath = 'https://nrpti-dev.pathfinder.gov.bc.ca/api/public';
        this.adminUrl = 'https://admin-nrpti-dev.pathfinder.gov.bc.ca/';
        this.env = 'dev';
        break;

      case 'public-lng-test.pathfinder.gov.bc.ca':
        // Test
        this.apiPath = 'https://nrpti-test.pathfinder.gov.bc.ca/api/public';
        this.adminUrl = 'https://admin-nrpti-test.pathfinder.gov.bc.ca/';
        this.env = 'test';
        break;

      default:
        // Prod
        this.apiPath = 'https://nrpti-prod.pathfinder.gov.bc.ca/api/public';
        this.adminUrl = 'https://nrpti-prod.pathfinder.gov.bc.ca/api/';
        this.env = 'prod';
    }
  }

  getProjectObjectId(value: string) {
    try {
      if (value === '1') {
        return '588510cdaaecd9001b815f84'; // LNG Canada
      } else {
        return '588511c4aaecd9001b825604'; // Coastal Gaslink
      }
    } catch (e) {
      console.log('error:', e);
      return '';
    }
  }

  handleError(error: any): Observable<never> {
    const reason = error.message
      ? error.message
      : error.status
      ? `${error.status} - ${error.statusText}`
      : 'Server error';
    console.log('API error:', reason);
    return throwError(error);
  }
}
