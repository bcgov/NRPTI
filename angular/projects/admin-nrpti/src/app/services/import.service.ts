import { Injectable } from '@angular/core';
import { SearchResult, ConfigService } from 'nrpti-angular-components';
import { BehaviorSubject, Observable } from 'rxjs';
import { FactoryService } from './factory.service';

@Injectable({
  providedIn: 'root'
})
export class ImportService {
  private data: BehaviorSubject<SearchResult>;
  private fetchDataConfig: any;

  constructor(private factoryService: FactoryService, configService: ConfigService) {
    this.data = new BehaviorSubject<SearchResult>(new SearchResult);
    this.fetchDataConfig = configService.config['DEFAULT_IMPORT_TABLE_QUERY_PARAMS'];
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
      res = await this.factoryService.searchService.getSearchResults(
        pathAPI,
        keys,
        dataset,
        fields,
        pageNum,
        pageSize,
        sortBy
      ).toPromise();
    } catch (error) {
      // TODO: Create error service handle errors
      console.log(error);
    }


    // tslint:disable-next-line: prefer-const
    let searchResult = new SearchResult();

    if (res && res[0] && res[0].data) {
      if (res[0].data.searchResults) {
        searchResult.data = res[0].data.searchResults;
      } else {
        searchResult.data = [];
      }
      if (res[0].data.meta[0].searchResultsTotal) {
        searchResult.totalSearchCount = res[0].data.meta[0].searchResultsTotal;
      } else {
        searchResult.totalSearchCount = 0;
      }
    } else {
      // TODO: Create error service handle errors
      console.log('Error: unable to get import table data.');
      searchResult.data = [];
      searchResult.totalSearchCount = 0;
    }
    this.setValue(searchResult);
  }
}
