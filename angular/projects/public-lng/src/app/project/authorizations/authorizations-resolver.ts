import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { TableTemplateUtils, TableObject, SearchService } from 'nrpti-angular-components';
import { ApiService } from '../../services/api';

@Injectable()
export class AuthorizationsResolver implements Resolve<Observable<object>> {
  constructor(
    public tableTemplateUtils: TableTemplateUtils,
    public _searchService: SearchService,
    private _apiService: ApiService
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<object> {
    // Get params from route, shove into the tableTemplateUtils so that we get a new dataset to work with.
    const tableObject = this.tableTemplateUtils.updateTableObjectWithUrlParams(route.params, new TableObject());

    const project = this._apiService.getProjectObjectId(route.parent.url[1].path);

    // tslint:disable-next-line: prefer-const
    const filterParams = { ...route.params };

    // Clear out all the standard table template params
    delete filterParams.sortBy;
    delete filterParams.currentPage;
    delete filterParams.pageSize;
    delete filterParams.filter;
    delete filterParams.keywords;
    delete filterParams.dataset;
    delete filterParams.ms;

    if (filterParams.dateRangeFromFilter) {
      filterParams['dateRangeFromFilterdateIssued'] = filterParams.dateRangeFromFilter;
    }
    if (filterParams.dateRangeToFilter) {
      filterParams['dateRangeToFilterdateIssued'] = filterParams.dateRangeToFilter;
    }
    delete filterParams.dateRangeFromFilter;
    delete filterParams.dateRangeToFilter;

    return this._searchService.getSearchResults(
      this._apiService.apiPath,
      '',
      ['CertificateLNG', 'PermitLNG'],
      [],
      tableObject.currentPage,
      tableObject.pageSize,
      tableObject.sortBy || '-dateIssued', // This needs to be common between both datasets to work properly
      {
        _epicProjectId: project
      },
      true,
      filterParams
    );
  }
}
