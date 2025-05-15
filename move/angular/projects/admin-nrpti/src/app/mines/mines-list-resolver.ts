import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { TableTemplateUtils, TableObject } from 'nrpti-angular-components';
import { FactoryService } from '../services/factory.service';

@Injectable()
export class MinesListResolver implements Resolve<Observable<object>> {
  constructor(
    private factoryService: FactoryService,
    private tableTemplateUtils: TableTemplateUtils
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<object> {
    const tableObject = this.tableTemplateUtils.updateTableObjectWithUrlParams(route.params, new TableObject());

    let keywords = '';
    if (route.params && route.params.keywords) {
      keywords = route.params.keywords;
    }

    return this.factoryService.getRecords(
      keywords,
      ['MineBCMI'],
      [],
      tableObject.currentPage,
      tableObject.pageSize,
      tableObject.sortBy || '+name',
      {},
      false,
      {},
      []
    );
  }
}
