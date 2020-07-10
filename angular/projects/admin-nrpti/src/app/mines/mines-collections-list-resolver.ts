import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { TableObject, TableTemplateUtils } from 'nrpti-angular-components';
import { Observable } from 'rxjs/Observable';
import { FactoryService } from '../services/factory.service';

@Injectable()
export class MinesCollectionsListResolver implements Resolve<Observable<object>> {
  constructor(private factoryService: FactoryService, private tableTemplateUtils: TableTemplateUtils) {}

  resolve(route: ActivatedRouteSnapshot): Observable<object> {
    // Get params from route, shove into the tableTemplateUtils so that we get a new dataset to work with.
    const tableObject = this.tableTemplateUtils.updateTableObjectWithUrlParams(route.params, new TableObject());

    // force-reload so we always have latest data
    return this.factoryService.getRecords(
      '',
      ['CollectionBCMI'],
      [],
      tableObject.currentPage,
      tableObject.pageSize,
      tableObject.sortBy || '-dateAdded',
      {},
      false,
      {},
      [],
      {}
    );
  }
}
