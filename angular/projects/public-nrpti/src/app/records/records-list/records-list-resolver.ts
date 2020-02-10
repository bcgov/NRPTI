import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { TableTemplateUtils, TableObject } from 'nrpti-angular-components';
import { FactoryService } from '../../services/factory.service';

@Injectable()
export class RecordsListResolver implements Resolve<Observable<object>> {
  constructor(public factoryService: FactoryService, public tableTemplateUtils: TableTemplateUtils) {}

  resolve(route: ActivatedRouteSnapshot): Observable<object> {
    const tableObject = this.tableTemplateUtils.updateTableObjectWithUrlParams(route.params, new TableObject());

    return this.factoryService.getRecords(
      '',
      [
        'OrderNRCED',
        'InspectionNRCED',
        'RestorativeJusticeNRCED',
        'AdministrativePenaltyNRCED',
        'AdministrativeSanctionNRCED',
        'TicketNRCED'
      ],
      [],
      tableObject.currentPage,
      tableObject.pageSize,
      tableObject.sortBy || '-_master.dateIssued', // This needs to be common between all datasets to work properly
      {},
      false
    );
  }
}
