import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { TableTemplateUtils, TableObject } from 'nrpti-angular-components';
import { FactoryService } from '../../services/factory.service';
import { SchemaLists } from '../../../../../common/src/app/utils/record-constants';
import { RecordUtils } from '../utils/record-utils';

@Injectable()
export class RecordsListResolver implements Resolve<Observable<object>> {
  constructor(public factoryService: FactoryService, public tableTemplateUtils: TableTemplateUtils) { }

  resolve(route: ActivatedRouteSnapshot): Observable<object> {
    const params = { ...route.params };
    // set filters handled by table template
    const tableObject = this.tableTemplateUtils.updateTableObjectWithUrlParams(params, new TableObject());

    // set schema filters
    let schemaList = SchemaLists.nrcedPublicBasicRecordTypes;

    if (params.activityType) {
      schemaList = params.activityType.split(',');
    }

    let keywords = '';
    if (params.keywords) {
      keywords = params.keywords;
    }

    // This checks for the search parameter that was put in above along with an equal, for example q= or s=
    if (params.keywords) {
      window.snowplow('trackSiteSearch',
          [decodeURIComponent(params.keywords)]
      );
    }

    const filterParams = RecordUtils.buildFilterParams(params);

    // force-reload so we always have latest data
    return this.factoryService.getRecords(
      keywords,
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
