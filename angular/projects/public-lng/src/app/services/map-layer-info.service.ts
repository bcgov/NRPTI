import { Injectable } from '@angular/core';
import { SearchService, SearchResult, ConfigService } from 'nrpti-angular-components';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MapLayerInfoService {
  private data: BehaviorSubject<SearchResult>;
  private fetchDataConfig: any;

  constructor(
    private configService: ConfigService, private searchService: SearchService
  ) {
    this.data = new BehaviorSubject<SearchResult>(new SearchResult);
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
      res = await this.searchService.getSearchResults(
        pathAPI,
        keys,
        dataset,
        fields,
        pageNum,
        pageSize,
        sortBy
      ).toPromise();
    } catch (error) {
        console.log(error);
    }


    // tslint:disable-next-line: prefer-const
    let searchResult = new SearchResult();

    if (res && res[0] && res[0].data) {
      if (res[0].data.searchResults) {
        searchResult.data = res[0].data.searchResults;
      } else {
        console.log('Search results were empty.', res);
    }
      if (res[0].data.meta[0] && res[0].data.meta[0].searchResultsTotal) {
        searchResult.totalSearchCount = res[0].data.meta[0].searchResultsTotal;
      } else {
        console.log('Search results count was not returned.', res, searchResult.totalSearchCount);
      }
    } else {
        console.log('No data was returned from the server', res);
    }
    this.setValue(searchResult);
  }
}
