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
      schemaList = params.activityType.split(',');
    }

    let keywords = '';
    if (params.keywords) {
      keywords = params.keywords;
    }
    let subset = [];
    if (params.subset) {
      subset = params.subset.split(',');
    }


    const filterParams = {};

    if (params.dateRangeFromFilter) {
      filterParams['dateRangeFromFilterdateIssued'] = params.dateRangeFromFilter;
    }

    if (params.dateRangeToFilter) {
      filterParams['dateRangeToFilterdateIssued'] = params.dateRangeToFilter;
    }

    if (params.issuedToCompany && params.issuedToIndividual) {
      filterParams['issuedTo.type'] = 'Company,Individual,IndividualCombined';
    } else if (params.issuedToCompany) {
      filterParams['issuedTo.type'] = 'Company';
    } else if (params.issuedToIndividual) {
      filterParams['issuedTo.type'] = 'Individual,IndividualCombined';
    }

    if (params.agency) {
      filterParams['issuingAgency'] = params.agency;
    }

    if (params.act) {
      filterParams['legislation.act'] = params.act;
    }

    if (params.regulation) {
      filterParams['legislation.regulation'] = params.regulation;
    }

    if (params.sourceSystemRef) {
      filterParams['sourceSystemRef'] = params.sourceSystemRef;
    }

    // force-reload so we always have latest data
    return this.factoryService.getRecords(
      keywords,
      schemaList,
      [],
      tableObject.currentPage,
      tableObject.pageSize,
      tableObject.sortBy || '-dateAdded', // This needs to be common between all datasets to work properly
      {},
      false,
      filterParams,
      subset
    );
  }
}
