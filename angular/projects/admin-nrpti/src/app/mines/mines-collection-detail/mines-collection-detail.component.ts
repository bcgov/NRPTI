import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { Collection } from '../../../../../common/src/app/models/bcmi/collection';
import { Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { MinesCollectionRecordTableRowComponent } from './mines-collection-detail-record-row/mines-collection-detail-record-row.component';
import {
  IColumnObject,
  LoadingScreenService,
  TableObject
} from 'nrpti-angular-components';
import moment from 'moment';


@Component({
  selector: 'app-mines-collection-detail',
  templateUrl: './mines-collection-detail.component.html',
  styleUrls: ['./mines-collection-detail.component.scss']
})
export class MinesCollectionDetailComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  public collection = null;
  public isPublished = false;
  public lastEditedSubText = null;

  public tableData: TableObject = new TableObject({
    component: MinesCollectionRecordTableRowComponent,
    pageSize: 25,
    currentPage: 1,
    sortBy: '+name',
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
      nosort: true,
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
      nosort: true,
    },
    {
      name: 'Published State',
      value: '',
      width: 'col-2',
      nosort: true,
    },
  ];

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    private loadingScreenService: LoadingScreenService,
    public changeDetectionRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadingScreenService.setLoadingState(true, 'main');

    this.route.data.pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: any) => {
      if (!res || !res.collection) {
        this.router.navigate(['mines']);
        return;
      }

      this.collection = res.collection[0] && res.collection[0].data && new Collection(res.collection[0].data);

      this.isPublished = this.isRecordPublished();

      this.populateTextFields();

      this.tableData.items = this.collection.records.map(record => ({ rowData: record }));

      this.tableData.totalListItems = this.tableData.items.length;

      this.tableData.columns = this.tableColumns;

      this.loadingScreenService.setLoadingState(false, 'main');

      this.changeDetectionRef.detectChanges();
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
      this.lastEditedSubText = `Added on ${moment(this.collection.dateAdded).format('MMMM DD, YYYY')}`;
    }
  }

  isRecordPublished(): boolean {
    return this.collection && this.collection.read && this.collection.read.includes('public');
  }

  formatDate(date: Date): string {
    return moment(date).format('MMMM DD, YYYY');
  }

  navigateToEditPage() {
    this.router.navigate(['mines', this.collection._id, 'edit']);
  }

  navigateBack() {
    this.router.navigate(['mines']);
  }

  ngOnDestroy() {
    this.loadingScreenService.setLoadingState(false, 'main');

    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
