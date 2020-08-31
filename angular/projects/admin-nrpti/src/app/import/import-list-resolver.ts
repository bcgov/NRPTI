import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';
import { TableTemplateUtils, TableObject } from 'nrpti-angular-components';
import { FactoryService } from '../services/factory.service';

@Injectable()
export class ImportListResolver implements Resolve<Observable<object>> {
  constructor(public tableTemplateUtils: TableTemplateUtils, public factoryService: FactoryService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<object> {
    // Get params from route, shove into the tableTemplateUtils so that we get a new dataset to work with.
    const tableObject = this.tableTemplateUtils.updateTableObjectWithUrlParams(route.params, new TableObject());

    // force-reload so we always have latest data
    return this.factoryService.searchService.getSearchResults(
      this.factoryService.apiService.pathAPI,
      '',
      ['Task'],
      [],
      tableObject.currentPage,
      tableObject.pageSize,
      tableObject.sortBy || '-startDate',
      {},
      false
    );
  }
}
