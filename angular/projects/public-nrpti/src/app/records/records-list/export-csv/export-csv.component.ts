import { Component, OnInit, Input } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';

import { FactoryService } from '../../../services/factory.service';
import { SchemaLists } from '../../../../../../common/src/app/utils/record-constants';
import { RecordUtils } from '../../utils/record-utils';

const RECORDS_PER_REQUEST = 10000;

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

    // Limit the maximum of records per request.  This is to prevent the API from
    // crashing.  Mongo has a hard 16MB doc limit, so the search aggregation result can't
    // exceed that.
    //
    // Split up the number of requests if search records are greater than RECORDS_PER_REQUEST
    const totalPages = Math.ceil(this.totalRecords / RECORDS_PER_REQUEST);
    const requests = [];
    for (let i = 1; i <= totalPages; i++) {
      requests.push(this.requestRecords(i));
    }

    forkJoin(requests).subscribe((res: any) => {
      let allRecords = [];

      for (const result of res) {
        const records = (result[0] && result[0].data && result[0].data.searchResults) || [];

        if (records.length) {
          allRecords = allRecords.concat(records);
        }
      }

      if (allRecords.length) {
        RecordUtils.exportToCsv(allRecords, this.factoryService);
      }

      this.downloading = false;
    });
  }

  private requestRecords(page: number): Observable<any> {
    let schemaList = SchemaLists.nrcedPublicBasicRecordTypes;

    if (this.queryParams.activityType) {
      schemaList = this.queryParams.activityType.split(',');
    }

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
