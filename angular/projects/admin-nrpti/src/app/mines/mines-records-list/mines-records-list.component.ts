import { Location } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import {
  IColumnObject,
  IPageSizePickerOption,
  ITableMessage,
  LoadingScreenService,
  TableObject,
  TableTemplateUtils,
  Utils
} from 'nrpti-angular-components';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MinesRecordsTableRowComponent } from '../mines-records-rows/mines-records-table-row.component';

/**
 * Mine list page component.
 *
 * @export
 * @class MinesRecordsListComponent
 * @implements {OnInit}
 * @implements {OnDestroy}
 */
@Component({
  selector: 'app-mines-records-list',
  templateUrl: './mines-records-list.component.html',
  styleUrls: ['./mines-records-list.component.scss']
})
export class MinesRecordsListComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  public tableData: TableObject = new TableObject({
    component: MinesRecordsTableRowComponent,
    pageSize: 25,
    currentPage: 1,
    sortBy: '-dateAdded'
  });
  public tableColumns: IColumnObject[] = [
    {
      name: '', // Checkbox
      width: 'col-1',
      nosort: true
    },
    {
      name: 'Record Name',
      value: 'recordName',
      width: 'col-2'
    },
    {
      name: 'Agency',
      value: 'issuingAgency',
      width: 'col-2'
    },
    {
      name: 'Source',
      value: 'sourceSystemRef',
      width: 'col-1',
      nosort: true
    },
    {
      name: 'Type',
      value: 'recordType',
      width: 'col-1'
    },
    {
      name: 'Collections',
      width: 'col-2',
      nosort: true
    },
    {
      name: 'Date',
      value: 'dateIssued',
      width: 'col-1'
    },
    {
      name: 'Published',
      width: 'col-1'
    },
    {
      name: '', // Buttons
      width: 'col-1',
      nosort: true
    }
  ];

  // Search
  public keywordSearchWords: string;
  public showAdvancedFilters = false;
  public selectedSubset = 'All';
  public queryParams: Params;
  public searchFiltersForm: FormGroup;

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
   * @memberof MinesRecordsListComponent
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

      this.route.data.pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: any) => {
        if (!res || !res.records) {
          alert("Uh-oh, couldn't load NRPTI mines records");
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
          this.queryParams['sourceSystemRef'] ||
          this.queryParams['hasDocuments'] ||
          this.queryParams['projects'] ||
          this.queryParams['isNrcedPublished'] ||
          this.queryParams['isLngPublished']
        ) {
          this.showAdvancedFilters = true;
        }
        this.setSubset();
        this.buildSearchFiltersForm();
        this.subscribeToSearchFilterChanges();
        this.loadingScreenService.setLoadingState(false, 'body');
        this._changeDetectionRef.detectChanges();
      });

      this._changeDetectionRef.detectChanges();
    });
  }

  /**
   * Update and trigger keyword search filter.
   *
   * @memberof MinesRecordsListComponent
   */
  keywordSearch() {
    if (this.keywordSearchWords) {
      this.queryParams['keywords'] = this.keywordSearchWords;
      // always change sortBy to '-score' if keyword search is directly triggered by user
      this.tableData.sortBy = '-score';
    } else {
      this.clearKeywordSearch();
    }
    this.tableData.currentPage = 1;
    this.submit();
  }

  /**
   * Resets sortBy to the default.
   *
   * @memberof RecordsListComponent
   */
  resetSortBy() {
    this.tableData.sortBy = '-dateAdded';
    this.queryParams['sortBy'] = '-dateAdded';
  }

  /**
   * Resets the keyword search and all associated parameters/values.
   *
   * @memberof RecordsListComponent
   */
  clearKeywordSearch() {
    this.selectedSubset = 'All';
    this.clearKeywordSearchTerms();
    delete this.queryParams['keywords'];
    delete this.queryParams['subset'];
    if (!this.tableData.sortBy || this.tableData.sortBy === '-score') {
      // only change sortBy to the default, if sortBy is unset or if sorting has not been directly triggered by user
      this.tableData.sortBy = '-dateAdded';
    }
  }

  /**
   * Set keyword search filter to empty string.
   *
   * @memberof MinesRecordsListComponent
   */
  clearKeywordSearchTerms() {
    this.keywordSearchWords = '';
  }
  /**
   * Updates the url parameters based on the currently set query and table template params, without reloading the page.
   *
   * @memberof MinesRecordsListComponent
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
   * Build the search filters form.
   *
   * @memberof MinesRecordsListComponent
   */
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
      issuedToCompany: new FormControl((this.queryParams && this.queryParams.issuedToCompany) || false),
      issuedToIndividual: new FormControl((this.queryParams && this.queryParams.issuedToIndividual) || false),
      agency: new FormControl((this.queryParams && this.queryParams.agency) || null),
      act: new FormControl((this.queryParams && this.queryParams.act) || null),
      regulation: new FormControl((this.queryParams && this.queryParams.regulation) || null),
      activityType: new FormControl((this.queryParams && this.queryParams.activityType) || null),
      sourceSystemRef: new FormControl(
        (this.queryParams && this.queryParams.sourceSystemRef && this.queryParams.sourceSystemRef.split(',')) || null
      ),
      hasDocuments: new FormControl((this.queryParams && this.queryParams.hasDocuments) || false),
      projects: new FormGroup({
        lngCanada: new FormControl(
          (this.queryParams && this.queryParams.projects && this.queryParams.projects.includes('lngCanada')) || false
        ),
        coastalGaslink: new FormControl(
          (this.queryParams && this.queryParams.projects && this.queryParams.projects.includes('coastalGaslink')) ||
            false
        ),
        otherProjects: new FormControl(
          (this.queryParams && this.queryParams.projects && this.queryParams.projects.includes('otherProjects')) ||
            false
        )
      }),
      isNrcedPublished: new FormControl((this.queryParams && this.queryParams.isNrcedPublished) || false),
      isLngPublished: new FormControl((this.queryParams && this.queryParams.isLngPublished) || false)
    });
  }

  /**
   * Listen for search filter component changes, update query params accordingly, and re-load list content.
   *
   * @memberof MinesRecordsListComponent
   */
  subscribeToSearchFilterChanges() {
    this.searchFiltersForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(changes => {
      if (changes.activityType) {
        this.queryParams['activityType'] = changes.activityType;
      } else {
        delete this.queryParams['activityType'];
      }

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

      if (changes.sourceSystemRef && changes.sourceSystemRef.length) {
        this.queryParams['sourceSystemRef'] = changes.sourceSystemRef;
      } else {
        delete this.queryParams['sourceSystemRef'];
      }

      if (changes.hasDocuments) {
        this.queryParams['hasDocuments'] = changes.hasDocuments;
      } else {
        delete this.queryParams['hasDocuments'];
      }

      if (changes.projects && this.getProjectsFilterArray(changes.projects).length) {
        this.queryParams['projects'] = this.getProjectsFilterArray(changes.projects);
      } else {
        delete this.queryParams['projects'];
      }
      if (changes.isNrcedPublished) {
        this.queryParams['isNrcedPublished'] = changes.isNrcedPublished;
      } else {
        delete this.queryParams['isNrcedPublished'];
      }
      if (changes.isLngPublished) {
        this.queryParams['isLngPublished'] = changes.isLngPublished;
      } else {
        delete this.queryParams['isLngPublished'];
      }
      this.submit();
    });
  }

  /**
   * Receives messages from the table template component, and performs any corresponding actions.
   *
   * @param {ITableMessage} msg
   * @memberof MinesRecordsListComponent
   */
  onMessageOut(msg: ITableMessage) {
    switch (msg.label) {
      case 'rowSelected':
        this.onRowCheckboxUpdate(msg.data, true);
        break;
      case 'rowUnselected':
        this.onRowCheckboxUpdate(msg.data, false);
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
   * @memberof MinesRecordsListComponent
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
   * @memberof MinesRecordsListComponent
   */
  onPageNumUpdate(pageNumber) {
    this.tableData.currentPage = pageNumber;
    this.submit();
  }

  /**
   * Page size picker option selected handler.
   *
   * @param {IPageSizePickerOption} pageSize
   * @memberof MinesRecordsListComponent
   */
  onPageSizeUpdate(pageSize: IPageSizePickerOption) {
    this.tableData.pageSize = pageSize.value;
    this.submit();
  }

  /**
   * Table multi-select handler.
   *
   * @param {*} rowData data for the row that was selected or unselected
   * @param {boolean} checked whether or not the row was selected or unselected
   * @memberof MinesRecordsListComponent
   */
  onRowCheckboxUpdate(rowData: any, checked: boolean) {
    // TODO real multi-select functionality (adding to collections, etc)
  }

  /**
   * Update mine table with latest values (whatever is set in this.tableData).
   *
   * @memberof MinesRecordsListComponent
   */
  submit() {
    // These are params that should be handled by tableData
    delete this.queryParams.sortBy;
    delete this.queryParams.currentPage;
    delete this.queryParams.pageNumber;
    delete this.queryParams.pageSize;

    this.loadingScreenService.setLoadingState(true, 'body');

    this.router.navigate([{ ...this.queryParams, ...this.tableTemplateUtils.getNavParamsObj(this.tableData) }], {
      relativeTo: this.route
    });
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
      case 'Record Name':
        this.selectedSubset = 'Record Name';
        this.queryParams['subset'] = ['recordName'];
        break;
      default:
        break;
    }
    if (this.keywordSearchWords) {
      this.queryParams.keywords = this.keywordSearchWords;
      // always change sortBy to '-score' if keyword search is directly triggered by user
      this.tableData.sortBy = '-score';
      this.submit();
    }
  }

  /**
   * Set subset filters.
   *
   * @memberof MinesRecordsListComponent
   */
  setSubset() {
    if (!this.queryParams.subset) {
      this.selectedSubset = 'All';
    } else if (this.queryParams.subset.includes('issuedTo')) {
      this.selectedSubset = 'Issued To';
    } else if (this.queryParams.subset.includes('location')) {
      this.selectedSubset = 'Location';
    } else if (this.queryParams.subset.includes('description')) {
      this.selectedSubset = 'Description & Summary';
    } else if (this.queryParams.subset.includes('recordName')) {
      this.selectedSubset = 'Record Name';
    }
  }

  /**
   * Builds an array of project names, for project filters that are enabled/selected.
   *
   * @param {object} projects changes.projects object
   * @returns {string[]} array of project names
   * @memberof MinesRecordsListComponent
   */
  getProjectsFilterArray(projects: object): string[] {
    if (!projects) {
      return [];
    }

    const projectsQueryParam: string[] = [];

    for (const projectName of Object.keys(projects)) {
      if (projects[projectName]) {
        projectsQueryParam.push(projectName);
      }
    }

    return projectsQueryParam;
  }

  /**
   * Cleanup on component destroy.
   *
   * @memberof MinesRecordsListComponent
   */
  ngOnDestroy(): void {
    this.loadingScreenService.setLoadingState(false, 'body');

    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
