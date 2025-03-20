import { Injectable } from '@angular/core';
import { SearchResult, ConfigService } from 'nrpti-angular-components';
import { BehaviorSubject, Observable } from 'rxjs';
import { EventObject, EventService, EventKeywords } from './event.service';
import { FactoryService } from './factory.service';

@Injectable({
  providedIn: 'root'
})
export class ImportService {
  private data: BehaviorSubject<SearchResult>;
  private fetchDataConfig: any;

  constructor(
    private factoryService: FactoryService,
    private configService: ConfigService,
    private eventService: EventService
  ) {
    this.data = new BehaviorSubject<SearchResult>(new SearchResult());
    this.fetchDataConfig = this.configService.config['DEFAULT_IMPORT_TABLE_QUERY_PARAMS'];
  }

  setValue(value): void {
    this.data.next(value);
  }

  getValue(): Observable<SearchResult> {
    return this.data.asObservable();
  }

  async refreshData() {
    await this.fetchData(
      this.fetchDataConfig.pathAPI,
      this.fetchDataConfig.keys,
      this.fetchDataConfig.dataset,
      this.fetchDataConfig.fields,
      this.fetchDataConfig.pageNum,
      this.fetchDataConfig.pageSize,
      this.fetchDataConfig.sortBy
    );
  }

  async fetchData(
    pathAPI: string,
    keys: string,
    dataset: string[],
    fields: any[],
    pageNum: number = 1,
    pageSize: number = 20,
    sortBy: string = null
  ) {
    // Caching for later
    this.fetchDataConfig = {
      pathAPI: pathAPI,
      keys: keys,
      dataset: dataset,
      fields: fields,
      pageNum: pageNum,
      pageSize: pageSize,
      sortBy: sortBy
    };

    let res = null;
    try {
      res = await this.factoryService.searchService
        .getSearchResults(pathAPI, keys, dataset, fields, pageNum, pageSize, sortBy)
        .toPromise();
    } catch (error) {
      this.eventService.setError(new EventObject(EventKeywords.ERROR, error, 'Import Service'));
    }

    // tslint:disable-next-line: prefer-const
    const searchResult = new SearchResult();

    if (res && res[0] && res[0].data) {
      if (res[0].data.searchResults) {
        searchResult.data = res[0].data.searchResults;
      } else {
        this.eventService.setError(
          new EventObject(EventKeywords.ERROR, 'Search results were empty.', 'Import Service')
        );
      }
      if (res[0].data.meta[0] && res[0].data.meta[0].searchResultsTotal) {
        searchResult.totalSearchCount = res[0].data.meta[0].searchResultsTotal;
      } else {
        this.eventService.setError(
          new EventObject(EventKeywords.ERROR, 'Total search results count was not returned.', 'Import Service')
        );
      }
    } else {
      this.eventService.setError(
        new EventObject(EventKeywords.ERROR, 'No data was returned from the server.', 'Import Service')
      );
    }
    this.setValue(searchResult);
  }
}
