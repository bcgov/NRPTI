import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TableTemplateUtils, TableObject, IColumnObject, IPageSizePickerOption } from 'nrpti-angular-components';
import { RecordsTableRowsComponent } from '../records-rows/records-table-rows.component';

/**
 * List page component.
 *
 * @export
 * @class SearchListComponent
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
  // public entries: User[] = null;
  // public terms = new SearchTerms();
  public typeFilters = [];
  public navigationObject;

  public tableData: TableObject = new TableObject({ component: RecordsTableRowsComponent });
  public tableColumns: IColumnObject[] = [
    {
      name: 'Issued To',
      value: 'issuedTo',
      width: 'col-2'
    },
    {
      name: 'Name',
      value: 'documentFileName',
      width: 'col-4'
    },
    {
      name: 'Type',
      value: 'type',
      width: 'col-1'
    },
    {
      name: 'Location',
      value: 'location',
      width: 'col-2'
    },
    {
      name: 'Date',
      value: 'documentDate',
      width: 'col-1'
    },
    {
      name: 'Attachments',
      value: '',
      width: 'col-2'
    },
    {
      name: '',
      value: '',
      width: 'col-1',
      nosort: true
    }
  ];

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
   * @memberof SearchComponent
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

      this.tableData.items = res.records[0] && res.records[0].data && res.records[0].data.searchResults;
      if (res.records[0] && res.records[0].data && res.records[0].data.meta && res.records[0].data.meta.length) {
        this.tableData.totalListItems = res.records[0].data.meta[0].searchResultsTotal;
      }

      this.tableData.columns = this.tableColumns;
      this.loading = false;
      this._changeDetectionRef.detectChanges();
    });
  }

  /**
   * Column sorting handler.
   *
   * @param {*} column
   * @memberof SearchComponent
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
   * @memberof SearchComponent
   */
  onPageNumUpdate(pageNumber) {
    this.tableData.currentPage = pageNumber;
    this.submit();
  }

  /**
   * Page size picker option selected handler.
   *
   * @param {IPageSizePickerOption} pageSize
   * @memberof SearchComponent
   */
  onPageSizeUpdate(pageSize: IPageSizePickerOption) {
    this.tableData.pageSize = pageSize.value;
    this.submit();
  }

  /**
   * Update record table with latest values (whatever is set in this.tableData).
   *
   * @memberof SearchComponent
   */
  submit() {
    this.tableTemplateUtils.navigateUsingParams(this.tableData, ['records']);
  }

  checkChange() {}

  /**
   * Cleanup on component destroy.
   *
   * @memberof SearchComponent
   */
  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
