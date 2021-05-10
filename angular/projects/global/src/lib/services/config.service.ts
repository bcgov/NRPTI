import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class ConfigService {
  // defaults
  private configuration = {};

  constructor(
    private httpClient: HttpClient,
    public http: HttpClient
  ) { }

  /**
   * Initialize the Config Service.  Get configuration data from front-end build, or back-end if nginx
   * is configured to pass the /config endpoint to a dynamic service that returns JSON.
   */
  async init() {
    const application = window['__env']['APPLICATION'];
    try {
      // Attempt to get application via this.httpClient. This uses the url of the application that you are running it from
      // This will not work for local because it will try and get localhost:4200/api instead of 3000/api...
      this.configuration = await this.httpClient.get(`api/config/${application}`).toPromise();

      console.log('Configuration:', this.configuration);
      if (this.configuration['debugMode']) {
        console.log('Configuration:', this.configuration);
      }
    } catch (e) {
      console.log('Error getting configuration:', e);
      try {
        // This try is to attempt to get config in your local environment.
        // It will try and do a get on localhost:3000/api/config...
        const res = await this.http.get<any>(`http://localhost:3000/api/config/${application}`).toPromise();
        this.configuration = window['__env'];
        this.configuration = { ...this.configuration, ...res };
      } catch (error) {
        // If all else fails, use variables found in env.js of the application calling config service.
        this.configuration = window['__env'];
        console.log('Error getting local configuration:', error);
        if (this.configuration['debugMode']) {
          console.log('Configuration:', this.configuration);
        }
      }
    }
    return Promise.resolve();
  }

  get config(): any {
    return this.configuration;
  }

  public createConfigData(configData, application, pathAPI: string) {
    return this.httpClient.post(`${pathAPI}/config/${application}`, configData, {});
  }

  public editConfigData(configData, configId, application, pathAPI: string) {
    return this.httpClient.put(`${pathAPI}/config/${application}/${configId}`, configData, {});
  }
}
