import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FactoryService } from '../services/factory.service';
import { Subject } from 'rxjs';
import {
  TableObject,
  TableTemplateUtils,
  IColumnObject,
  IPageSizePickerOption,
  ITableMessage
} from 'nrpti-angular-components';
import { ImportTableRowsComponent } from '../import/import-rows/import-table-rows.component';
import { takeUntil } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-import',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.scss']
})
export class ImportComponent implements OnInit {
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  public loading = true;
  public showAlert = { epic: false, 'nris-epd': false };
  public tableData: TableObject = new TableObject({ component: ImportTableRowsComponent });
  public tableColumns: IColumnObject[] = [
    {
      name: 'Start',
      value: 'startDate',
      width: 'col-3'
    },
    {
      name: 'Finish',
      value: 'finishDate',
      width: 'col-3'
    },
    {
      name: 'Status',
      value: 'status',
      width: 'col-2'
    },
    {
      name: 'Source',
      value: 'dataSourceLabel',
      width: 'col-2'
    },
    {
      name: 'Items',
      value: 'itemTotal',
      width: 'col-2'
    }
  ];
  constructor(
    public router: Router,
    public route: ActivatedRoute,
    private tableTemplateUtils: TableTemplateUtils,
    private _changeDetectionRef: ChangeDetectorRef,
    public factoryService: FactoryService
  ) { }

  ngOnInit() {
    this.route.params.pipe(takeUntil(this.ngUnsubscribe)).subscribe(params => {
      // Get params from route, shove into the tableTemplateUtils so that we get a new dataset to work with.
      this.tableData = this.tableTemplateUtils.updateTableObjectWithUrlParams(params, this.tableData);

      // Make api call with tableData params.

      this._changeDetectionRef.detectChanges();
    });

    this.route.data.pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: any) => {
      if (!res || !res.records) {
        alert("Uh-oh, couldn't load NRPTI records");
        // project not found --> navigate back to home
        this.router.navigate(['/']);
        return;
      }

      const records = (res.records[0] && res.records[0].data && res.records[0].data.searchResults) || [];
      this.tableData.items = records.map(record => {
        return { rowData: record };
      });

      this.tableData.totalListItems =
        (res.records[0] &&
          res.records[0].data &&
          res.records[0].data.meta &&
          res.records[0].data.meta[0] &&
          res.records[0].data.meta[0].searchResultsTotal) ||
        0;

      this.tableData.columns = this.tableColumns;
      this.loading = false;
      this._changeDetectionRef.detectChanges();
    });
  }

  onMessageOut(msg: ITableMessage) {
    switch (msg.label) {
      case 'rowClicked':
        break;
      case 'rowSelected':
        break;
      case 'columnSort':
        this.setColumnSort(msg.data);
        break;
      case 'pageNum':
        this.onPageNumUpdate(msg.data);
        break;
      case 'pageSize':
        this.onPageSizeUpdate(msg.data);
        break;
      default:
        break;
    }
  }

  setColumnSort(column) {
    if (this.tableData.sortBy.charAt(0) === '+') {
      this.tableData.sortBy = '-' + column;
    } else {
      this.tableData.sortBy = '+' + column;
    }
    this.submit();
  }

  onPageNumUpdate(pageNumber) {
    this.tableData.currentPage = pageNumber;
    this.submit();
  }

  onPageSizeUpdate(pageSize: IPageSizePickerOption) {
    this.tableData.pageSize = pageSize.value;
    this.submit();
  }

  submit() {
    this.tableTemplateUtils.navigateUsingParams(this.tableData, ['imports']);
  }

  async startJob(dataSourceType: string) {
    await this.factoryService.startTask({
      dataSourceType: dataSourceType,
      taskType: 'import'
    }).toPromise();

    this.showAlert[dataSourceType] = true;
    setTimeout(() => {
      this.showAlert[dataSourceType] = false;
    }, 4000);
  }
}
