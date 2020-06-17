import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { Mine } from '../../../../../common/src/app/models/bcmi/mine';
import { Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmComponent } from '../../confirm/confirm.component';
import { DialogService } from 'ng2-bootstrap-modal';
import { FactoryService } from '../../services/factory.service';
import {
  TableTemplateUtils,
  TableObject,
  IColumnObject,
} from 'nrpti-angular-components';

import { MinesTableRowComponent } from '../mines-rows/mines-table-row.component';


@Component({
  selector: 'app-mines-detail',
  templateUrl: './mines-detail.component.html',
  styleUrls: ['./mines-detail.component.scss']
})
export class MinesDetailComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  public mine = null;
  public isPublished = false;

  public tableData: TableObject = new TableObject({
    component: MinesTableRowComponent,
    pageSize: 5,
    currentPage: 1,
    sortBy: '-dateAdded'
  });

  public tableColumns: IColumnObject[] = [
    {
      name: 'File Name',
      value: 'recordName',
      width: 'col-6'
    },
    {
      name: 'Date',
      value: 'dateIssued',
      width: 'col-3'
    },
    {
      name: 'Action',
      value: '',
      width: 'col-3',
      nosort: true
    },
  ];


  constructor(public route: ActivatedRoute,
              public router: Router,
              private factoryService: FactoryService,
              public changeDetectionRef: ChangeDetectorRef,
              private tableTemplateUtils: TableTemplateUtils,
              private dialogService: DialogService) {
  }

  ngOnInit() {
    this.route.data.pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: any) => {
      if (!res || !res.record) {
        alert("Uh-oh, couldn't load Mine");
        this.router.navigate(['mines']);
        return;
      }

      // this.tableData = this.tableTemplateUtils.updateTableObjectWithUrlParams(data, this.tableData);

      this.mine = res.record[0] && res.record[0].data && new Mine(res.record[0].data);

      this.changeDetectionRef.detectChanges();
    });
  }

  alert() {
    console.log('hello');
  }

  delete() {
    this.dialogService.addDialog(ConfirmComponent,
    {
      title: 'Confirm Deletion',
      message: 'Do you really want to delete this Mine Item?',
      okOnly: false
    }, {
      backdropColor: 'rgba(0, 0, 0, 0.5)'
    })
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe(
      isConfirmed => {
        if (isConfirmed) {
          try {
            this.factoryService.deleteMineItem(this.mine._id, 'mine');
            this.router.navigate(['mines']);
          } catch (e) {
            alert('Could not delete Mine Item');
          }
        }
      }
    );
  }

  navigateToEditPage() {
    this.router.navigate(['mines', this.mine._id, 'edit']);
  }

  navigateBack() {
    this.router.navigate(['mines']);
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
