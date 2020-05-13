import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  TableTemplateUtils,
  TableObject,
  IColumnObject,
  IPageSizePickerOption,
  ITableMessage,
  Utils
} from 'nrpti-angular-components';
import { RecordsTableRowComponent } from '../records-rows/records-table-row.component';
import { LoadingScreenService } from 'nrpti-angular-components';
import { FormGroup, FormControl } from '@angular/forms';

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
  public searchFiltersForm: FormGroup;

  public tableData: TableObject = new TableObject({ component: RecordsTableRowComponent });
  public tableColumns: IColumnObject[] = [
    {
      name: 'Issued To',
      value: 'issuedTo.fullName', // sort on issuedTo.fullName
      width: 'col-2'
    },
    {
      name: 'Name',
      value: 'recordName',
      width: 'col-4'
    },
    {
      name: 'Type',
      value: 'recordType',
      width: 'col-1'
    },
    {
      name: 'Location',
      value: 'location',
      width: 'col-2'
    },
    {
      name: 'Date',
      value: 'dateIssued',
      width: 'col-1'
    },
    {
      name: 'Documents',
      value: '',
      width: 'col-2',
      nosort: true
    },
    {
      name: '',
      value: '',
      width: 'col-1',
      nosort: true
    }
  ];

  // Search
  public keywordSearchWords: string;
  public showAdvancedFilters = false;
  public selectedSubset = 'All';
  public queryParams: Params;

  constructor(
    public location: Location,
    public router: Router,
    public route: ActivatedRoute,
    public utils: Utils,
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
      this.queryParams = { ...params };
      // Get params from route, shove into the tableTemplateUtils so that we get a new dataset to work with.
      this.tableData = this.tableTemplateUtils.updateTableObjectWithUrlParams(params, this.tableData);

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

        this.keywordSearchWords = this.queryParams.keywords;

        // If an advanced filter setting is active, open advanced filter section on page load.
        if (
          this.queryParams['activityType'] ||
          this.queryParams['dateRangeFromFilter'] ||
          this.queryParams['dateRangeToFilter'] ||
          this.queryParams['issuedToCompany'] ||
          this.queryParams['issuedToIndividual'] ||
          this.queryParams['activityType'] ||
          this.queryParams['agency'] ||
          this.queryParams['act'] ||
          this.queryParams['regulation'] ||
          this.queryParams['sourceSystemRef']
        ) {
          this.showAdvancedFilters = true;
        }
        this.initSubset();
        this.buildSearchFiltersForm();
        this.subscribeToSearchFilterChanges();
        this.loadingScreenService.setLoadingState(false, 'body');
        this._changeDetectionRef.detectChanges();
      });
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
      agency: new FormControl((this.queryParams && this.queryParams.agency) || null),
      act: new FormControl((this.queryParams && this.queryParams.act) || null),
      regulation: new FormControl((this.queryParams && this.queryParams.regulation) || null),
      activityType: new FormControl((this.queryParams && this.queryParams.activityType) || null),
      sourceSystemRef: new FormControl((this.queryParams && this.queryParams.sourceSystemRef) || null)
    });
  }

  subscribeToSearchFilterChanges() {
    this.searchFiltersForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(changes => {
      if (changes.activityType) {
        this.queryParams['activityType'] = changes.activityType;
      } else {
        delete this.queryParams['activityType'];
      }

      if (changes.dateIssuedStart) {
        this.queryParams['dateRangeFromFilter'] =
          this.utils.convertFormGroupNGBDateToJSDate(changes.dateIssuedStart).toISOString();
      } else {
        delete this.queryParams['dateRangeFromFilter'];
      }

      if (changes.dateIssuedEnd) {
        this.queryParams['dateRangeToFilter'] =
          this.utils.convertFormGroupNGBDateToJSDate(changes.dateIssuedEnd).toISOString();
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

      console.log(changes.sourceSystemRef)
      if (changes.sourceSystemRef && changes.sourceSystemRef.length) {
        this.queryParams['sourceSystemRef'] = changes.sourceSystemRef;
      } else {
        delete this.queryParams['sourceSystemRef'];
      }
      this.submit();
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

  keywordSearch() {
    if (this.keywordSearchWords) {
      this.queryParams['keywords'] = this.keywordSearchWords;
    } else {
      this.selectedSubset = 'All';
      delete this.queryParams['keywords'];
      delete this.queryParams['subset'];
    }
    this.tableData.currentPage = 1;
    this.submit();
  }

  add(item) {
    switch (item) {
      case 'administrativePenalty':
        this.router.navigate(['records', 'administrative-penalties', 'add']);
        break;
      case 'administrativeSanction':
        this.router.navigate(['records', 'administrative-sanctions', 'add']);
        break;
      case 'agreement':
        this.router.navigate(['records', 'agreements', 'add']);
        break;
      case 'certificate':
        this.router.navigate(['records', 'certificates', 'add']);
        break;
      case 'constructionPlan':
        this.router.navigate(['records', 'construction-plans', 'add']);
        break;
      case 'courtConviction':
        this.router.navigate(['records', 'court-convictions', 'add']);
        break;
      case 'inspection':
        this.router.navigate(['records', 'inspections', 'add']);
        break;
      case 'managementPlan':
        this.router.navigate(['records', 'management-plans', 'add']);
        break;
      case 'order':
        this.router.navigate(['records', 'orders', 'add']);
        break;
      case 'permit':
        this.router.navigate(['records', 'permits', 'add']);
        break;
      case 'restorativeJustice':
        this.router.navigate(['records', 'restorative-justices', 'add']);
        break;
      case 'selfReport':
        this.router.navigate(['records', 'self-reports', 'add']);
        break;
      case 'ticket':
        this.router.navigate(['records', 'tickets', 'add']);
        break;
      case 'warning':
        this.router.navigate(['records', 'warnings', 'add']);
        break;
      default:
        break;
    }
  }

  toggleAdvancedFilters(): void {
    this.showAdvancedFilters = !this.showAdvancedFilters;
  }

  changeSubset(filterText): void {
    switch (filterText) {
      case 'All':
        this.selectedSubset = 'All';
        delete this.queryParams['subset'];
        break;
      case 'Description & Summary':
        this.selectedSubset = 'Description & Summary';
        this.queryParams['subset'] = ['description'];
        break;
      case 'Issued To':
        this.selectedSubset = 'Issued To';
        this.queryParams['subset'] = ['issuedTo'];
        break;
      case 'Location':
        this.selectedSubset = 'Location';
        this.queryParams['subset'] = ['location'];
        break;
      default:
        break;
    }
    if (this.keywordSearchWords) {
      this.queryParams.keywords = this.keywordSearchWords;
      if (!this.tableData.sortBy) {
        this.tableData.sortBy = '-score';
      }
      this.submit();
    }
  }

  initSubset() {
    if (!this.queryParams.subset) {
      this.selectedSubset = 'All';
    } else if (this.queryParams.subset.includes('issuedTo')) {
      this.selectedSubset = 'Issued To';
    } else if (this.queryParams.subset.includes('location')) {
      this.selectedSubset = 'Location';
    } else if (this.queryParams.subset.includes('description')) {
      this.selectedSubset = 'Description & Summary';
    }
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
