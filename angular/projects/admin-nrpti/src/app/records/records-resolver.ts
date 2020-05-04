import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { TableTemplateUtils, TableObject } from 'nrpti-angular-components';
import { FactoryService } from '../services/factory.service';

@Injectable()
export class RecordsResolver implements Resolve<Observable<object>> {
  constructor(private factoryService: FactoryService, private tableTemplateUtils: TableTemplateUtils) { }

  resolve(route: ActivatedRouteSnapshot): Observable<object> {
    // Get params from route, shove into the tableTemplateUtils so that we get a new dataset to work with.
    const tableObject = this.tableTemplateUtils.updateTableObjectWithUrlParams(route.params, new TableObject());

    let schemaList = [
      'Order',
      'Inspection',
      'Certificate',
      'Permit',
      'SelfReport',
      'Agreement',
      'RestorativeJustice',
      'Ticket',
      'AdministrativePenalty',
      'AdministrativeSanction',
      'Warning',
      'ConstructionPlan',
      'ManagementPlan',
      'CourtConviction'
    ];

    // If _schemaName was filter criteria, use that instead of the default list.
    const filterParams = { ...route.params };

    // Clear out all the standard table template params
    delete filterParams.sortBy;
    delete filterParams.currentPage;
    delete filterParams.pageSize;
    delete filterParams.filter;
    delete filterParams.keywords;
    delete filterParams.dataset;
    delete filterParams.ms;
    delete filterParams.subset;

    if (filterParams._schemaName) {
      schemaList = filterParams._schemaName;
    }

    if (filterParams.dateRangeFromFilter) {
      filterParams['dateRangeFromFilterdateIssued'] = filterParams.dateRangeFromFilter;
    }
    if (filterParams.dateRangeToFilter) {
      filterParams['dateRangeToFilterdateIssued'] = filterParams.dateRangeToFilter;
    }
    delete filterParams.dateRangeFromFilter;
    delete filterParams.dateRangeToFilter;
    delete filterParams._schemaName;

    // force-reload so we always have latest data
    return this.factoryService.getRecords(
      tableObject.keywords,
      schemaList,
      [],
      tableObject.currentPage,
      tableObject.pageSize,
      tableObject.sortBy || '-dateAdded', // This needs to be common between all datasets to work properly
      {},
      false,
      filterParams,
      tableObject.subset
    );
  }
}
