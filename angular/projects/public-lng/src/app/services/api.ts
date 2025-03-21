import { Injectable } from '@angular/core';

import { Observable, throwError } from 'rxjs';
import { ConfigService, LoggerService } from 'nrpti-angular-components';

@Injectable()
export class ApiService {
  // public token: string;
  public isMS: boolean; // IE, Edge, etc
  public apiPath: string;
  public env: 'local' | 'dev' | 'test' | 'prod';

  constructor(
    private configService: ConfigService,
    private logger: LoggerService
  ) {
    this.isMS = (window.navigator as any).msSaveOrOpenBlob ? true : false;

    this.env = this.configService.config['ENVIRONMENT'];
    this.apiPath = this.configService.config['API_LOCATION'] + this.configService.config['API_PUBLIC_PATH'];
  }

  getProjectObjectId(value: string) {
    try {
      if (value === '1') {
        return '588511d0aaecd9001b826192'; // LNG Canada
      } else {
        return '588511c4aaecd9001b825604'; // Coastal Gaslink
      }
    } catch (e) {
      this.logger.log(e);
      return '';
    }
  }

  handleError(error: any): Observable<never> {
    const reason = error.message
      ? error.message
      : error.status
      ? `${error.status} - ${error.statusText}`
      : 'Server error';
    this.logger.log(`API error: ${reason}`);
    return throwError(error);
  }
}
