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
import { LoadingScreenService } from 'nrpti-angular-components';
import { FactoryService } from '../../services/factory.service';

/**
 * List page component.
 *
 * @export
 * @class RecordsListComponent
 * @implements {OnInit}
 * @implements {OnDestroy}
 */
@Component({
  standalone: false,
  selector: 'app-records-list',
  templateUrl: './records-list.component.html',
  styleUrls: ['./records-list.component.scss']
})
export class RecordsListComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<void> = new Subject<void>();

  public messageIn: EventEmitter<ITableMessage> = new EventEmitter<ITableMessage>();

  public loading = true;
  public showAdvancedFilters = true;
  public queryParams: Params;
  public searchFiltersForm: FormGroup;

  public keywordSearchWords: string;

  public sortingDisplay = {
    '-dateIssued': 'Date Issued (newest at top)',
    '+recordType': 'Type (a-z)',
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
      name: 'Description',
      value: 'description',
      width: 'col-2'
    },
    {
      name: 'Date Issued',
      value: 'dateIssued'
    }
  ];

  constructor(
    public router: Router,
    public route: ActivatedRoute,
    private loadingScreenService: LoadingScreenService,
    public factoryService: FactoryService,
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
    this.loadingScreenService.setLoadingState(true, 'body');
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
      console.log("Records List Response: ", res?.records);
      const records =
        (res.records[0] && res.records[0].data && res.records[0].data.searchResults) || // Multiple Records Search
        res.records || // Single Record search
        []; // No Entries Found

      // Console log all returned list items
      console.log('All returned records:', records);
      console.log('Number of records:', records.length);

      const { autofocus } = this.queryParams;
      this.tableData.items = records.map(record => {
        if (record.data) {
          record = record.data;
        } // Single results have an extra layer of nested data, this removes the layer
        // Set autofocus to auto open record card
        if (autofocus && autofocus === record._id) {
          record.autofocus = true;
        }
        return { rowData: record };
      });

      // Console log the processed table items
      console.log('Processed table items:', this.tableData.items);

      this.tableData.totalListItems =
        (res.records[0] &&
          res.records[0].data &&
          res.records[0].data.meta &&
          res.records[0].data.meta[0] &&
          res.records[0].data.meta[0].searchResultsTotal) || // Multiple results
        (res.records[0] && !res.records[0].data.hasOwnProperty('searchResults') && 1) || // Single results (autofocus param)
        0; // No entries found

      this.tableData.columns = this.tableColumns;

      this.keywordSearchWords = (this.queryParams && this.queryParams.keywords) || '';
      this.buildSearchFiltersForm();
      this.subscribeToSearchFilterChanges();

      this.loadingScreenService.setLoadingState(false, 'body');
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
      regulation: new FormControl((this.queryParams && this.queryParams.regulation) || ''),
      companyName: new FormControl((this.queryParams && this.queryParams.companyName) || ''),
      project: new FormControl((this.queryParams && this.queryParams.project) || '')
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
      delete this.queryParams['autofocus'];
      this.queryParams['keywords'] = this.keywordSearchWords;
    } else {
      delete this.queryParams['keywords'];
    }
    this.submit();
  }

  clearKeywordSearch() {
    this.keywordSearchWords = '';
    if (this.queryParams['keywords']) {
      delete this.queryParams['keywords'];
      this.submit();
    }
  }

  subscribeToSearchFilterChanges() {
    this.searchFiltersForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(changes => {
      if (changes.dateIssuedStart) {
        this.queryParams['dateRangeFromFilter'] = this.utils
          .convertFormGroupNGBDateToJSDate(changes.dateIssuedStart)
          .toISOString();
      } else {
        delete this.queryParams['dateRangeFromFilter'];
      }

      if (changes.dateIssuedEnd) {
        this.queryParams['dateRangeToFilter'] = this.utils
          .convertFormGroupNGBDateToJSDate(changes.dateIssuedEnd)
          .toISOString();
      } else {
        delete this.queryParams['dateRangeToFilter'];
      }

      if (changes.issuedToCompany) {
        this.queryParams['issuedToCompany'] = changes.issuedToCompany;
      } else {
        delete this.queryParams['issuedToCompany'];
      }

      if (changes.issuedToIndividual) {
        this.queryParams['issuedToIndividual'] = changes.issuedToIndividual;
      } else {
        delete this.queryParams['issuedToIndividual'];
      }

      if (changes.activityType && changes.activityType.length) {
        this.queryParams['activityType'] = changes.activityType;
      } else {
        delete this.queryParams['activityType'];
      }

      if (changes.agency && changes.agency.length) {
        this.queryParams['agency'] = changes.agency;
      } else {
        delete this.queryParams['agency'];
      }

      if (changes.act && changes.act.length) {
        this.queryParams['act'] = changes.act;
      } else {
        delete this.queryParams['act'];
      }

      if (changes.regulation && changes.regulation.length) {
        this.queryParams['regulation'] = changes.regulation;
      } else {
        delete this.queryParams['regulation'];
      }

      delete this.queryParams['companyName'];

      delete this.queryParams['project'];

      delete this.queryParams['autofocus'];

      this.router.navigate(['/records', this.queryParams]);
    });
  }

  /**
   * Update record table with latest values (whatever is set in this.tableData).
   *
   * @memberof RecordsListComponent
   */
  submit() {
    this.loadingScreenService.setLoadingState(true, 'body');

    // These are params that should be handled by tableData
    delete this.queryParams.sortBy;
    delete this.queryParams.currentPage;
    delete this.queryParams.pageNumber;
    delete this.queryParams.pageSize;

    this.router.navigate([
      '/records',
      { ...this.queryParams, ...this.tableTemplateUtils.getNavParamsObj(this.tableData) }
    ]);
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
