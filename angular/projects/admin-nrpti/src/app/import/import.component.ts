import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { FactoryService } from '../services/factory.service';
import { Subject } from 'rxjs';
import { TableObject, TableTemplateUtils, ExportService } from 'nrpti-angular-components';
import { ImportTableRowsComponent } from '../import/import-rows/import-table-rows.component';
import { takeUntil } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-import',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.scss']
})
export class ImportComponent implements OnInit {
  public dateStart: object = {};
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  public loading = true;
  public showAlert = false;
  public typeFilters = [];
  public navigationObject;
  public tableData: TableObject = new TableObject({ component: ImportTableRowsComponent });
  public tableColumns: any[] = [
    {
      name: 'Start',
      value: 'startDate',
      width: 'col-2'
    },
    {
      name: 'Finish',
      value: 'finishDate',
      width: 'col-2'
    },
    {
      name: 'Status',
      value: 'status',
      width: 'col-1'
    },
    {
      name: 'Source',
      value: 'dataSourceLabel',
      width: 'col-1'
    },
    {
      name: 'Items',
      value: 'itemTotal',
      width: 'col-5'
    },
    {
      name: 'URL',
      value: 'dataSource',
      width: 'col-1'
    }
  ];
  constructor(
    public router: Router,
    public route: ActivatedRoute,
    private tableTemplateUtils: TableTemplateUtils,
    private _changeDetectionRef: ChangeDetectorRef,
    public factoryService: FactoryService,
    public exportService: ExportService
  ) {}

  ngOnInit() {
    this.route.params.pipe(takeUntil(this.ngUnsubscribe)).subscribe(params => {
      // Get params from route, shove into the tableTemplateUtils so that we get a new dataset to work with.
      this.tableData = this.tableTemplateUtils.updateTableObjectWithUrlParams(params, this.tableData);

      // Make api call with tableData params.

      this._changeDetectionRef.detectChanges();
    });

    this.route.data.pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: any) => {
      if (res) {
        this.tableData.items = res.records[0].data.searchResults;

        if (res.records[0].data.meta.length > 0) {
          this.tableData.totalListItems = res.records[0].data.meta[0].searchResultsTotal;
        }

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

  setColumnSort(column) {
    console.log('setColumnSort', column);
    if (this.tableData.sortBy.charAt(0) === '+') {
      this.tableData.sortBy = '-' + column;
    } else {
      this.tableData.sortBy = '+' + column;
    }
    this.onSubmit(this.tableData.currentPage);
  }

  onSubmit(pageNumber) {
    console.log('onSubmit', pageNumber);
    this.tableData.currentPage = pageNumber;
    this.tableTemplateUtils.navigateUsingParams(this.tableData, ['import']);
  }

  startJob() {
    console.log('start job');
    // tslint:disable-next-line: no-this-assignment
    const self = this;
    this.postToApi().subscribe(job => {
      self.showAlert = true;
      setTimeout(() => {
        self.showAlert = false;
      }, 5000);
    });
  }

  postToApi(): Observable<any> {
    return this.factoryService.startTask({ dataSource: 'epic' });
  }
}
