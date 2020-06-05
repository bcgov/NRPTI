import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { TableTemplateUtils, TableObject } from 'nrpti-angular-components';
import { FactoryService } from '../services/factory.service';

@Injectable()
export class MinesListResolver implements Resolve<Observable<object>> {
  constructor(private factoryService: FactoryService, private tableTemplateUtils: TableTemplateUtils) {}

  resolve(route: ActivatedRouteSnapshot): Observable<object> {
    const tableObject = this.tableTemplateUtils.updateTableObjectWithUrlParams(route.params, new TableObject());

    return this.factoryService.getRecords(
      '',
      ['Mine'],
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
