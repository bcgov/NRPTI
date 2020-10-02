import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { TableTemplateUtils, TableObject } from 'nrpti-angular-components';
import { FactoryService } from '../services/factory.service';
import { SchemaLists } from '../../../../common/src/app/utils/record-constants';

@Injectable()
export class MinesRecordsListResolver implements Resolve<Observable<object>> {
  constructor(private factoryService: FactoryService, private tableTemplateUtils: TableTemplateUtils) { }

  resolve(route: ActivatedRouteSnapshot): Observable<object> {
    const params = { ...route.params };
    // Get params from route, shove into the tableTemplateUtils so that we get a new dataset to work with.
    const tableObject = this.tableTemplateUtils.updateTableObjectWithUrlParams(route.params, new TableObject());

    let schemaList = SchemaLists.bcmiRecordTypes;

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

    const and = {
      mineGuid: null
    };
    const or = {};
    const nor = {};

    // fetch the mine from the parent resolver so we can get the sourceRefId

    if (route.parent && route.parent.data && route.parent.data.mine) {
      const mineResult = route.parent.data.mine;
      and.mineGuid = mineResult[0].data._sourceRefId;
    }

    if (params.dateRangeFromFilter) {
      or['dateRangeFromFilterdateIssued'] = params.dateRangeFromFilter;
    }

    if (params.dateRangeToFilter) {
      or['dateRangeToFilterdateIssued'] = params.dateRangeToFilter;
    }

    if (params.agency) {
      or['issuingAgency'] = params.agency;
    }

    if (params.sourceSystemRef) {
      or['sourceSystemRef'] = params.sourceSystemRef;
    }

    if (params.isBcmiPublished) {
      or['isPublished'] = params.isBcmiPublished;
    }

    if (params.hasCollection) {
      or['hasCollection'] = params.hasCollection;
    }

    // force-reload so we always have latest data
    return this.factoryService.getRecords(
      keywords,
      schemaList,
      [],
      tableObject.currentPage,
      tableObject.pageSize,
      tableObject.sortBy || '-dateAdded', // This needs to be common between all datasets to work properly
      and,
      true,
      or,
      subset,
      nor
    );
  }
}
