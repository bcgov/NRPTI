import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { TableTemplateUtils, TableObject } from 'nrpti-angular-components';
import { FactoryService } from '../services/factory.service';

@Injectable()
export class EnforcementActionsResolver implements Resolve<Observable<object>> {
  constructor(private factoryService: FactoryService, private tableTemplateUtils: TableTemplateUtils) {}

  resolve(route: ActivatedRouteSnapshot): Observable<object> {
    const tableObject = this.tableTemplateUtils.updateTableObjectWithUrlParams(route.params, new TableObject());
    const params = { ...route.params};
    const and = {};

    const schemaList = ['CourtConviction', 'AdministrativePenalty'];

    and['issuingAgency'] = 'EMLI';

    let keywords = '';
    if (params && params.keywords) {
      keywords = route.params.keywords;
    }

    return this.factoryService.getRecords(
      keywords,
      schemaList,
      [],
      tableObject.currentPage,
      tableObject.pageSize,
      tableObject.sortBy || '-dateAdded',
      and,
      true,
      {},
      []
    );
  }
}
