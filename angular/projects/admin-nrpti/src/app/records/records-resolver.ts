import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { TableTemplateUtils, TableObject } from 'nrpti-angular-components';
import { FactoryService } from '../services/factory.service';
import { EpicProjectIds, SchemaLists } from '../../../../common/src/app/utils/record-constants';
import { ActDataServiceNRPTI } from '../../../../global/src/lib/utils/act-data-service-nrpti';

@Injectable()
export class RecordsResolver implements Resolve<Observable<object>> {
  constructor(private factoryService: FactoryService, private tableTemplateUtils: TableTemplateUtils) {}

  resolve(route: ActivatedRouteSnapshot): Observable<object> {
    const params = { ...route.params };
    // Get params from route, shove into the tableTemplateUtils so that we get a new dataset to work with.
    const tableObject = this.tableTemplateUtils.updateTableObjectWithUrlParams(route.params, new TableObject());

    let schemaList = SchemaLists.allBasicRecordTypes;

    if (params.activityType) {
      schemaList = params.activityType.split(',');
    }
    console.log('************** Records-resolver params *****************');
    console.log(params);
    let keywords = '';
    if (params.keywords) {
      keywords = params.keywords;
    }
    let subset = [];
    if (params.subset) {
      subset = params.subset.split(',');
    }

    const and = {};
    const or = {};
    const nor = {};

    if (params.dateRangeFromFilter) {
      or['dateRangeFromFilterdateIssued'] = params.dateRangeFromFilter;
    }

    if (params.dateRangeToFilter) {
      or['dateRangeToFilterdateIssued'] = params.dateRangeToFilter;
    }

    if (params.issuedToCompany && params.issuedToIndividual) {
      or['issuedTo.type'] = 'Company,Individual,IndividualCombined';
    } else if (params.issuedToCompany) {
      or['issuedTo.type'] = 'Company';
    } else if (params.issuedToIndividual) {
      or['issuedTo.type'] = 'Individual,IndividualCombined';
    }

    if (params.agency) {
      or['issuingAgency'] = params.agency;
    }

    if (params.act) {
      or['legislation.act'] = params.act;
      // adds the actCode associated with each act to the query obj
      const dataservice = new ActDataServiceNRPTI(this.factoryService);
      const actList = params.act.split(',');
      actList.forEach(actName => {
        const actCode = dataservice.getCodeFromTitle(actName);
        if (actCode) {
          or['legislation.act'] += ',' + actCode;
        }
      });
    }

    if (params.regulation) {
      or['legislation.regulation'] = params.regulation;
    }

    if (params.sourceSystemRef) {
      or['sourceSystemRef'] = params.sourceSystemRef;
    }

    if (params.hasDocuments) {
      or['hasDocuments'] = params.hasDocuments;
    }

    if (params.projects) {
      const projectIds = [];

      if (params.projects.includes('lngCanada')) {
        projectIds.push(EpicProjectIds.lngCanadaId);
      }

      if (params.projects.includes('coastalGaslink')) {
        projectIds.push(EpicProjectIds.coastalGaslinkId);
      }

      if (params.projects.includes('otherProjects')) {
        if (projectIds.length === 0) {
          // Selecting only Other should return all projects EXCEPT for LNG Canada and Coastal Gaslink
          nor['_epicProjectId'] = `${EpicProjectIds.lngCanadaId},${EpicProjectIds.coastalGaslinkId}`;
        } else if (projectIds.length === 1) {
          if (projectIds[0] === EpicProjectIds.lngCanadaId) {
            // Other + LNG Canada is equivalent to NOT Coastal Gaslink
            nor['_epicProjectId'] = EpicProjectIds.coastalGaslinkId;
          } else {
            // Other + Coastal Gaslink is equivalent to NOT LNG Canada
            nor['_epicProjectId'] = EpicProjectIds.lngCanadaId;
          }
        }
      } else if (projectIds.length) {
        or['_epicProjectId'] = projectIds.join(',');
      }
    }

    if (params.isNrcedPublished) {
      or['isNrcedPublished'] = params.isNrcedPublished;
    }
    if (params.isLngPublished) {
      or['isLngPublished'] = params.isLngPublished;
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
      false,
      or,
      subset,
      nor
    );
  }
}
