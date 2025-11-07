import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { takeUntil } from 'rxjs/operators';
import { News } from '../../../../../common/src/app/models/master/common-models/news';
import { Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmComponentNew } from '../../confirm/confirm.component';
import { FactoryService } from '../../services/factory.service';

@Component({
  standalone: false,
  selector: 'app-news-detail',
  templateUrl: './news-detail.component.html',
  styleUrls: ['./news-detail.component.scss']
})
export class NewsDetailComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<void> = new Subject<void>();

  public record = null;

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    private factoryService: FactoryService,
    public changeDetectionRef: ChangeDetectorRef,
    private modalService: BsModalService
  ) {}

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
    // Open the modal
    const modalRef: BsModalRef = this.modalService.show(ConfirmComponentNew, {
      initialState: {
        title: 'Confirm Deletion',
        message: 'Do you really want to delete this News Item?',
        okOnly: false
      },
      class: 'modal-md',
      ignoreBackdropClick: true
    });

    // Subscribe to the result
    modalRef.content.onClose.subscribe(async (isConfirmed: boolean) => {
      if (!isConfirmed) return;

      try {
        await this.factoryService.deleteNews(this.record._id);
        this.router.navigate(['news']);
      } catch (e) {
        alert('Could not delete News Item');
      }
    });
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
