import { Location } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
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
import { MinesCollectionsTableRowComponent } from '../mines-collections-rows/mines-collections-table-row.component';
import {
  FilterObject,
  FilterType,
  CheckOrRadioFilterDefinition,
  RadioOptionItem,
  DateFilterDefinition,
  MultiSelectDefinition
} from '../../../../../common/src/app/search-filter-template/filter-object';
import { Mine } from '../../../../../common/src/app/models/bcmi/mine';
import { StateIDs, StateStatus, Picklists } from '../../../../../common/src/app/utils/record-constants';
import { MiscUtils } from '../../utils/constants/misc';
import { FactoryService } from '../../services/factory.service';
import { AgencyDataService } from '../../../../../global/src/lib/utils/agency-data-service';

/**
 * Mine list page component.
 *
 * @export
 * @class MinesCollectionsListComponent
 * @implements {OnInit}
 * @implements {OnDestroy}
 */
@Component({
  standalone: false,
  selector: 'app-mines-collections-list',
  templateUrl: './mines-collections-list.component.html',
  styleUrls: ['./mines-collections-list.component.scss']
})
export class MinesCollectionsListComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<void> = new Subject<void>();

  public tableData: TableObject = new TableObject({
    component: MinesCollectionsTableRowComponent,
    pageSize: 25,
    currentPage: 1,
    sortBy: '-dateAdded'
  });

  public tableColumns: IColumnObject[] = [
    {
      name: 'Collection Name',
      value: 'name',
      width: 'col-2'
    },
    {
      name: 'Agency',
      value: 'agency',
      width: 'col-2'
    },
    {
      name: 'Type',
      value: 'type',
      width: 'col-2'
    },
    {
      name: 'Date',
      value: 'date',
      width: 'col-2'
    },
    {
      name: '# of Records',
      value: 'countrecords',
      width: 'col-1'
    },
    {
      name: 'Source',
      value: 'sourceSystemRef',
      width: 'col-1'
    }
  ];

  public showAdvancedFilters = false;
  public filters: FilterObject[] = [];
  public queryParams: Params;
  public mine: Mine;

  // collection add edit state
  public collectionState = null;

  constructor(
    public location: Location,
    public router: Router,
    public route: ActivatedRoute,
    public utils: Utils,
    private storeService: StoreService,
    private loadingScreenService: LoadingScreenService,
    private tableTemplateUtils: TableTemplateUtils,
    private _changeDetectionRef: ChangeDetectorRef,
    private factoryService: FactoryService
  ) {
    // Advance search filter set up.
    const dateFilter = new FilterObject(
      'date',
      FilterType.DateRange,
      '', // if you include a name, it will add a label to the date range filter.
      new DateFilterDefinition('dateRangeFromFilter', 'Start Date', 'dateRangeToFilter', 'End Date')
    );

    const collectionTypeFilter = new FilterObject(
      'type',
      FilterType.MultiSelect,
      'Collection Type',
      new MultiSelectDefinition(
        Picklists.collectionTypePicklist.map(item => {
          return { value: item, displayValue: item, selected: false, display: true };
        }),
        'Begin typing to filter collection types...',
        'Select all that apply...'
      )
    );

    const responsibleAgencyFilter = new FilterObject(
      'agency',
      FilterType.MultiSelect,
      'Agency',
      new MultiSelectDefinition(
        Picklists.getAgencyNames(this.factoryService).map(value => {
          const agencyDataService = new AgencyDataService(this.factoryService);
          const displayValue = agencyDataService.displayNameFull(value);
          const picklistCodes = Picklists.getAgencyCode(this.factoryService, value);
          return { value: picklistCodes, displayValue: displayValue, selected: false, display: true };
        }),
        'Begin typing to filter agencies...',
        ''
      )
    );

    const bcmiTabFilter = new FilterObject(
      'bcmiTabType',
      FilterType.MultiSelect,
      'Tab on BCMI',
      new MultiSelectDefinition(
        ['Authorizations', 'Compliance Oversight', 'Other'].map(item => {
          return { value: item, displayValue: item, selected: false, display: true };
        }),
        'Begin typing to filter BCMI tab types...',
        ''
      )
    );

    const recordsFilter = new FilterObject(
      'hasRecords',
      FilterType.RadioPicker,
      'Has Associated Records',
      new CheckOrRadioFilterDefinition([
        new RadioOptionItem('yesDoc', 'Yes', 'true'),
        new RadioOptionItem('noDoc', 'No', 'false')
      ])
    );

    this.filters = [dateFilter, collectionTypeFilter, responsibleAgencyFilter, bcmiTabFilter, recordsFilter];
  }

  /**
   * Component init.
   *
   * @memberof MinesCollectionsListComponent
   */
  ngOnInit(): void {
    this.loadingScreenService.setLoadingState(true, 'body');

    this.setOrRemoveCollectionAddEditState();

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
        if (!res || !res.collections || !res.mine) {
          alert("Uh-oh, couldn't load NRPTI mines collections");
          this.loadingScreenService.setLoadingState(false, 'body');
          return;
        }

        this.mine = res.mine[0] && res.mine[0].data && new Mine(res.mine[0].data);

        MiscUtils.updateBreadcrumbLabel(this.mine, this.route.root);

        const collections =
          (res.collections[0] && res.collections[0].data && res.collections[0].data.searchResults) || [];
        this.tableData.items = collections.map(record => {
          return { rowData: record };
        });

        this.tableData.totalListItems =
          (res.collections[0] &&
            res.collections[0].data &&
            res.collections[0].data.meta &&
            res.collections[0].data.meta[0] &&
            res.collections[0].data.meta[0].searchResultsTotal) ||
          0;

        this.tableData.columns = this.tableColumns;

        this.loadingScreenService.setLoadingState(false, 'body');
        this._changeDetectionRef.detectChanges();
      });

      this._changeDetectionRef.detectChanges();
    });
  }

  /**
   * Resets sortBy to the default.
   *
   * @memberof MinesCollectionsListComponent
   */
  resetSortBy() {
    this.tableData.sortBy = '-dateAdded';
    this.queryParams['sortBy'] = '-dateAdded';
  }

  /**
   * Updates the url parameters based on the currently set query and table template params, without reloading the page.
   *
   * @memberof MinesCollectionsListComponent
   */
  setInitialURLParams() {
    this.location.go(
      this.router
        .createUrlTree(
          ['../collections', { ...this.queryParams, ...this.tableTemplateUtils.getNavParamsObj(this.tableData) }],
          {
            relativeTo: this.route
          }
        )
        .toString()
    );
  }

  /**
   * Receives messages from the table template component, and performs any corresponding actions.
   *
   * @param {ITableMessage} msg
   * @memberof MinesCollectionsListComponent
   */
  onMessageOut(msg: ITableMessage) {
    switch (msg.label) {
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
   * @memberof MinesCollectionsListComponent
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
   * @memberof MinesCollectionsListComponent
   */
  onPageNumUpdate(pageNumber) {
    this.tableData.currentPage = pageNumber;
    this.submit();
  }

  /**
   * Page size picker option selected handler.
   *
   * @param {IPageSizePickerOption} pageSize
   * @memberof MinesCollectionsListComponent
   */
  onPageSizeUpdate(pageSize: IPageSizePickerOption) {
    this.tableData.pageSize = pageSize.value;
    this.submit();
  }

  /**
   * Update mine table with latest values (whatever is set in this.tableData).
   *
   * @memberof MinesCollectionsListComponent
   */
  submit() {
    // These are params that should be handled by tableData
    delete this.queryParams.sortBy;
    delete this.queryParams.currentPage;
    delete this.queryParams.pageNumber;
    delete this.queryParams.pageSize;

    this.loadingScreenService.setLoadingState(true, 'body');

    this.router.navigate(['./', { ...this.queryParams, ...this.tableTemplateUtils.getNavParamsObj(this.tableData) }], {
      relativeTo: this.route
    });
  }

  /**
   * Navigate to collection add-edit page.
   *
   * @memberof MinesCollectionsListComponent
   */
  addCollection() {
    this.router.navigate(['mines', this.mine._id, 'collections', 'add']);
  }

  /**
   * Cleanup on component destroy.
   *
   * @memberof MinesCollectionsListComponent
   */
  ngOnDestroy(): void {
    // When the component is destroying, if collectionAddEdit state exists, but the user hadn't clicked the
    // 'Add to collection' button, then remove the state from the store.
    const collectionAddEditState = this.storeService.getItem(StateIDs.collectionAddEdit);
    if (collectionAddEditState && collectionAddEditState.status !== StateStatus.valid) {
      this.storeService.removeItem(StateIDs.collectionAddEdit);
    }

    this.loadingScreenService.setLoadingState(false, 'body');

    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
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

  /**
   * Sets the initial collectionState state, or removes it from the store if it is invalid.
   *
   * @memberof MinesRecordsListComponent
   */
  setOrRemoveCollectionAddEditState() {
    const tempCollectionAddEditState = this.storeService.getItem(StateIDs.collectionAddEdit);
    if (tempCollectionAddEditState) {
      if (tempCollectionAddEditState.status === StateStatus.invalid) {
        this.storeService.removeItem(StateIDs.collectionAddEdit);
      } else {
        this.collectionState = tempCollectionAddEditState;
      }
    }
  }

  private clearQueryParamsFilters() {
    delete this.queryParams['keywords'];
    delete this.queryParams['isBcmiPublished'];
    delete this.queryParams['dateRangeToFilter'];
    delete this.queryParams['dateRangeFromFilter'];
    delete this.queryParams['hasRecords'];
    delete this.queryParams['type'];
    delete this.queryParams['agency'];
    delete this.queryParams['bcmiTabType'];
  }
}
