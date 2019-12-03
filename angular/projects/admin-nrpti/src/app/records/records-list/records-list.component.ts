import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
// import { Record } from '../../models/record';
import { ExportService } from 'nrpti-angular-components';
import { FactoryService } from '../../services/factory.service';
import { takeUntil } from 'rxjs/operators';
import { TableTemplateUtils, TableObject } from 'nrpti-angular-components';
import { RecordsTableRowsComponent } from '../records-rows/records-table-rows.component';

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
  public loading = true;
  // public entries: User[] = null;
  // public terms = new SearchTerms();
  public typeFilters = [];
  public selectedCount = 0;
  public navigationObject;

  public tableData: TableObject = new TableObject({ component: RecordsTableRowsComponent });
  public tableColumns: any[] = [
    {
      value: 'checkbox',
      width: 'col-1',
      nosort: true
    },
    {
      name: 'Name',
      value: 'name',
      width: 'col-6'
    },
    {
      name: 'Prop',
      value: 'prop',
      width: 'col-5'
    }
  ];

  constructor(
    public location: Location,
    public router: Router,
    public route: ActivatedRoute,
    private tableTemplateUtils: TableTemplateUtils,
    private _changeDetectionRef: ChangeDetectorRef,
    public factoryService: FactoryService,
    public exportService: ExportService
  ) {}

  /**
   * Component init.
   *
   * @memberof RecordsListComponent
   */
  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.ngUnsubscribe)).subscribe(params => {
      // Get params from route, shove into the tableTemplateUtils so that we get a new dataset to work with.
      this.tableData = this.tableTemplateUtils.updateTableObjectWithUrlParams(params, this.tableData);

      // Make api call with tableData params.

      this._changeDetectionRef.detectChanges();
    });

    this.route.data.pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: any) => {
      if (res) {
        console.log('RES', res);
        // this.tableData.items = res.records[0].data.searchResults;

        // MOCK
        this.tableData.items = [{ name: 'foo', prop: 'yay' }];
        this.tableData.totalListItems = 1; // CHANGEME

        this.tableData.columns = this.tableColumns;
        this.loading = false;
        this._changeDetectionRef.detectChanges();
      } else {
        alert("Uh-oh, couldn't load valued components");
        // project not found --> navigate back to search
        this.router.navigate(['/search']);
      }
    });
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
