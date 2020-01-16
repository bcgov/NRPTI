import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit, ChangeDetectorRef, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  TableObject,
  IColumnObject,
  IPageSizePickerOption,
  TableTemplateUtils,
  ITableMessage
} from 'nrpti-angular-components';
import { RecordsTableRowComponent } from '../records-row/records-table-row.component';

/**
 * List page component.
 *
 * @export
 * @class RecordsListComponent
 * @implements {OnInit}
 * @implements {OnDestroy}
 */
@Component({
  selector: 'app-records-list',
  templateUrl: './records-list.component.html',
  styleUrls: ['./records-list.component.scss']
})
export class RecordsListComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  public loading = true;
  public typeFilters = [];
  public navigationObject;

  public tableData: TableObject = new TableObject({
    options: { showHeader: false },
    component: RecordsTableRowComponent
  });
  public tableColumns: IColumnObject[] = [
    {
      name: 'Activity',
      value: 'activity',
      width: 'col-2'
    },
    {
      name: 'Issued To',
      value: 'documentFileName',
      width: 'col-3'
    },
    {
      name: 'Activity Type',
      value: 'type',
      width: 'col-1'
    },
    {
      name: 'Location Description',
      value: 'location',
      width: 'col-2'
    },
    {
      name: 'Issued On',
      value: 'documentDate',
      width: 'col-1'
    },
    {
      width: 'col-1'
    }
  ];

  public messageIn: EventEmitter<ITableMessage> = new EventEmitter<ITableMessage>();

  constructor(
    public location: Location,
    public router: Router,
    public route: ActivatedRoute,
    private tableTemplateUtils: TableTemplateUtils,
    private _changeDetectionRef: ChangeDetectorRef
  ) {}

  /**
   * Component init.
   *
   * @memberof RecordsListComponent
   */
  ngOnInit(): void {
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
        this.rowClicked(msg);
        break;
      case 'rowSelected':
        this.rowSelected(msg);
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

  /**
   * Record row click handler.
   *
   * @param {ITableMessage} msg
   * @memberof RecordsListComponent
   */
  rowClicked(msg: ITableMessage) {
    this.messageIn.emit(msg);
  }

  /**
   * Record row select handler.
   *
   * @param {ITableMessage} msg
   * @memberof RecordsListComponent
   */
  rowSelected(msg: ITableMessage) {}

  /**
   * Column sorting handler.
   *
   * @param {*} column
   * @memberof RecordsListComponent
   */
  setColumnSort(column) {
    if (this.tableData.sortBy.charAt(0) === '+') {
      this.tableData.sortBy = '-' + column;
    } else {
      this.tableData.sortBy = '+' + column;
    }
    this.submit();
  }

  /**
   * Page number changed (pagination).
   *
   * @param {*} pageNumber
   * @memberof RecordsListComponent
   */
  onPageNumUpdate(pageNumber) {
    this.tableData.currentPage = pageNumber;
    this.submit();
  }

  /**
   * Page size picker option selected handler.
   *
   * @param {IPageSizePickerOption} pageSize
   * @memberof RecordsListComponent
   */
  onPageSizeUpdate(pageSize: IPageSizePickerOption) {
    this.tableData.pageSize = pageSize.value;
    this.submit();
  }

  /**
   * Update record table with latest values (whatever is set in this.tableData).
   *
   * @memberof RecordsListComponent
   */
  submit() {
    this.tableTemplateUtils.navigateUsingParams(this.tableData, ['records']);
  }

  checkboxChange() {}

  /**
   * Cleanup on component destroy.
   *
   * @memberof RecordsListComponent
   */
  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
