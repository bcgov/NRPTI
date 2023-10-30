import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { MinesCollectionRecordTableRowComponent } from './mines-collection-detail-record-row/mines-collection-detail-record-row.component';
import { IColumnObject, LoadingScreenService, TableObject } from 'nrpti-angular-components';
import moment from 'moment';
import { FactoryService } from '../../services/factory.service';
import { AgencyDataService } from '../../../../../global/src/lib/utils/agency-data-service';

@Component({
  selector: 'app-mines-collection-detail',
  templateUrl: './mines-collection-detail.component.html',
  styleUrls: ['./mines-collection-detail.component.scss']
})
export class MinesCollectionDetailComponent implements OnInit, OnDestroy {
  agencyDataService: AgencyDataService;
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  public collection = null;
  public lastEditedSubText = null;

  public tableData: TableObject = new TableObject({
    component: MinesCollectionRecordTableRowComponent,
    pageSize: 25,
    currentPage: 1,
    sortBy: '',
    options: {
      showPageSizePicker: false,
      showPagination: false,
      showHeader: true,
      showPageCountDisplay: false
    }
  });

  public tableColumns: IColumnObject[] = [
    {
      name: 'Name',
      value: '',
      width: 'col-6',
      nosort: true
    },
    {
      name: 'Source System',
      value: '',
      width: 'col-2',
      nosort: true
    },
    {
      name: 'Date',
      value: '',
      width: 'col-2',
      nosort: true
    },
    {
      name: 'Published State',
      value: '',
      width: 'col-2',
      nosort: true
    }
  ];

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    private loadingScreenService: LoadingScreenService,
    public changeDetectionRef: ChangeDetectorRef,
    private factoryService: FactoryService
  ) {}

  ngOnInit() {
    this.agencyDataService = new AgencyDataService(this.factoryService);
    this.loadingScreenService.setLoadingState(true, 'main');
    this.route.data.pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: any) => {
      if (!res || !res.collection) {
        this.router.navigate(['mines']);
        return;
      }

      this.collection = res.collection[0] && res.collection[0].data;

      this.populateTextFields();

      this.sortRecords();
      this.tableData.items = this.collection.collectionRecords.map(record => ({ rowData: record }));

      this.tableData.totalListItems = this.tableData.items.length;

      this.tableData.columns = this.tableColumns;

      this.loadingScreenService.setLoadingState(false, 'main');

      this.changeDetectionRef.detectChanges();
    });
  }

  /**
   * Sort the collection.collectionRecords array.
   *
   * Why? Mongo $lookup does not preserve order, so the looked-up records projected into the
   * this.collection.collectionRecords field must be sorted based on the original this.collection.records array which
   * is in proper order.
   *
   * @memberof MinesAddEditComponent
   */
  sortRecords() {
    if (!this.collection || !this.collection.collectionRecords || !this.collection.collectionRecords.length) {
      return;
    }

    this.collection.collectionRecords.sort((a, b) => {
      return this.collection.records.indexOf(a._id) - this.collection.records.indexOf(b._id);
    });
  }

  /**
   * Derive static text strings.
   *
   * @memberof MinesAddEditComponent
   */
  populateTextFields() {
    if (this.collection && this.collection.dateUpdated) {
      this.lastEditedSubText = `Last Edited on ${moment(this.collection.dateUpdated).format('MMMM DD, YYYY')}`;
    } else {
      this.lastEditedSubText = `Published on ${moment(this.collection.dateAdded).format('MMMM DD, YYYY')}`;
    }
  }

  formatDate(date: Date): string {
    return moment(date).format('MMMM DD, YYYY');
  }

  navigateToEditPage() {
    this.router.navigate(['../edit'], { relativeTo: this.route });
  }

  ngOnDestroy() {
    this.loadingScreenService.setLoadingState(false, 'main');

    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
