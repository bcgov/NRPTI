import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { TableTemplateUtils, TableObject } from 'nrpti-angular-components';
import { FactoryService } from '../../services/factory.service';

@Injectable()
export class RecordsListResolver implements Resolve<Observable<object>> {
  constructor(public factoryService: FactoryService, public tableTemplateUtils: TableTemplateUtils) {}

  resolve(route: ActivatedRouteSnapshot): Observable<object> {
    const params = { ...route.params };
    // set filters handled by table template
    const tableObject = this.tableTemplateUtils.updateTableObjectWithUrlParams(params, new TableObject());

    delete params.sortBy;
    delete params.currentPage;
    delete params.pageSize;
    delete params.filter;
    delete params.keywords;
    delete params.dataset;
    delete params.ms;

    // set schema filters
    let schemaList = [
      // default schemas when no filters specified
      'OrderNRCED',
      'InspectionNRCED',
      'RestorativeJusticeNRCED',
      'AdministrativePenaltyNRCED',
      'AdministrativeSanctionNRCED',
      'TicketNRCED',
      'WarningNRCED',
      'CourtConvictionNRCED'
    ];

    if (params.activityType) {
      schemaList = params.activityType;
    }

    delete params.activityType;

    // set remaining filters
    const filterParams = { ...params };

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

    // also delete any other non-standard filters
    delete filterParams.filter;
    delete filterParams.queryModifier;

    return this.factoryService.getRecords(
      tableObject.keywords,
      schemaList,
      [],
      tableObject.currentPage,
      tableObject.pageSize,
      tableObject.sortBy || '-dateIssued', // This needs to be common between all datasets to work properly
      {},
      false,
      filterParams
    );
  }
}
