import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { TableTemplateUtils, TableObject } from 'nrpti-angular-components';
import { FactoryService } from '../../services/factory.service';

@Injectable()
export class RecordsListResolver implements Resolve<Observable<object>> {
  constructor(public factoryService: FactoryService, public tableTemplateUtils: TableTemplateUtils) { }

  resolve(route: ActivatedRouteSnapshot): Observable<object> {
    const params = { ...route.params };
    // set filters handled by table template
    const tableObject = this.tableTemplateUtils.updateTableObjectWithUrlParams(params, new TableObject());

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
      schemaList = params.activityType.split(',');
    }

    let keywords = '';
    if (params.keywords) {
      keywords = params.keywords;
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
      filterParams
    );
  }
}
