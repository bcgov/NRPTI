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

  public tableData: TableObject = new TableObject({ component: MinesTableRowComponent });
  public tableColumns: IColumnObject[] = [
    {
      name: 'Name',
      value: 'name',
      width: 'col-3'
    },
    {
      name: 'owner',
      value: 'owner',
      width: 'col-2'
    },
    {
      name: 'Type',
      value: 'type',
      width: 'col-2'
    },
    {
      name: 'Status',
      value: 'status',
      width: 'col-2'
    },
    {
      name: 'Region',
      value: 'region',
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

    this.route.params.pipe(takeUntil(this.ngUnsubscribe)).subscribe(params => {
      this.queryParams = { ...params };
      // Get params from route, shove into the tableTemplateUtils so that we get a new dataset to work with.
      this.tableData = this.tableTemplateUtils.updateTableObjectWithUrlParams(params, this.tableData);

      this.route.data.pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: any) => {
        if (!res || !res.mines) {
          alert("Uh-oh, couldn't load NRPTI mines");
          // mines not found --> navigate back to home
          this.loadingScreenService.setLoadingState(false, 'body');
          this.router.navigate(['/']);
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
