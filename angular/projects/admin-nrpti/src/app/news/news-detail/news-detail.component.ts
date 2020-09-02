import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { News } from '../../../../../common/src/app/models/master/common-models/news';
import { Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmComponent } from '../../confirm/confirm.component';
import { DialogService } from 'ng2-bootstrap-modal';
import { FactoryService } from '../../services/factory.service';

@Component({
  selector: 'app-news-detail',
  templateUrl: './news-detail.component.html',
  styleUrls: ['./news-detail.component.scss']
})
export class NewsDetailComponent implements OnInit, OnDestroy {
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
        alert("Uh-oh, couldn't load News");
        this.router.navigate(['/']);
        return;
      }

      this.record = res.record[0] && res.record[0].data && new News(res.record[0].data);

      this.changeDetectionRef.detectChanges();
    });
  }

  delete() {
    this.dialogService.addDialog(ConfirmComponent,
      {
        title: 'Confirm Deletion',
        message: 'Do you really want to delete this News Item?',
        okOnly: false
      }, {
      backdropColor: 'rgba(0, 0, 0, 0.5)'
    })
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        isConfirmed => {
          if (isConfirmed) {
            try {
              this.factoryService.deleteNews(this.record._id);
              this.router.navigate(['news']);
            } catch (e) {
              alert('Could not delete News Item');
            }
          }
        }
      );
  }

  navigateToEditPage() {
    this.router.navigate(['news', this.record.system, this.record._id, 'edit']);
  }

  navigateBack() {
    this.router.navigate(['news']);
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
