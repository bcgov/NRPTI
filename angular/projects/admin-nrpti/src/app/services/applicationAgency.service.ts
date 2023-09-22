import { Injectable } from '@angular/core';
import { ConfigService } from 'nrpti-angular-components';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class ApplicationAgencyService {
    private api: string;
    private agencies: { [key: string]: string } = {};

    constructor(
        private configService: ConfigService,
        public http: HttpClient
    ) {}

    async init() {
        this.api = `${this.configService.config['API_LOCATION']}${this.configService.config['API_PATH']}`;
        await this.refreshAgencies().toPromise();
    }

    refreshAgencies(): Observable<void> {
        return new Observable<void>(observer => {
            const apiEndpoint = `${this.api}/list-agencies`;
            const getAgencies = this.http.get<{ [key: string]: string }>(apiEndpoint);

            getAgencies.subscribe(
                (response) => {
                    // Data transformation to make the data easier to work with
                    const agencyList = {}
                    for (const record in response) {
                        agencyList[response[record]["agencyCode"]] = response[record]["agencyName"]
                    }
                    this.agencies = agencyList;

                    observer.next();
                    observer.complete();
                },
                (error) => {
                    console.error("HTTP Request Error: ", error);
                    observer.error(error);
                }
            );
        });
    }

    getAgencies(): { [key: string]: string } {
        return this.agencies;
    }
}
