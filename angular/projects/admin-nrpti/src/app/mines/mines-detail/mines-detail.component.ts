import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { takeUntil, catchError } from 'rxjs/operators';
import { Mine } from '../../../../../common/src/app/models/bcmi/mine';
import { Subject, of } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { FactoryService } from '../../services/factory.service';

@Component({
  selector: 'app-mines-detail',
  templateUrl: './mines-detail.component.html',
  styleUrls: ['./mines-detail.component.scss']
})
export class MinesDetailComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  public mine = null;
  public canPublish = false;
  public isPublished = false;

  constructor(public route: ActivatedRoute,
              public router: Router,
              private factoryService: FactoryService,
              public changeDetectionRef: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.route.data.pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: any) => {
      if (!res || !res.mine) {
        alert("Uh-oh, couldn't load Mine");
        this.router.navigate(['mines']);
        return;
      }

      this.mine = res.mine[0] && res.mine[0].data && new Mine(res.mine[0].data);

      this.isPublished = this.isRecordPublished();
      this.canPublish = this.checkCanPublish();

      this.changeDetectionRef.detectChanges();
    });
  }

  isRecordPublished(): boolean {
    return this.mine && this.mine.read && this.mine.read.includes('public');
  }

  checkCanPublish(): boolean {
    return (this.mine.name
      && this.mine.status
      && this.mine.permitNumbers
      && this.mine.permitNumbers.length > 0
      && this.mine.tailingsImpoundments
      && this.mine.commodities
      && this.mine.commodities.length > 0
      && this.mine.location
      && this.mine.location.coordinates
      && this.mine.location.coordinates.length > 0);
  }

  publish(): void {
    this.factoryService
      .publishRecord(this.mine)
      .pipe(
        takeUntil(this.ngUnsubscribe),
        catchError(error => {
          alert('Failed to publish mine.');
          return of(null);
        })
      )
      .subscribe(response => {
        if (!response) {
          return;
        }

        if (response.code === 409) {
          // object was already published
          alert('Mine is already published.');
          return;
        }

        this.mine = new Mine(response);
        this.isPublished = this.isRecordPublished();

        this.changeDetectionRef.detectChanges();
      });
  }

  unPublish(): void {
    this.factoryService
      .unPublishRecord(this.mine)
      .pipe(
        takeUntil(this.ngUnsubscribe),
        catchError(error => {
          alert('Failed to unpublish mine.');
          return of(null);
        })
      )
      .subscribe(response => {
        if (!response) {
          return;
        }

        if (response.code === 409) {
          // object was already unpublished
          alert('Mine is already unpublished.');
          return;
        }

        this.mine = new Mine(response);
        this.isPublished = this.isRecordPublished();

        this.changeDetectionRef.detectChanges();
      });
  }

  togglePublish(): void {
    this.canPublish = this.checkCanPublish();
    if (this.canPublish) {
      this.isPublished ? this.unPublish() : this.publish();
    }
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
