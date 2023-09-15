import { Injectable } from '@angular/core';
import { ConfigService } from 'nrpti-angular-components';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
// import { Utils } from '../../../../global/src/lib/utils/utils';

@Injectable()
export class ApplicationAgencyService {
    private api: string;

    constructor(
        private configService: ConfigService,
        public http: HttpClient
    ) {}

    async init() {
        this.api = `${this.configService.config['API_LOCATION']}${this.configService.config['API_PATH']}`;

        // Start the initial agencies retrieval.
        await this.refreshAgencies().toPromise();
    }

    // ... Other methods ...
    refreshAgencies(): Observable<void> {
        return new Observable<void>(observer => {
            console.log("refreshAgencies here");

            // Construct the full API endpoint URL
            const apiEndpoint = `${this.api}/list-agencies`;

            // Make the HTTP GET request
            const getAgencies = this.http.get<any>(apiEndpoint);

            // Subscribe to the HTTP request and handle the response
            getAgencies.subscribe(
                (response) => {
                    // Update the agency list by calling the updateAgencyList function
                    // Utils.setAgencyList(response);

                    observer.next();
                    observer.complete();
                },
                (error) => {
                    console.error("HTTP Request Error: ", error);

                    // You can handle errors here if needed
                    // ...

                    // Notify the observer about the error
                    observer.error(error);
                }
            );
        });
    }
}
