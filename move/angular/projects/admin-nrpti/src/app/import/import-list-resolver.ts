import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { TableTemplateUtils, TableObject } from 'nrpti-angular-components';
import { FactoryService } from '../services/factory.service';
import { ImportService } from '../services/import.service';

@Injectable()
export class ImportListResolver implements Resolve<void> {
  constructor(
    public tableTemplateUtils: TableTemplateUtils,
    private importService: ImportService,
    private factoryService: FactoryService
  ) {}

  async resolve(route: ActivatedRouteSnapshot) {
    // Get params from route, shove into the tableTemplateUtils so that we get a new dataset to work with.
    const tableObject = this.tableTemplateUtils.updateTableObjectWithUrlParams(route.params, new TableObject());

    await this.importService.fetchData(
      this.factoryService.apiService.pathAPI,
      '',
      ['Task'],
      [],
      tableObject.currentPage,
      tableObject.pageSize,
      tableObject.sortBy || '-startDate'
    );
  }
}
