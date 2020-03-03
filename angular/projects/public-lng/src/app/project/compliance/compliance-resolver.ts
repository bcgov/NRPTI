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

    const project = this._apiService.getProjectObjectId(route.parent.url[1].path);

    // tslint:disable-next-line: prefer-const
    let filterParams = { ...route.params };

    // Clear out all the standard table template params
    delete filterParams.sortBy;
    delete filterParams.currentPage;
    delete filterParams.pageSize;
    delete filterParams.filter;
    delete filterParams.keywords;
    delete filterParams.dataset;
    delete filterParams.ms;

    if (filterParams.dateRangeFromFilter) {
      filterParams['_master.dateRangeFromFilterdateIssued'] = filterParams.dateRangeFromFilter;
    }
    if (filterParams.dateRangeToFilter) {
      filterParams['_master.dateRangeToFilterdateIssued'] = filterParams.dateRangeToFilter;
    }
    delete filterParams.dateRangeFromFilter;
    delete filterParams.dateRangeToFilter;

    return this._searchService.getSearchResults(
      this._apiService.apiPath,
      '',
      [
        'InspectionLNG',
        'OrderLNG',
        'SelfReportLNG',
        'TicketLNG',
        'CourtConvictionLNG',
        'AdministrativePenaltyLNG',
        'AdministrativeSanctionLNG',
        'RestorativeJusticeLNG',
        'WarningLNG'
      ],
      [],
      tableObject.currentPage,
      tableObject.pageSize,
      tableObject.sortBy || '-_master.dateIssued', // This needs to be common between both datasets to work properly
      {
        '_master._epicProjectId': project
      },
      false,
      filterParams
    );
  }
}
