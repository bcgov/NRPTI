import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { takeUntil, catchError } from 'rxjs/operators';
import { TicketLNG } from '../../../../../../common/src/app/models/lng/ticket-lng';
import { Subject, of } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { RecordComponent } from '../../utils/record-component';
import { DatePipe } from '@angular/common';
import { FactoryService } from '../../../services/factory.service';
import { LoggerService } from 'nrpti-angular-components';
import { Constants } from '../../../utils/constants/misc';

@Component({
  selector: 'app-ticket-lng-detail',
  templateUrl: './ticket-lng-detail.component.html',
  styleUrls: ['./ticket-lng-detail.component.scss']
})
export class TicketLNGDetailComponent extends RecordComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

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

        this.data = records && records[0] && new TicketLNG(records[0]);

        this.changeDetectionRef.detectChanges();
      });
    }

    this.isPublished = this.isRecordPublished();
  }

  canPublish(): boolean {
    const requiredRoles = Constants.FlavourEditRequiredRoles.TICKET.LNG;

    for (const role of requiredRoles) {
      if (this.factoryService.userInRole(role) && this.data.write && this.data.write.includes(role)) { return true; }
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

        if (response.code === 409) {
          // object was already published
          return;
        }

        this.data = new TicketLNG(response);
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

        if (response.code === 409) {
          // object was already unpublished
          return;
        }

        this.data = new TicketLNG(response);
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
