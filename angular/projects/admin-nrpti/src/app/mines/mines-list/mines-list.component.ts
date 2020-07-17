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
import { MinesTableRowComponent } from '../mines-rows/mines-table-row.component';

/**
 * Mine list page component.
 *
 * @export
 * @class MinesListComponent
 * @implements {OnInit}
 * @implements {OnDestroy}
 */
@Component({
  selector: 'app-mines-list',
  templateUrl: './mines-list.component.html',
  styleUrls: ['./mines-list.component.scss']
})
export class MinesListComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  public tableData: TableObject = new TableObject({
    component: MinesTableRowComponent,
    pageSize: 25,
    currentPage: 1,
    sortBy: '+name'
  });
  public tableColumns: IColumnObject[] = [
    {
      name: 'Name',
      value: 'name',
      width: 'col-3'
    },
    {
      name: 'Permit Numbers',
      value: '',
      width: 'col-2',
      nosort: true
    },
    {
      name: 'Type',
      value: 'type',
      width: 'col-1'
    },
    {
      name: 'Permittee',
      value: 'permittee',
      width: 'col-2'
    },
    {
      name: 'Region',
      value: 'region',
      width: 'col-1'
    },
    {
      name: 'Published',
      value: 'published',
      width: 'col-2'
    },
    {
      name: '', // Edit button
      value: '',
      width: 'col-1',
      nosort: true
    }
  ];

  // Filters
  public queryParams: Params;

  // keyword search
  public keywordSearchWords: string;

  constructor(
    public location: Location,
    public router: Router,
    public route: ActivatedRoute,
    public utils: Utils,
    private loadingScreenService: LoadingScreenService,
    private tableTemplateUtils: TableTemplateUtils,
    private _changeDetectionRef: ChangeDetectorRef
  ) {}

  /**
   * Component init.
   *
   * @memberof MinesListComponent
   */
  ngOnInit(): void {
    this.loadingScreenService.setLoadingState(true, 'body');

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
        if (!res || !res.mines) {
          alert("Uh-oh, couldn't load NRPTI mines");
          this.loadingScreenService.setLoadingState(false, 'body');
          return;
        }

        const mines = (res.mines[0] && res.mines[0].data && res.mines[0].data.searchResults) || [];
        this.tableData.items = mines.map(mine => {
          return { rowData: mine };
        });

        this.tableData.totalListItems =
          (res.mines[0] &&
            res.mines[0].data &&
            res.mines[0].data.meta &&
            res.mines[0].data.meta[0] &&
            res.mines[0].data.meta[0].searchResultsTotal) ||
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
   * @memberof MinesListComponent
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
   * @memberof MinesListComponent
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
      default:
        break;
    }
  }

  /**
   * Column sorting handler.
   *
   * @param {*} column
   * @memberof MinesListComponent
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
   * @memberof MinesListComponent
   */
  onPageNumUpdate(pageNumber) {
    this.tableData.currentPage = pageNumber;
    this.submit();
  }

  /**
   * Page size picker option selected handler.
   *
   * @param {IPageSizePickerOption} pageSize
   * @memberof MinesListComponent
   */
  onPageSizeUpdate(pageSize: IPageSizePickerOption) {
    this.tableData.pageSize = pageSize.value;
    this.submit();
  }

  /**
   * Update mine table with latest values (whatever is set in this.tableData).
   *
   * @memberof MinesListComponent
   */
  submit() {
    // These are params that should be handled by tableData
    delete this.queryParams.sortBy;
    delete this.queryParams.currentPage;
    delete this.queryParams.pageNumber;
    delete this.queryParams.pageSize;

    this.loadingScreenService.setLoadingState(true, 'body');

    this.router.navigate([
      '/mines',
      { ...this.queryParams, ...this.tableTemplateUtils.getNavParamsObj(this.tableData) }
    ]);
  }

  /**
   * Cleanup on component destroy.
   *
   * @memberof MinesListComponent
   */
  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
