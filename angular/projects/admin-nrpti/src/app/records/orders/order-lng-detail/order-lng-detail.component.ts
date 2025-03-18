import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { takeUntil, catchError } from 'rxjs/operators';
import { OrderLNG } from '../../../../../../common/src/app/models/lng/order-lng';
import { Subject, of } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { RecordComponent } from '../../utils/record-component';
import { DatePipe } from '@angular/common';
import { FactoryService } from '../../../services/factory.service';
import { LoggerService } from 'nrpti-angular-components';
import { Constants } from '../../../utils/constants/misc';

@Component({
  standalone: false,
  selector: 'app-order-lng-detail',
  templateUrl: './order-lng-detail.component.html',
  styleUrls: ['./order-lng-detail.component.scss']
})
export class OrderLNGDetailComponent extends RecordComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<void> = new Subject<void>();

  public isPublished: boolean;

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    public factoryService: FactoryService,
    private logger: LoggerService,
    public changeDetectionRef: ChangeDetectorRef,
    public datePipe: DatePipe
  ) {
    super();
  }

  ngOnInit() {
    if (!this.data) {
      this.route.data.pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: any) => {
        if (!res || !res.records) {
          alert("Uh-oh, couldn't load Order");
          this.router.navigate(['/']);
          return;
        }

        const records = res.records[0] && res.records[0].data && res.records[0].data.searchResults;

        this.data = records && records[0] && new OrderLNG(records[0]);

        this.changeDetectionRef.detectChanges();
      });
    }

    this.isPublished = this.isRecordPublished();
  }

  canPublish(): boolean {
    const requiredRoles = Constants.FlavourEditRequiredRoles.ORDER.LNG;

    for (const role of requiredRoles) {
      if (this.factoryService.userInRole(role) && this.data.write && this.data.write.includes(role)) {
        return true;
      }
    }

    return false;
  }

  publish(): void {
    this.factoryService
      .publishRecord(this.data)
      .pipe(
        takeUntil(this.ngUnsubscribe),
        catchError(error => {
          this.logger.log(`Publish error: ${error}`);
          alert('Failed to publish record.');
          return of(null);
        })
      )
      .subscribe(response => {
        if (!response) {
          return;
        }

        if (response['code'] === 409) {
          // object was already published
          return;
        }

        this.data = new OrderLNG(response);
        this.isPublished = this.isRecordPublished();

        this.changeDetectionRef.detectChanges();
      });
  }

  unPublish(): void {
    this.factoryService
      .unPublishRecord(this.data)
      .pipe(
        takeUntil(this.ngUnsubscribe),
        catchError(error => {
          this.logger.log(`Unpublish error: ${error}`);
          alert('Failed to unpublish record.');
          return of(null);
        })
      )
      .subscribe(response => {
        if (!response) {
          return;
        }

        if (response['code'] === 409) {
          // object was already unpublished
          return;
        }

        this.data = new OrderLNG(response);
        this.isPublished = this.isRecordPublished();

        this.changeDetectionRef.detectChanges();
      });
  }

  isRecordPublished(): boolean {
    return this.data && this.data.read && this.data.read.includes('public');
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
