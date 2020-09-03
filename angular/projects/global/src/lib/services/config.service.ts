import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

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
      this.configuration = await this.httpClient.get('api/config').toPromise();

      console.log('Configuration:', this.configuration);
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
