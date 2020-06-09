import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { Mine } from '../../../../../common/src/app/models/bcmi/mine';
import { Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmComponent } from '../../confirm/confirm.component';
import { DialogService } from 'ng2-bootstrap-modal';
import { FactoryService } from '../../services/factory.service';

@Component({
  selector: 'app-mines-detail',
  templateUrl: './mines-detail.component.html',
  styleUrls: ['./mines-detail.component.scss']
})
export class MinesDetailComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  public record = null;

  constructor(public route: ActivatedRoute,
              public router: Router,
              private factoryService: FactoryService,
              public changeDetectionRef: ChangeDetectorRef,
              private dialogService: DialogService) {
  }

  ngOnInit() {
    this.route.data.pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: any) => {
      if (!res || !res.record) {
        alert("Uh-oh, couldn't load Mine");
        this.router.navigate(['mines']);
        return;
      }

      this.record = res.record[0] && res.record[0].data && new Mine(res.record[0].data);

      this.changeDetectionRef.detectChanges();
    });
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
            this.factoryService.deleteMineItem(this.record._id, 'mine');
            this.router.navigate(['mines']);
          } catch (e) {
            alert('Could not delete Mine Item');
          }
        }
      }
    );
  }

  navigateToEditPage() {
    this.router.navigate(['mines', this.record._id, 'edit']);
  }

  navigateBack() {
    this.router.navigate(['mines']);
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
