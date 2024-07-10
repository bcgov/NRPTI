import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { TableObject, TableTemplateUtils } from 'nrpti-angular-components';
import { Observable } from 'rxjs/Observable';
import { FactoryService } from '../services/factory.service';

@Injectable()
export class MinesCollectionsListResolver implements Resolve<Observable<object>> {
  constructor(private factoryService: FactoryService, private tableTemplateUtils: TableTemplateUtils) {}

  resolve(route: ActivatedRouteSnapshot): Observable<object> {
    const params = { ...route.params };

    // Get params from route, shove into the tableTemplateUtils so that we get a new dataset to work with.
    const tableObject = this.tableTemplateUtils.updateTableObjectWithUrlParams(route.params, new TableObject());

    let keywords = '';
    if (params.keywords) {
      keywords = params.keywords;
    }

    const and = {};
    const or = {};
    const nor = {};

    if (params.isBcmiPublished) {
      or['isBcmiPublished'] = params.isBcmiPublished;
    }

    if (params.dateRangeFromFilter) {
      or['dateRangeFromFilterdate'] = params.dateRangeFromFilter;
    }

    if (params.dateRangeToFilter) {
      or['dateRangeToFilterdate'] = params.dateRangeToFilter;
    }

    if (params.hasRecords) {
      or['hasRecords'] = params.hasRecords;
    }

    // This should always be set.
    if (params.mineId) {
      and['project'] = params.mineId;
    }

    if (params.type) {
      or['type'] = params.type.join(',');
    }

    if (params.agency) {
      or['agency'] = params.agency.join(',');
    }

    if (params.bcmiTabType) {
      if (!or['type']) {
        or['type'] = '';
      }

      if (params.bcmiTabType.includes('Authorizations')) {
        or['type'] += 'Amalgamated Permit,Permit,Permit Amendment,Certificate,Certificate Amendment';
      }

      if (params.bcmiTabType.includes('Compliance Oversight')) {
        or['type'] += 'Order,Inspection Report';
      }

      if (params.bcmiTabType.includes('Other')) {
        or['type'] +=
          'Report,Annual Report,Letter of Assurance,Dam Safety Inspection,Management Plan, Compliance Self Report';
      }

      if (or['type'] === '') {
        delete or['type'];
      }
    }

    // force-reload so we always have latest data
    return this.factoryService.getRecords(
      keywords,
      ['CollectionBCMI'],
      [],
      tableObject.currentPage,
      tableObject.pageSize,
      tableObject.sortBy || '-dateAdded',
      and,
      false,
      or,
      [],
      nor
    );
  }
}
