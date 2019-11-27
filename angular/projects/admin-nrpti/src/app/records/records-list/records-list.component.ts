import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Params, Router } from '@angular/router';
import moment from 'moment';
import flatMap from 'lodash.flatmap';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IRecordQueryParamSet, QueryParamModifier } from '../../services/api.service';
import { Record } from '../../models/record';
import { ExportService } from 'nrpti-angular-components';
import { Utils } from '../../utils/utils'; // used in template
import { DemoCodes } from '../../utils/constants/record-constants';
import { ConstantUtils, CodeType } from '../../utils/constants/constant-utils';
import { FactoryService } from '../../services/factory.service';

interface IPaginationParameters {
  totalItems?: number;
  currentPage?: number;
}

/**
 * List page component.
 *
 * Supports searching, filtering, pagination, and exporting.
 * All parameters are saved to and read from the URL for easy link sharing.
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

  // url parameters, used to set the initial state of the page on load
  public paramMap: ParamMap = null;

  // indicates the page is isLoading
  public isLoading = true;
  // indicates a search is in progress
  public isSearching = false;
  // indicates an export is in progress
  public isExporting = false;

  // list of records to display
  public records: Record[] = [];

  // drop down filters values
  public demoCodes = new DemoCodes().getCodeGroups();

  // selected drop down filters
  public demoCodeFilters: string[] = [];

  // need to reset pagination when a filter is changed, as we can't be sure how many pages of results will exist.
  public filterChanged = false;

  // pagination values
  public pagination = {
    totalItems: 0,
    currentPage: 1,
    itemsPerPage: 25,
    pageCount: 1,
    message: ''
  };

  // sorting values
  public sorting = {
    column: null,
    direction: 0
  };

  constructor(
    public location: Location,
    public router: Router,
    public route: ActivatedRoute,
    public factoryService: FactoryService,
    public exportService: ExportService
  ) {}

  /**
   * Component init.
   *
   * @memberof RecordsListComponent
   */
  ngOnInit(): void {
    this.route.queryParamMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe(paramMap => {
      this.paramMap = paramMap;

      this.setInitialQueryParameters();
      // this.getRecords();
    });
  }

  /**
   * Fetches records from NRPTI based on the current filter and pagination parameters.
   *
   * Makes 2 calls:
   * - get records (fetches at most pagination.itemsPerPage records)
   * - get records count (the total count of matching records, used when rendering pagination controls)
   *
   * @memberof RecordsListComponent
   */
  public getRecords = (): void => {
    this.isSearching = true;

    if (this.filterChanged) {
      this.resetPagination();
    }

    forkJoin(
      this.factoryService.getAll(this.getRecordQueryParamSets()),
      this.factoryService.getCount(this.getRecordQueryParamSets())
    )
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        ([records, count]) => {
          this.updatePagination({ totalItems: count });
          this.records = records;

          this.isSearching = false;
          this.isLoading = false;
        },
        error => {
          console.log('getRecords error:', error);
          alert("Uh-oh, couldn't load records");
          this.router.navigate(['/']);
        }
      );
  };

  // Export

  /**
   * Fetches all records that match the filter criteria (ignores pagination) and parses the resulting json into
   * a csv for download.  Includes more fields than are shown on the web-page.
   *
   * @memberof RecordsListComponent
   */
  public export(): void {
    this.isExporting = true;
    const queryParamsSet = this.getRecordQueryParamSets();

    // ignore pagination as we want to export ALL filtered results, not just the first page.
    queryParamsSet.forEach(element => {
      delete element.pageNum;
      delete element.pageSize;
    });

    this.factoryService
      .getAll(queryParamsSet)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        records => {
          // All fields that will be included in the csv, and optionally what the column header text will be.
          // See www.npmjs.com/package/json2csv for details on the format of the fields array.
          const fields: any[] = [
            { label: 'File #', value: ExportService.getExportPadFormatter('fileId', 10, '0') },
            { label: 'Created Date', value: ExportService.getExportDateFormatter('createdDate') },
            { label: 'Publish Date', value: ExportService.getExportDateFormatter('publishDate') },
            { label: 'Description', value: 'description' }
          ];
          this.exportService.exportAsCSV(records, `NRPTI_Export_${moment().format('YYYY-MM-DD_HH-mm')}`, fields);
        },
        error => {
          console.log('export error:', error);
          alert("Uh-oh, couldn't export records");
        },
        () => {
          this.isExporting = false;
        }
      );
  }

  // URL Parameters

  /**
   * Set any initial filter, pagination, and sort values that were saved in the URL.
   *
   * @memberof RecordsListComponent
   */
  public setInitialQueryParameters(): void {
    this.pagination.currentPage = +this.paramMap.get('page') || 1;

    this.sorting.column = (this.paramMap.get('sortBy') && this.paramMap.get('sortBy').slice(1)) || null;
    this.sorting.direction =
      (this.paramMap.get('sortBy') && (this.paramMap.get('sortBy').charAt(0) === '-' ? -1 : 1)) || 0;

    this.demoCodeFilters = (this.paramMap.get('demo') && this.paramMap.get('demo').split('|')) || [];
  }

  /**
   * Builds an array of query parameter sets.
   *
   * Each query parameter set in the array should return a distinct set of results.
   *
   * The combined results from all query parameter sets is needed to fully satisfy the filters.
   *
   * @returns {IRecordQueryParamSet[]} An array of distinct query parameter sets.
   * @memberof RecordsListComponent
   */
  public getRecordQueryParamSets(): IRecordQueryParamSet[] {
    const recordQueryParamSet: IRecordQueryParamSet[] = [];

    const basicQueryParams: IRecordQueryParamSet = {
      isDeleted: false,
      pageNum: this.pagination.currentPage - 1, // API starts at 0, while this component starts at 1
      pageSize: this.pagination.itemsPerPage,
      demo: {
        value: flatMap(this.demoCodeFilters.map(demoCode => ConstantUtils.getCode(CodeType.DEMO, demoCode))),
        modifier: QueryParamModifier.Equal
      }
    };

    if (this.sorting.column && this.sorting.direction) {
      basicQueryParams.sortBy = `${this.sorting.direction === -1 ? '-' : '+'}${this.sorting.column}`;
    }

    recordQueryParamSet.push(basicQueryParams);

    return recordQueryParamSet;
  }

  /**
   * Save filter, pagination, and sort values as params in the URL.
   *
   * @memberof RecordsListComponent
   */
  public saveQueryParameters(): void {
    const params: Params = {};

    params['page'] = this.pagination.currentPage;

    if (this.sorting.column && this.sorting.direction) {
      params['sortBy'] = `${this.sorting.direction === -1 ? '-' : '+'}${this.sorting.column}`;
    }

    if (this.demoCodeFilters && this.demoCodeFilters.length) {
      params['demo'] = Utils.convertArrayIntoPipeString(this.demoCodeFilters);
    }

    // change browser URL without reloading page (so all query params are saved in the browsers history)
    this.location.go(this.router.createUrlTree([], { relativeTo: this.route, queryParams: params }).toString());
  }

  /**
   * Reset filter, pagination, and sort values to their defaults.
   *
   * @memberof RecordsListComponent
   */
  public clearQueryParameters(): void {
    this.pagination.currentPage = 1;
    this.pagination.totalItems = 0;

    this.sorting.column = null;
    this.sorting.direction = 0;

    this.demoCodeFilters = [];

    this.location.go(this.router.createUrlTree([], { relativeTo: this.route }).toString());
  }

  // Filters

  /**
   * TODO This is a working placeholder while we decide what filters are actually needed.
   *
   * Set record demo filter.
   *
   * @param {string} demo
   * @memberof RecordsListComponent
   */
  public setDemoFilter(demo: string): void {
    this.demoCodeFilters = demo ? [demo] : [];
    this.filterChanged = true;
    this.saveQueryParameters();
  }

  // Sorting

  /**
   * Sets the sort properties (column, direction) used by the OrderBy pipe.
   *
   * @param {string} sortBy
   * @memberof DocumentsComponent
   */
  public sort(sortBy: string): void {
    if (!sortBy) {
      return;
    }

    if (this.sorting.column === sortBy) {
      // when sorting on the same column, toggle sorting
      this.sorting.direction = this.sorting.direction > 0 ? -1 : 1;
    } else {
      // when sorting on a new column, sort descending
      this.sorting.column = sortBy;
      this.sorting.direction = 1;
    }

    this.saveQueryParameters();
    this.getRecords();
  }

  // Pagination

  /**
   * Updates the pagination variables.
   *
   * Note: some variables can be passed in, while others are always calculated based on other variables, and so can't
   * be set manually.
   *
   * @param {IPaginationParameters} [paginationParams=null]
   * @returns {void}
   * @memberof RecordsListComponent
   */
  public updatePagination(paginationParams: IPaginationParameters = null): void {
    if (!paginationParams) {
      // nothing to update
      return;
    }

    if (paginationParams.totalItems >= 0) {
      this.pagination.totalItems = paginationParams.totalItems;
    }

    if (paginationParams.currentPage >= 0) {
      this.pagination.currentPage = paginationParams.currentPage;
    }

    this.pagination.pageCount = Math.max(1, Math.ceil(this.pagination.totalItems / this.pagination.itemsPerPage));

    if (this.pagination.totalItems <= 0) {
      this.pagination.message = 'No records found';
    } else if (this.pagination.currentPage > this.pagination.pageCount) {
      // This check is necessary due to a rare edge-case where the user has manually incremented the page parameter in
      // the URL beyond what would normally be allowed. As a result when records are fetched, there aren't enough
      // to reach this page, and so the total records found is > 0, but the records displayed for this page
      // is 0, which may confuse users.  Tell them to press clear button which will reset the pagination url parameter.
      this.pagination.message = 'Unable to display results, please clear and re-try';
    } else {
      const low = Math.max((this.pagination.currentPage - 1) * this.pagination.itemsPerPage + 1, 1);
      const high = Math.min(this.pagination.totalItems, this.pagination.currentPage * this.pagination.itemsPerPage);
      this.pagination.message = `Displaying ${low} - ${high} of ${this.pagination.totalItems} records`;
    }
  }

  /**
   * Resets the pagination.currentPage variable locally and in the URL.
   *
   * @memberof RecordsListComponent
   */
  public resetPagination(): void {
    // Minor UI improvement: don't call updatePagination here directly, as it will change the message briefly, before
    // it is updated by the getRecords call.
    this.pagination.currentPage = 1;
    this.saveQueryParameters();
    this.filterChanged = false;
  }

  /**
   * Increments or decrements the pagination.currentPage by 1.
   *
   * @param {number} [page=0] either 1 or -1
   * @memberof RecordsListComponent
   */
  public updatePage(page: number = 0): void {
    if (
      (page === -1 && this.pagination.currentPage + page >= 1) ||
      (page === 1 && this.pagination.pageCount >= this.pagination.currentPage + page)
    ) {
      this.updatePagination({ currentPage: this.pagination.currentPage += page });
      this.saveQueryParameters();
      this.getRecords();
    }
  }

  /**
   * Jumps the pagination to the specified page.  Won't allow changes to pages that have no results.
   *
   * @param {number} [page=0] a number > 0
   * @memberof RecordsListComponent
   */
  public setPage(page: number = 0): void {
    if (page >= 1 && this.pagination.pageCount >= page) {
      this.updatePagination({ currentPage: page });
      this.saveQueryParameters();
      this.getRecords();
    }
  }

  // Other

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
