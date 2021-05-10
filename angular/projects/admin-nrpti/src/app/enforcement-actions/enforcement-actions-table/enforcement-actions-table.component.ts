import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  IColumnObject,
  IPageSizePickerOption,
  ITableMessage,
  LoadingScreenService,
  TableObject,
  TableTemplateUtils,
  Utils
} from 'nrpti-angular-components';
import { EnforcementActionsTableRowComponent } from './enforcement-actions-table-row/enforcement-actions-table-row.component';

/**
 * Mine list page component.
 *
 * @export
 * @class EnforcementActionsTableComponent
 * @implements {OnInit}
 * @implements {OnDestroy}
 */
@Component({
  selector: 'app-enforcement-actions-table',
  templateUrl: './enforcement-actions-table.component.html',
  styleUrls: ['./enforcement-actions-table.component.scss']
})
export class EnforcementActionsTableComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  public tableData: TableObject = new TableObject({
    component: EnforcementActionsTableRowComponent,
    pageSize: 25,
    currentPage: 1,
    sortBy: '-dateIssued'
  });

  public tableColumns: IColumnObject[] = [
    {
      name: 'Name',
      value: 'recordName',
      width: 'col-5'
    },
    {
      name: 'Type',
      value: 'recordType',
      width: 'col-2'
    },
    {
      name: 'Date',
      value: 'dateIssued',
      width: 'col-2'
    },
    {
      name: 'Published to BCMI',
      value: 'published',
      width: 'col-2'
    },
    {
      name: '', // Edit Button
      value: '',
      width: 'col-1',
      nosort: true
    },
  ];

  public queryParams: Params;

  // keyword search
  public keywordSearchWords: string;
  public showAdvancedFilters = false;

  constructor(
    private location: Location,
    private router: Router,
    private route: ActivatedRoute,
    public utils: Utils,
    private loadingScreenService: LoadingScreenService,
    private tableTemplateUtils: TableTemplateUtils,
    private _changeDetectionRef: ChangeDetectorRef
  ) { }

  /**
   * Component init
   *
   * * @memberof EnforcementActionsTableComponent
   */

  ngOnInit() {
    this.loadingScreenService.setLoadingState(true, 'body');
    this.tableData.options.showPageSizePicker = false;
    this.tableData.options.showPageCountDisplay = false;
    this.route.params.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: Params) => {
      this.queryParams = { ...params };
      // Get params from route, shove into the tableTemplateUtils so that we get a new dataset to work with.
      this.tableData = this.tableTemplateUtils.updateTableObjectWithUrlParams(params, this.tableData);
      if (!this.queryParams || !Object.keys(this.queryParams).length) {
        // Only need to manually set url params if this page loads using default parameters (IE: user navigates to this
        // component for the first time).
        this.setInitialURLParams();
      }

      // if we have a keyword on the url, set the text
      this.keywordSearchWords = this.queryParams['keywords'] || '';

      this.route.data.pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: any) => {
        if (!res || !res.records || !res.records[0]) {
          alert("Uh-oh, couldn't load Enforcement Actions");
          this.loadingScreenService.setLoadingState(false, 'body');
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

        this._changeDetectionRef.detectChanges();
        this.loadingScreenService.setLoadingState(false, 'body');
      });

      this._changeDetectionRef.detectChanges();
    });
  }

  executeSearch(searchPackage) {
    this.keywordSearchWords = '';
    delete this.queryParams['keywords'];

    if (searchPackage.keywords) {
      this.queryParams['keywords'] = searchPackage.keywords;
      // always change sortBy to '-score' if keyword search is directly triggered by user
      if (searchPackage.keywordsChanged) {
        this.tableData.sortBy = '-score';
      }
    }

    this.tableData.currentPage = 1;
    this.submit();
  }

  /**
   * Updates the url parameters based on the currently set query and table template params, without reloading the page.
   *
   * @memberof EnforcementActionsTableComponent
   */
  setInitialURLParams() {
    this.location.go(
      this.router
        .createUrlTree([{ ...this.queryParams, ...this.tableTemplateUtils.getNavParamsObj(this.tableData) }], {
          relativeTo: this.route
        })
        .toString()
    );
  }

  /**
   * Receives messages from the table template component, and performs any corresponding actions.
   *
   * @param {ITableMessage} msg
   * @memberof EnforcementActionsTableComponent
   */
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
    }
  }

  /**
   * Column sorting handler.
   *
   * @param {*} column
   * @memberof EnforcementActionsTableComponent
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
   * @memberof EnforcementActionsTableComponent
   */
  onPageNumUpdate(pageNumber) {
    this.tableData.currentPage = pageNumber;
    this.submit();
  }

  /**
   * Page size picker option selected handler.
   *
   * @param {IPageSizePickerOption} pageSize
   * @memberof EnforcementActionsTableComponent
   */
  onPageSizeUpdate(pageSize: IPageSizePickerOption) {
    this.tableData.pageSize = pageSize.value;
    this.submit();
  }

  /**
   * Update enforcement action table with latest values (whatever is set in this.tableData).
   *
   * @memberof EnforcementActionsTableComponent
   */
  submit() {
    // These are params that should be handled by tableData
    delete this.queryParams.sortBy;
    delete this.queryParams.currentPage;
    delete this.queryParams.pageNumber;
    delete this.queryParams.pageSize;

    this.loadingScreenService.setLoadingState(true, 'body');

    this.router.navigate([
      'mines/enforcement-actions',
      { ...this.queryParams, ...this.tableTemplateUtils.getNavParamsObj(this.tableData) }
    ]);
  }

  /**
   * Cleanup on component destroy.
   *
   * @memberof EnforcementActionsTableComponent
   */
  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
