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
import { RecordsTableRowComponent } from '../records-rows/records-table-row.component';

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
      width: 'col-2'
    },
    {
      name: '',
      value: '',
      width: 'col-1',
      nosort: true
    }
  ];

  public hidepanel = false;
  public filters = [
    {
      displayName: 'Record Type',
      textFilters: [
        {
          displayName: 'Order',
          fieldName: '_schemaName'
        },
        {
          displayName: 'Inspection',
          fieldName: '_schemaName'
        },
        {
          displayName: 'Certificate',
          fieldName: '_schemaName'
        },
        {
          displayName: 'Permit',
          fieldName: '_schemaName'
        },
        {
          displayName: 'SelfReport',
          fieldName: '_schemaName'
        },
        {
          displayName: 'Agreement',
          fieldName: '_schemaName'
        },
        {
          displayName: 'WarningLetter',
          fieldName: '_schemaName'
        },
        {
          displayName: 'RestorativeJustice',
          fieldName: '_schemaName'
        },
        {
          displayName: 'Ticket',
          fieldName: '_schemaName'
        },
        {
          displayName: 'AdministrativePenalty',
          fieldName: '_schemaName'
        },
        {
          displayName: 'AdministrativeSanction',
          fieldName: '_schemaName'
        },
        {
          displayName: 'Warning',
          fieldName: '_schemaName'
        },
        {
          displayName: 'ConstructionPlan',
          fieldName: '_schemaName'
        },
        {
          displayName: 'ManagementPlan',
          fieldName: '_schemaName'
        },
        {
          displayName: 'CourtConviction',
          fieldName: '_schemaName'
        }
      ]
    }
  ];

  constructor(
    public location: Location,
    public router: Router,
    public route: ActivatedRoute,
    private tableTemplateUtils: TableTemplateUtils,
    private _changeDetectionRef: ChangeDetectorRef
  ) {}

  /**
   * Component init.
   *
   * @memberof SearchComponent
   */
  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.ngUnsubscribe)).subscribe(params => {
      // Get params from route, shove into the tableTemplateUtils so that we get a new dataset to work with.
      this.tableData = this.tableTemplateUtils.updateTableObjectWithUrlParams(params, this.tableData);

      // Make api call with tableData params.

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
    // Generate new route keeping old params
    // tslint:disable-next-line: prefer-const
    let newParams = {};

    // save default set of params, tack on new ones.
    this.route.params.subscribe(params => {
      // Filter out the incoming params (remove them entirely)
      Object.keys(params).forEach(p => {
        if (Object.keys(event).includes(p)) {
          // We will be overriding this param later.
        } else {
          // Existing param we should save.
          newParams[p] = params[p];
        }
      });

      Object.keys(event).forEach(item => {
        if (!event || event[item] === undefined || event[item] === null || event[item].length === 0) {
          // console.log('skipping:', e);
        } else {
          newParams[item] = event[item];
        }
      });

      this.router.navigate(['/records', newParams]);
    });
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
    this.tableTemplateUtils.navigateUsingParams(this.tableData, ['records']);
  }

  checkChange() {}

  add(item) {
    switch (item) {
      case 'order':
        this.router.navigate(['records', 'orders', 'add']);
        break;
      case 'inspection':
        this.router.navigate(['records', 'inspections', 'add']);
        break;
      case 'certificate':
        this.router.navigate(['records', 'certificates', 'add']);
        break;
      case 'permit':
        this.router.navigate(['records', 'permits', 'add']);
        break;
      case 'agreement':
        this.router.navigate(['records', 'agreements', 'add']);
        break;
      case 'selfReport':
        this.router.navigate(['records', 'self-reports', 'add']);
        break;
      case 'restorativeJustice':
        this.router.navigate(['records', 'restorative-justices', 'add']);
        break;
      case 'ticket':
        this.router.navigate(['records', 'tickets', 'add']);
        break;
      case 'administrativePenalty':
        this.router.navigate(['records', 'administrative-penalties', 'add']);
        break;
      case 'administrativeSanction':
        this.router.navigate(['records', 'administrative-sanctions', 'add']);
        break;
      case 'warning':
        this.router.navigate(['records', 'warnings', 'add']);
        break;
      case 'constructionPlan':
        this.router.navigate(['records', 'construction-plans', 'add']);
        break;
      case 'managementPlan':
        this.router.navigate(['records', 'management-plans', 'add']);
        break;
      case 'courtConviction':
        this.router.navigate(['records', 'court-convictions', 'add']);
        break;
      default:
        break;
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
