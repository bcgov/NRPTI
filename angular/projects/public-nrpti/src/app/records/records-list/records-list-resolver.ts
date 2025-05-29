import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { TableTemplateUtils, TableObject } from 'nrpti-angular-components';
import { FactoryService } from '../../services/factory.service';
import { SchemaLists } from '../../../../../common/src/app/utils/record-constants';
import { RecordUtils } from '../utils/record-utils';
import { catchError, tap } from 'rxjs/operators';

declare let window: any;

@Injectable()
export class RecordsListResolver implements Resolve<Observable<object>> {
  constructor(
    public factoryService: FactoryService,
    public tableTemplateUtils: TableTemplateUtils
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<object> {
    console.log('🔍 DISPLAY DATA RESOLVER STARTED');
    
    const params = { ...route.params };
    console.log('📊 Display Parameters:', params);
    
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

    console.log('📋 Display Query Configuration:', {
      schemaList: schemaList,
      keywords: keywords,
      tableObject: {
        currentPage: tableObject.currentPage,
        pageSize: tableObject.pageSize,
        sortBy: tableObject.sortBy
      }
    });

    // This checks for the search parameter that was put in above along with an equal, for example q= or s=
    if (params.keywords) {
      window.snowplow('trackSiteSearch', [decodeURIComponent(params.keywords)]);
    }

    const filterParams = RecordUtils.buildFilterParams(params);
    console.log('🔧 Display Filter Parameters:', filterParams);

    // force-reload so we always have latest data
    // When autofocusing, we want to limit our search to the one entry to prevent it getting lost in results
    if (params.autofocus) {
      console.log('🎯 Autofocus mode for record:', params.autofocus);
      return this.factoryService.getRecord(params.autofocus, '').pipe(
        catchError((error: any) => {
          if (error.status === 400) {
            // If the search fails, handle the error by returning an Observable of an empty array
            return of([]);
          }
        })
      );
    }
    
    console.log('🌐 Making display API call...');
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
    ).pipe(
      tap((result: any) => {
        console.log('📥 Display API Response:', result);
        if (result && result[0] && result[0].data) {
          const searchResults = result[0].data.searchResults || [];
          const meta = result[0].data.meta || [];
          
          console.log('📋 DISPLAY DATA SUMMARY:', {
            totalRecords: meta[0]?.searchResultsTotal || 0,
            returnedRecords: searchResults.length,
            currentPage: tableObject.currentPage,
            pageSize: tableObject.pageSize,
            sampleRecord: searchResults[0]
          });

          // Analyze publication status for display data
          const publishedCount = searchResults.filter(record => 
            record.read && record.read.includes('public') && record.issuedTo
          ).length;
          const unpublishedCount = searchResults.filter(record => 
            !record.issuedTo || !record.read || !record.read.includes('public')
          ).length;
          
          console.log('🔍 DISPLAY PUBLICATION STATUS:', {
            totalRecords: searchResults.length,
            publishedRecords: publishedCount,
            unpublishedRecords: unpublishedCount,
            recordsWithIssuedTo: searchResults.filter(r => r.issuedTo).length,
            recordsWithoutIssuedTo: searchResults.filter(r => !r.issuedTo).length
          });
        }
      })
    );
  }
}
