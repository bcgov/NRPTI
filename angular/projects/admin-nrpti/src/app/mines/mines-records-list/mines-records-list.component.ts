import { Location } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import {
  IColumnObject,
  IPageSizePickerOption,
  ITableMessage,
  LoadingScreenService,
  TableObject,
  TableTemplateUtils,
  Utils,
  StoreService
} from 'nrpti-angular-components';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MinesRecordsTableRowComponent } from '../mines-records-rows/mines-records-table-row.component';
import { SearchSubsets, Picklists, StateIDs } from '../../../../../common/src/app/utils/record-constants';
import { FilterObject, FilterType, DateFilterDefinition, CheckOrRadioFilterDefinition, RadioOptionItem, MultiSelectDefinition, DropdownDefinition } from '../../../../../common/src/app/search-filter-template/filter-object';
import { SubsetsObject, SubsetOption } from '../../../../../common/src/app/search-filter-template/subset-object';
import { Mine } from '../../../../../common/src/app/models/bcmi/mine';

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

  public SearchSubsets = SearchSubsets; // make available in tempalte
  public mine: Mine;

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
      value: 'isBcmiPubished',
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
  public queryParams: Params;

  public filters: FilterObject[] = [];
  public subsets: SubsetsObject;

  // Edit Collection
  public collectionAddEditState = this.storeService.getItem(StateIDs.collectionAddEdit);

  constructor(
    public location: Location,
    public router: Router,
    public route: ActivatedRoute,
    public utils: Utils,
    public storeService: StoreService,
    private loadingScreenService: LoadingScreenService,
    private tableTemplateUtils: TableTemplateUtils,
    private _changeDetectionRef: ChangeDetectorRef
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

    const issuedDateFilter = new FilterObject(
      'issuedDate',
      FilterType.DateRange,
      '', // if you include a name, it will add a label to the date range filter.
      new DateFilterDefinition('dateRangeFromFilter', 'Start Issued Date', 'dateRangeToFilter', 'End Issued Date'),
      6
    );

    const activityTypeFilter = new FilterObject(
      'activityType',
      FilterType.MultiSelect,
      'Activity Type',
      new MultiSelectDefinition(Object.values(Picklists.activityTypePicklist).map(item => {
        return { value: item._schemaName, displayValue: item.displayName, selected: false, display: true };
      }), 'Begin typing to filter activities...', 'Select all that apply...'),
      6
    );

    const responsibleAgencyFilter = new FilterObject(
      'agency',
      FilterType.MultiSelect,
      'Responsible Agency',
      new MultiSelectDefinition(Picklists.agencyPicklist.map(value => {
        return { value: value, displayValue: value, selected: false, display: true };
      }), 'Begin typing to filter agencies...', '')
    );

    const sourceSystemFilter = new FilterObject(
      'sourceSystemRef',
      FilterType.Dropdown,
      'Source System',
      new DropdownDefinition(Picklists.sourceSystemRefPicklist)
    );

    const bcmiPublishedStatefilter = new FilterObject(
      'isBcmiPublished',
      FilterType.RadioPicker,
      'BCMI Published State',
      new CheckOrRadioFilterDefinition([
        new RadioOptionItem('bcmiPublishedState', 'Published', 'true'),
        new RadioOptionItem('bcmiUnpubState', 'Unpublished', 'false')
      ])
    );

    const hasCollectionsStatefilter = new FilterObject(
      'hasCollection',
      FilterType.RadioPicker,
      'Has Associated Collection',
      new CheckOrRadioFilterDefinition([
        new RadioOptionItem('hasCollection', 'Yes', 'true'),
        new RadioOptionItem('doesNotHaveCollection', 'No', 'false')
      ])
    );

    this.filters = [
      issuedDateFilter,
      activityTypeFilter,
      responsibleAgencyFilter,
      sourceSystemFilter,
      bcmiPublishedStatefilter,
      hasCollectionsStatefilter];
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
    delete this.queryParams['dateRangeFromFilter'];
    delete this.queryParams['dateRangeToFilter'];
    delete this.queryParams['activityType'];
    delete this.queryParams['agency'];
    delete this.queryParams['sourceSystemRef'];
    delete this.queryParams['isBcmiPublished'];
    delete this.queryParams['hasCollection'];
  }

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
        if (!res || !res.records || !res.mine) {
          alert("Uh-oh, couldn't load NRPTI mines records");
          this.loadingScreenService.setLoadingState(false, 'body');
          return;
        }

        this.mine = res.mine[0] && res.mine[0].data && new Mine(res.mine[0].data);

        const records = (res.records[0] && res.records[0].data && res.records[0].data.searchResults) || [];

        const collectionAddEditStateRecordIds =
          (this.collectionAddEditState &&
            this.collectionAddEditState.collectionRecords &&
            this.collectionAddEditState.collectionRecords.map(
              collectionAddEditRecord => collectionAddEditRecord._id
            )) ||
          [];

        this.tableData.items = records.map(record => {
          return {
            rowData: {
              ...record,
              rowSelected: collectionAddEditStateRecordIds.includes(record._id)
            }
          };
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
   * Resets sortBy to the default.
   *
   * @memberof MinesRecordsListComponent
   */
  resetSortBy() {
    this.tableData.sortBy = '-dateAdded';
    this.queryParams['sortBy'] = '-dateAdded';
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
   * Adds/Removes records from the 'collectionAddEdit' state object.
   *
   * @param {*} rowData data for the row that was selected or unselected
   * @param {boolean} checked whether or not the row was selected or unselected
   * @memberof MinesRecordsListComponent
   */
  onRowCheckboxUpdate(rowData: any, checked: boolean) {
    if (!this.collectionAddEditState || !rowData) {
      return;
    }

    const collectionAddEditState = this.storeService.getItem(StateIDs.collectionAddEdit);
    const collectionRecords = (collectionAddEditState && collectionAddEditState.collectionRecords) || [];

    let isSelected = false;
    let selectedIndex = null;

    for (let i = 0; i < collectionRecords.length; i++) {
      if (collectionRecords[i]._id === rowData._id) {
        isSelected = true;
        selectedIndex = i;
        break;
      }
    }

    if (checked && !isSelected) {
      // add record that does not already exist
      collectionRecords.push(rowData);
    } else if (!checked && isSelected) {
      // remove record that already exists
      collectionRecords.splice(selectedIndex, 1);
    }

    // Update and save the collectionAddEdit state
    this.storeService.setItem({
      [StateIDs.collectionAddEdit]: {
        ...collectionAddEditState,
        collectionRecords
      }
    });
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

    this.router.navigate(
      ['../records', { ...this.queryParams, ...this.tableTemplateUtils.getNavParamsObj(this.tableData) }],
      {
        relativeTo: this.route
      }
    );
  }

  /**
   * Cancel adding records to collection.
   *
   * @memberof MinesRecordsListComponent
   */
  cancelAddEditCollectionRecords() {
    const shouldCancel = confirm(
      'Leaving this page will discard unsaved changes. Are you sure you would like to continue?'
    );
    if (shouldCancel) {
      // Reset the 'collectionRecords' array to the original unchanged 'originalCollectionsRecords' array.
      const collectionAddEditState = this.storeService.getItem(StateIDs.collectionAddEdit);
      this.storeService.setItem({
        [StateIDs.collectionAddEdit]: {
          ...collectionAddEditState,
          collectionRecords: collectionAddEditState.originalCollectionRecords
        }
      });

      if (this.storeService.getItem(StateIDs.collectionAddEdit).collectionId) {
        this.router.navigate(['mines', this.mine._id, 'collections', this.collectionAddEditState.collectionId, 'edit']);
      } else {
        this.router.navigate(['mines', this.mine._id, 'collections', 'add']);
      }
    }
  }

  /**
   * Submit adding records to collection.
   *
   * @memberof MinesRecordsListComponent
   */
  submitAddEditCollectionRecords() {
    if (this.collectionAddEditState.collectionId) {
      this.router.navigate(['mines', this.mine._id, 'collections', this.collectionAddEditState.collectionId, 'edit']);
    } else {
      this.router.navigate(['mines', this.mine._id, 'collections', 'add']);
    }
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
