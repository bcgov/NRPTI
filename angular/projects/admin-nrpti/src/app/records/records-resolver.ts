import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { TableTemplateUtils, TableObject } from 'nrpti-angular-components';
import { FactoryService } from '../services/factory.service';

@Injectable()
export class RecordsResolver implements Resolve<Observable<object>> {
  constructor(private factoryService: FactoryService, private tableTemplateUtils: TableTemplateUtils) { }

  resolve(route: ActivatedRouteSnapshot): Observable<object> {
    const params = { ...route.params };
    // Get params from route, shove into the tableTemplateUtils so that we get a new dataset to work with.
    const tableObject = this.tableTemplateUtils.updateTableObjectWithUrlParams(route.params, new TableObject());

    delete params.sortBy;
    delete params.currentPage;
    delete params.pageSize;
    delete params.filter;
    delete params.keywords;
    delete params.dataset;
    delete params.ms;
    delete params.subset;


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


    if (params.activityType) {
      schemaList = params.activityType;
    }

    delete params.activityType;

    const filterParams = { ...params };

    if (filterParams._schemaName) {
      schemaList = filterParams._schemaName;
    }

    if (filterParams.dateRangeFromFilter) {
      filterParams['dateRangeFromFilterdateIssued'] = filterParams.dateRangeFromFilter;
    }

    if (filterParams.dateRangeToFilter) {
      filterParams['dateRangeToFilterdateIssued'] = filterParams.dateRangeToFilter;
    }

    if (filterParams.issuedToCompany && filterParams.issuedToIndividual) {
      filterParams['issuedTo.type'] = 'Company,Individual,IndividualCombined';
    } else if (filterParams.issuedToCompany) {
      filterParams['issuedTo.type'] = 'Company';
    } else if (filterParams.issuedToIndividual) {
      filterParams['issuedTo.type'] = 'Individual,IndividualCombined';
    }

    if (filterParams.agency) {
      filterParams['issuingAgency'] = filterParams.agency;
    }

    if (filterParams.act) {
      filterParams['legislation.act'] = filterParams.act;
    }

    if (filterParams.regulation) {
      filterParams['legislation.regulation'] = filterParams.regulation;
    }

    delete filterParams.dateRangeToFilter;
    delete filterParams.dateRangeFromFilter;
    delete filterParams.issuedToCompany;
    delete filterParams.issuedToIndividual;
    delete filterParams.agency;
    delete filterParams.act;
    delete filterParams.regulation;

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
