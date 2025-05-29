import { Component, OnInit, Input } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';

import { FactoryService } from '../../../services/factory.service';
import { SchemaLists } from '../../../../../../common/src/app/utils/record-constants';
import { RecordUtils } from '../../utils/record-utils';

const RECORDS_PER_REQUEST = 5000;

/**
 * Export CSV component.
 *
 * @export
 * @class ExportCsvComponent
 * @implements {OnInit}
 */
@Component({
  standalone: false,
  selector: 'app-export-csv',
  templateUrl: './export-csv.component.html',
  styleUrls: ['./export-csv.component.scss']
})
export class ExportCsvComponent implements OnInit {
  @Input() queryParams: any;
  @Input() totalRecords: number;

  public downloading = false;

  constructor(public factoryService: FactoryService) {}

  ngOnInit() {}

  showButton(): boolean {
    if (!this.queryParams) {
      return false;
    }

    const keys = Object.keys(RecordUtils.buildFilterParams(this.queryParams));
    return this.queryParams.keywords || keys.length || this.queryParams.activityType;
  }

  exportCsv(): void {
    this.downloading = true;
    
    console.log('🔄 CSV EXPORT STARTED');
    console.log('📊 Export Parameters:', {
      queryParams: this.queryParams,
      totalRecords: this.totalRecords,
      schemaList: this.queryParams?.activityType ? this.queryParams.activityType.split(',') : SchemaLists.nrcedPublicBasicRecordTypes,
      filterParams: RecordUtils.buildFilterParams(this.queryParams)
    });

    // Limit the maximum of records per request.  This is to prevent the API from
    // crashing.  Mongo has a hard 16MB doc limit, so the search aggregation result can't
    // exceed that.
    //
    // Split up the number of requests if search records are greater than RECORDS_PER_REQUEST
    const totalPages = Math.ceil(this.totalRecords / RECORDS_PER_REQUEST);
    console.log(`📄 Total pages to fetch: ${totalPages} (${RECORDS_PER_REQUEST} records per page)`);
    
    const requests = [];
    for (let i = 1; i <= totalPages; i++) {
      requests.push(this.requestRecords(i));
    }

    forkJoin(requests).subscribe((res: any) => {
      console.log('📥 Raw API Responses:', res);
      
      let allRecords = [];
      let responseDetails = [];

      for (let i = 0; i < res.length; i++) {
        const result = res[i];
        const records = (result[0] && result[0].data && result[0].data.searchResults) || [];
        
        console.log(`📦 Page ${i + 1} Response:`, {
          hasData: !!result[0],
          hasSearchResults: !!(result[0] && result[0].data && result[0].data.searchResults),
          recordCount: records.length,
          meta: result[0] && result[0].data && result[0].data.meta,
          sampleRecord: records[0] // First record for inspection
        });
        
        responseDetails.push({
          pageNumber: i + 1,
          recordCount: records.length,
          records: records
        });

        if (records.length) {
          allRecords = allRecords.concat(records);
        }
      }

      console.log('📋 EXPORT DATA SUMMARY:', {
        totalFetchedRecords: allRecords.length,
        expectedTotalRecords: this.totalRecords,
        responseBreakdown: responseDetails.map(rd => ({ page: rd.pageNumber, count: rd.recordCount }))
      });

      // Analyze publication status
      const publishedCount = allRecords.filter(record => 
        record.read && record.read.includes('public') && record.issuedTo
      ).length;
      const unpublishedCount = allRecords.filter(record => 
        !record.issuedTo || !record.read || !record.read.includes('public')
      ).length;
      
      console.log('🔍 PUBLICATION STATUS ANALYSIS:', {
        totalRecords: allRecords.length,
        publishedRecords: publishedCount,
        unpublishedRecords: unpublishedCount,
        recordsWithIssuedTo: allRecords.filter(r => r.issuedTo).length,
        recordsWithoutIssuedTo: allRecords.filter(r => !r.issuedTo).length,
        recordsWithPublicRead: allRecords.filter(r => r.read && r.read.includes('public')).length
      });

      // Sample records for detailed inspection
      console.log('🔬 SAMPLE RECORDS FOR INSPECTION:');
      allRecords.slice(0, 3).forEach((record, index) => {
        console.log(`Sample Record ${index + 1}:`, {
          _id: record._id,
          recordType: record.recordType,
          dateIssued: record.dateIssued,
          issuedTo: record.issuedTo,
          read: record.read,
          location: record.location,
          isNrcedPublished: record.isNrcedPublished,
          published: record.published
        });
      });

      if (allRecords.length) {
        console.log('📄 Proceeding to generate CSV with', allRecords.length, 'records');
        RecordUtils.exportToCsv(allRecords, this.factoryService);
      } else {
        console.warn('⚠️ No records to export!');
      }

      this.downloading = false;
    });
  }

  private requestRecords(page: number): Observable<any> {
    let schemaList = SchemaLists.nrcedPublicBasicRecordTypes;

    if (this.queryParams.activityType) {
      schemaList = this.queryParams.activityType.split(',');
    }

    const requestParams = {
      keywords: this.queryParams.keywords,
      schemaList: schemaList,
      fields: [],
      page: page,
      pageSize: RECORDS_PER_REQUEST,
      sortBy: this.queryParams.sortBy || '-dateIssued',
      and: {},
      populate: false,
      or: RecordUtils.buildFilterParams(this.queryParams)
    };

    console.log(`🌐 API Call Page ${page}:`, requestParams);

    return this.factoryService.getRecords(
      this.queryParams.keywords,
      schemaList,
      [],
      page,
      RECORDS_PER_REQUEST,
      this.queryParams.sortBy || '-dateIssued',
      {},
      false,
      RecordUtils.buildFilterParams(this.queryParams)
    );
  }
}
