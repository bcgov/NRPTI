import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { throwError, Observable } from 'rxjs';
import { ConfigService, LoggerService } from 'nrpti-angular-components';

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
  env: 'local' | 'dev' | 'test' | 'prod';

  constructor(
    public http: HttpClient,
    private configService: ConfigService,
    private logger: LoggerService
    ) {
      this.isMS = window.navigator.msSaveOrOpenBlob ? true : false;

      this.env     = this.configService.config['ENVIRONMENT'];

      this.pathAPI = this.configService.config['API_LOCATION']
                     + this.configService.config['API_PATH'];
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

    this.logger.log(`Server Error: ${errorMessage}`);
    return throwError(error);
  }
}
