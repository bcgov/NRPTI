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
import { FormGroup } from '@angular/forms';
import { SearchSubsets, Picklists } from '../../../../../common/src/app/utils/record-constants';

import { SubsetsObject, SubsetOption } from '../../../../../common/src/app/search-filter-template/subset-object';
import { FilterObject, FilterType, DateFilterDefinition, CheckOrRadioFilterDefinition, OptionItem, MultiSelectDefinition, DropdownDefinition, RadioOptionItem } from '../../../../../common/src/app/search-filter-template/filter-object';
import { FactoryService } from '../../services/factory.service';

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

  public SearchSubsets = SearchSubsets; // make available in tempalte

  public searchFiltersForm: FormGroup;

  public tableData: TableObject = new TableObject({
    component: RecordsTableRowComponent,
    pageSize: 25,
    currentPage: 1,
    sortBy: '-dateAdded'
  });
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
      width: 'col-1',
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
  public queryParams: Params;

  // New Search
  public filters: FilterObject[] = [];
  public subsets: SubsetsObject;
  public showFullRecordList = true;

  constructor(
    public location: Location,
    public router: Router,
    public route: ActivatedRoute,
    public utils: Utils,
    private loadingScreenService: LoadingScreenService,
    private tableTemplateUtils: TableTemplateUtils,
    private _changeDetectionRef: ChangeDetectorRef,
    public factoryService: FactoryService
  ) {
    // setup the subset configuration
    const subsetOptions = [
      new SubsetOption('', 'All'),
      new SubsetOption('issuedTo', 'Issued To'),
      new SubsetOption('location', 'Location'),
      new SubsetOption('description', 'Description & Summary'),
      new SubsetOption('recordName', 'Record Name')
    ];
    this.subsets = new SubsetsObject(subsetOptions);

    // setup the advanced filters
    const issuedDateFilter = new FilterObject(
      'issuedDate',
      FilterType.DateRange,
      '', // if you include a name, it will add a label to the date range filter.
      new DateFilterDefinition('dateRangeFromFilter', 'Start Issued Date', 'dateRangeToFilter', 'End Issued Date')
    );

    const entityTypeFilter = new FilterObject(
      'entityType',
      FilterType.Checkbox,
      'Entity Type',
      new CheckOrRadioFilterDefinition([new OptionItem('issuedToCompany', 'Company'), new OptionItem('issuedToIndividual', 'Individual')])
    );

    const publishedStatefilter = new FilterObject(
      'isNrcedPublished',
      FilterType.RadioPicker,
      'NRCED Published State',
      new CheckOrRadioFilterDefinition([
        new RadioOptionItem('publishedState', 'Published', 'true'),
        new RadioOptionItem('unpubState', 'Unpublished', 'false')
      ])
    );

    const activityTypeFilter = new FilterObject(
      'activityType',
      FilterType.MultiSelect,
      'Type (Activity or Record)',
      new MultiSelectDefinition(Object.values(Picklists.activityTypePicklist).map(item => {
        return { value: item._schemaName, displayValue: item.displayName, selected: false, display: true };
      }), 'Begin typing to filter activities...', 'Select all that apply...')
    );

    const issuedUnderActFilter = new FilterObject(
      'act',
      FilterType.MultiSelect,
      'Issued Under which Act',
      new MultiSelectDefinition(Picklists.getAllActs().map(value => {
        return { value: value, displayValue: value, selected: false, display: true };
      }), 'Begin typing to filter acts...', '')
    );

    const lngPublishedStatefilter = new FilterObject(
      'isLngPublished',
      FilterType.RadioPicker,
      'LNG Published State',
      new CheckOrRadioFilterDefinition([
        new RadioOptionItem('lngPublishedState', 'Published', 'true'),
        new RadioOptionItem('lngUnpubState', 'Unpublished', 'false')
      ])
    );

    const responsibleAgencyFilter = new FilterObject(
      'agency',
      FilterType.MultiSelect,
      'Responsible Agency',
      new MultiSelectDefinition(Picklists.agencyPicklist.map(value => {
        const displayValue = Utils.convertAcronyms(value);
        return { value: value, displayValue: displayValue, selected: false, display: true };
      }), 'Begin typing to filter agencies...', '')
    );

    const issuedUnderRegFilter = new FilterObject(
      'regulation',
      FilterType.MultiSelect,
      'Issued Under which Regulation',
      new MultiSelectDefinition(Picklists.getAllRegulations().map(value => {
        return { value: value, displayValue: value, selected: false, display: true };
      }), 'Begin typing to filter regulations...', '')
    );

    const sourceSystemFilter = new FilterObject(
      'sourceSystemRef',
      FilterType.Dropdown,
      'Source System',
      new DropdownDefinition(Picklists.sourceSystemRefPicklist)
    );

    const projectFilter = new FilterObject(
      'projects',
      FilterType.Checkbox,
      'Project',
      new CheckOrRadioFilterDefinition([
        new OptionItem('lngCanada', 'LNG Canada'),
        new OptionItem('coastalGaslink', 'Coastal Gaslink'),
        new OptionItem('otherProjects', 'Other')],
        true)
    );

    const documentsfilter = new FilterObject(
      'hasDocuments',
      FilterType.RadioPicker,
      'Documents',
      new CheckOrRadioFilterDefinition([
        new RadioOptionItem('yesDoc', 'Yes', 'true'),
        new RadioOptionItem('noDoc', 'No', 'false')
      ])
    );

    this.filters = [
      issuedDateFilter,
      entityTypeFilter,
      publishedStatefilter,
      activityTypeFilter,
      issuedUnderActFilter,
      lngPublishedStatefilter,
      responsibleAgencyFilter,
      issuedUnderRegFilter,
      sourceSystemFilter,
      projectFilter,
      documentsfilter
    ];

    // if a user has only ADMIN_WF role, show reduced list
    this.showFullRecordList
      = this.factoryService.userInAdminRole()
      || this.factoryService.userInBcmiRole()
      || this.factoryService.userInLngRole()
      || this.factoryService.userInNrcedRole();
  }

  executeSearch(searchPackage) {
    this.clearQueryParamsFilters();

    // check keyword
    if (searchPackage.keywords) {
      this.queryParams['keywords'] = searchPackage.keywords;
      // always change sortBy to '-score' if keyword search is directly triggered by user
      if (searchPackage.keywordsChanged) {
        this.tableData.sortBy = '-score';
      }
    }

    // check subset
    if (searchPackage.subset) {
      this.queryParams['subset'] = [searchPackage.subset];
    }

    Object.keys(searchPackage.filters).forEach(filter => {
      this.queryParams[filter] = searchPackage.filters[filter];
    });

    this.tableData.currentPage = 1;
    this.submit();
  }

  private clearQueryParamsFilters() {
    delete this.queryParams['keywords'];
    delete this.queryParams['subset'];
    delete this.queryParams['activityType'];
    delete this.queryParams['dateRangeFromFilter'];
    delete this.queryParams['dateRangeToFilter'];
    delete this.queryParams['issuedToCompany'];
    delete this.queryParams['issuedToIndividual'];
    delete this.queryParams['activityType'];
    delete this.queryParams['agency'];
    delete this.queryParams['act'];
    delete this.queryParams['regulation'];
    delete this.queryParams['sourceSystemRef'];
    delete this.queryParams['hasDocuments'];
    delete this.queryParams['projects'];
    delete this.queryParams['isNrcedPublished'];
    delete this.queryParams['isLngPublished'];
  }

  /**
   * Component init.
   *
   * @memberof RecordsListComponent
   */
  ngOnInit(): void {
    this.loadingScreenService.setLoadingState(true, 'body');
    this.route.params.pipe(takeUntil(this.ngUnsubscribe)).subscribe(params => {
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
          this.queryParams['sourceSystemRef'] ||
          this.queryParams['hasDocuments'] ||
          this.queryParams['projects'] ||
          this.queryParams['isNrcedPublished'] ||
          this.queryParams['isLngPublished']
        ) {
          this.showAdvancedFilters = true;
        }

        this.loadingScreenService.setLoadingState(false, 'body');
        this._changeDetectionRef.detectChanges();
      });

      this._changeDetectionRef.detectChanges();
    });
  }

  /**
   * Updates the url parameters based on the currently set query and table template params, without reloading the page.
   *
   * @memberof RecordsListComponent
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
   * Resets sortBy to the default.
   *
   * @memberof RecordsListComponent
   */
  resetSortBy() {
    this.tableData.sortBy = '-dateAdded';
    this.queryParams['sortBy'] = '-dateAdded';
  }

  add(item) {
    this.router.navigate(['records', item, 'add']);
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
