import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';
import { TableTemplateUtils, TableObject, SearchService } from 'nrpti-angular-components';
import { ApiService } from '../../services/api';

@Injectable()
export class ComplianceResolver implements Resolve<Observable<object>> {
  constructor(
    public tableTemplateUtils: TableTemplateUtils,
    public _searchService: SearchService,
    private _apiService: ApiService
    ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<object> {
    // Get params from route, shove into the tableTemplateUtils so that we get a new dataset to work with.
    const tableObject = this.tableTemplateUtils.updateTableObjectWithUrlParams(route.params, new TableObject());

    let project = '0';
    try {
      project = route.parent.url[1].path;
    } catch (e) {
      console.log('error:', e);
    }

    return this._searchService
      .getSearchResults(
        this._apiService.apiPath,
        '',
        ['OrderLNG'],
        [],
        tableObject.currentPage,
        tableObject.pageSize,
        tableObject.sortBy || '-documentDate', // This needs to be common between both datasets to work properly
        {
          project: project
        },
        false
      );
  }
}
