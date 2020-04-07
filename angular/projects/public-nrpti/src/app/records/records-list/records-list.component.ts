import { Component, OnDestroy, OnInit, ChangeDetectorRef, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { FormGroup, FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  TableObject,
  IColumnObject,
  IPageSizePickerOption,
  Utils,
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

  public messageIn: EventEmitter<ITableMessage> = new EventEmitter<ITableMessage>();

  public loading = true;
  public showAdvancedFilters = true;
  public queryParams: Params;
  public searchFiltersForm: FormGroup;

  public keywordSearchWords: string;

  public sortingDisplay = {
    '-dateIssued': 'Date Issued (newest at top)',
    '+recordType': 'Activity Type (a-z)',
    '+issuedTo.fullName': 'Issued To (a-z)',
    '+location': 'Location (a-z)'
  };

  public tableData: TableObject = new TableObject({
    options: {
      showHeader: false,
      showPagination: true,
      showPageSizePicker: true,
      showPageCountDisplay: true
    },
    component: RecordsTableRowComponent
  });

  public tableColumns: IColumnObject[] = [
    {
      name: 'Issued To',
      value: 'issuedTo',
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
      value: 'dateIssued'
    },
    {
      name: 'Description',
      value: 'description',
      width: 'col-2'
    },
    {
      width: 'col-1'
    }
  ];

  constructor(
    public router: Router,
    public route: ActivatedRoute,
    public utils: Utils,
    private tableTemplateUtils: TableTemplateUtils,
    private _changeDetectionRef: ChangeDetectorRef
  ) {}

  /**
   * Component init.
   *
   * @memberof RecordsListComponent
   */
  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: Params) => {
      this.queryParams = { ...params };
      // Get params from route, shove into the tableTemplateUtils so that we get a new dataset to work with.
      this.tableData = this.tableTemplateUtils.updateTableObjectWithUrlParams(params, this.tableData);

      if (!this.tableData.sortBy) {
        this.tableData.sortBy = '-dateIssued';
      }

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

      this.keywordSearchWords = (this.queryParams && this.queryParams.keywords) || '';
      this.buildSearchFiltersForm();
      this.subscribeToSearchFilterChanges();

      this.loading = false;
      this._changeDetectionRef.detectChanges();
    });
  }

  public buildSearchFiltersForm() {
    this.searchFiltersForm = new FormGroup({
      dateIssuedStart: new FormControl(
        (this.queryParams &&
          this.queryParams.dateRangeFromFilter &&
          this.utils.convertJSDateToNGBDate(new Date(this.queryParams.dateRangeFromFilter))) ||
          null
      ),
      dateIssuedEnd: new FormControl(
        (this.queryParams &&
          this.queryParams.dateRangeToFilter &&
          this.utils.convertJSDateToNGBDate(new Date(this.queryParams.dateRangeToFilter))) ||
          null
      ),
      issuedToCompany: new FormControl((this.queryParams && this.queryParams.issuedToCompany) || null),
      issuedToIndividual: new FormControl((this.queryParams && this.queryParams.issuedToIndividual) || null),
      activityType: new FormControl((this.queryParams && this.queryParams.activityType) || ''),
      agency: new FormControl((this.queryParams && this.queryParams.agency) || ''),
      act: new FormControl((this.queryParams && this.queryParams.act) || ''),
      regulation: new FormControl((this.queryParams && this.queryParams.regulation) || '')
    });
  }

  /**
   * Generic handler for all messages received by this component from the table template component.
   *
   * @param {ITableMessage} msg
   * @memberof RecordsListComponent
   */
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

  changeSort(sortBy) {
    this.tableData.sortBy = sortBy;
    this.submit();
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

  keywordSearch() {
    if (this.keywordSearchWords) {
      this.utils.addKeyValueToObject(this.queryParams, 'keywords', this.keywordSearchWords);
    } else {
      this.utils.removeKeyFromObject(this.queryParams, 'keywords');
    }

    this.router.navigate(['/records', this.queryParams]);
  }

  subscribeToSearchFilterChanges() {
    this.searchFiltersForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(changes => {
      if (changes.dateIssuedStart) {
        this.utils.addKeyValueToObject(
          this.queryParams,
          'dateRangeFromFilter',
          this.utils.convertFormGroupNGBDateToJSDate(changes.dateIssuedStart).toISOString()
        );
      } else {
        this.utils.removeKeyFromObject(this.queryParams, 'dateRangeFromFilter');
      }

      if (changes.dateIssuedEnd) {
        this.utils.addKeyValueToObject(
          this.queryParams,
          'dateRangeToFilter',
          this.utils.convertFormGroupNGBDateToJSDate(changes.dateIssuedEnd).toISOString()
        );
      } else {
        this.utils.removeKeyFromObject(this.queryParams, 'dateRangeToFilter');
      }

      if (changes.issuedToCompany) {
        this.utils.addKeyValueToObject(this.queryParams, 'issuedToCompany', changes.issuedToCompany);
      } else {
        this.utils.removeKeyFromObject(this.queryParams, 'issuedToCompany');
      }

      if (changes.issuedToIndividual) {
        this.utils.addKeyValueToObject(this.queryParams, 'issuedToIndividual', changes.issuedToIndividual);
      } else {
        this.utils.removeKeyFromObject(this.queryParams, 'issuedToIndividual');
      }

      if (changes.activityType && changes.activityType.length) {
        this.utils.addKeyValueToObject(this.queryParams, 'activityType', changes.activityType);
      } else {
        this.utils.removeKeyFromObject(this.queryParams, 'activityType');
      }

      if (changes.agency && changes.agency.length) {
        this.utils.addKeyValueToObject(this.queryParams, 'agency', changes.agency);
      } else {
        this.utils.removeKeyFromObject(this.queryParams, 'agency');
      }

      if (changes.act && changes.act.length) {
        this.utils.addKeyValueToObject(this.queryParams, 'act', changes.act);
      } else {
        this.utils.removeKeyFromObject(this.queryParams, 'act');
      }

      if (changes.regulation && changes.regulation.length) {
        this.utils.addKeyValueToObject(this.queryParams, 'regulation', changes.regulation);
      } else {
        this.utils.removeKeyFromObject(this.queryParams, 'regulation');
      }

      this.router.navigate(['/records', this.queryParams]);
    });
  }

  /**
   * Update record table with latest values (whatever is set in this.tableData).
   *
   * @memberof RecordsListComponent
   */
  submit() {
    this.tableTemplateUtils.navigateUsingParams(this.tableData, ['records'], this.queryParams);
  }

  /**
   * Open advanced filters panel.
   *
   * @memberof RecordsListComponent
   */
  openAdvancedFilters(): void {
    this.showAdvancedFilters = true;
  }

  /**
   * Close advanced filters panel.
   *
   * @memberof RecordsListComponent
   */
  closeAdvancedFilters(): void {
    this.showAdvancedFilters = false;
  }

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
