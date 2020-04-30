import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  TableTemplateUtils,
  TableObject,
  IColumnObject,
  IPageSizePickerOption,
  ITableMessage
} from 'nrpti-angular-components';
import { NewsTableRowComponent } from './news-rows/news-table-row.component';
import { LoadingScreenService } from 'nrpti-angular-components';

@Component({
  selector: 'app-news-list',
  templateUrl: './news-list.component.html',
  styleUrls: ['./news-list.component.scss']
})
export class NewsListComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  public loading = true;
  public typeFilters = [];
  public navigationObject;

  public tableData: TableObject = new TableObject({ component: NewsTableRowComponent });
  public tableColumns: IColumnObject[] = [
    {
      name: 'Date',
      value: 'date',
      width: 'col-2'
    },
    {
      name: 'Title',
      value: 'description',
      width: 'col-4'
    },
    {
      name: 'Type',
      value: 'type',
      width: 'col-3'
    },
    {
      name: 'Project',
      value: 'projectName',
      width: 'col-2'
    },
    {
      name: 'System',
      value: '_schemaName',
      width: 'col-1'
    }
  ];

  constructor(
    public location: Location,
    public router: Router,
    public route: ActivatedRoute,
    private loadingScreenService: LoadingScreenService,
    private tableTemplateUtils: TableTemplateUtils,
    private _changeDetectionRef: ChangeDetectorRef
  ) { }

  /**
   * Component init.
   *
   * @memberof SearchComponent
   */
  ngOnInit(): void {
    this.loadingScreenService.setLoadingState(true, 'body');
    this.route.params.pipe(takeUntil(this.ngUnsubscribe)).subscribe(params => {
      // Get params from route, shove into the tableTemplateUtils so that we get a new dataset to work with.
      this.tableData = this.tableTemplateUtils.updateTableObjectWithUrlParams(params, this.tableData);

      // Make api call with tableData params.
      this.loadingScreenService.setLoadingState(false, 'body');
      this._changeDetectionRef.detectChanges();
    });

    this.route.data.pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: any) => {
      if (!res || !res.records) {
        alert("Uh-oh, couldn't load News records");
        // project not found --> navigate back to home
        this.router.navigate(['/']);
        return;
      }

      const records = (res.records[0] && res.records[0].data && res.records[0].data.searchResults) || [];
      this.tableData.items = records.map(record => {
        // On the fly, create a conversion of the schema to reflect system name.
        // tslint:disable-next-line: prefer-const
        let data = {...record};
        data.system = data._schemaName.split('Activity')[1];
        return { rowData: data };
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

  filterChange(event) {
    Object.keys(event).forEach(item => {
      if (!event || event[item] === undefined || event[item] === null || event[item].length === 0) {
        if (this.tableData[item]) {
          delete this.tableData[item];
        }
      } else {
        this.tableData[item] = event[item];
      }
    });
    this.submit();
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
    this.loadingScreenService.setLoadingState(true, 'body');
    this.tableTemplateUtils.navigateUsingParams(this.tableData, ['news']);
  }

  checkChange() { }

  add(type) {
    this.router.navigate(['news', type, 'add']);
  }

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
