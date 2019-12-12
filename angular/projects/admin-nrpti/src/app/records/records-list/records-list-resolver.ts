import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';
import { TableTemplateUtils, TableObject, SearchService } from 'nrpti-angular-components';

@Injectable()
export class RecordsListResolver implements Resolve<Observable<object>> {
  constructor(private searchService: SearchService, private tableTemplateUtils: TableTemplateUtils) {}

  resolve(route: ActivatedRouteSnapshot): Observable<object> {
    // Get params from route, shove into the tableTemplateUtils so that we get a new dataset to work with.
    const tableObject = this.tableTemplateUtils.updateTableObjectWithUrlParams(route.params, new TableObject());

    // force-reload so we always have latest data
    return this.searchService.getSearchResults(
      'http://localhost:3000/api',
      '',
      'Record',
      [],
      tableObject.currentPage,
      tableObject.pageSize,
      tableObject.sortBy,
      {},
      false
    );
  }
}
