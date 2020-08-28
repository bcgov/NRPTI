import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, mapTo } from 'rxjs/operators';

@Injectable()
export class ConfigService {
  // defaults
  private configuration = { };

  constructor(private httpClient: HttpClient) { }

  /**
   * Initialize the Config Service.  Get configuration data from front-end build, or back-end if nginx
   * is configured to pass the /config endpoint to a dynamic service that returns JSON.
   */
  async init() {
    try {
      this.configuration = await this.httpClient.get('config')
        .pipe(
          tap((configuration: any) => this.configuration = configuration),
          mapTo(undefined),
        ).toPromise();
      if (this.configuration['debugMode']) {
        console.log('Configuration:', this.configuration);
      }
    } catch (e) {
      // Not configured
      console.log('Error getting configuration:', e);
      this.configuration = window['__env'];
      if (this.configuration['debugMode']) {
        console.log('Configuration:', this.configuration);
      }
    }
    return Promise.resolve();
  }

  get config(): any {
    return this.configuration;
  }
}
