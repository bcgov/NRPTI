import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { takeUntil, catchError } from 'rxjs/operators';
import { CourtConvictionNRCED } from '../../../../../../common/src/app/models/nrced/court-conviction-nrced';
import { Subject, of } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { RecordComponent } from '../../utils/record-component';
import { DatePipe } from '@angular/common';
import { FactoryService } from '../../../services/factory.service';
import { ApplicationRoles } from '../../../../../../common/src/app/utils/record-constants';

@Component({
  selector: 'app-court-conviction-nrced-detail',
  templateUrl: './court-conviction-nrced-detail.component.html',
  styleUrls: ['./court-conviction-nrced-detail.component.scss']
})
export class CourtConvictionNRCEDDetailComponent extends RecordComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  public isPublished: boolean;

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    public factoryService: FactoryService,
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

        this.data = records && records[0] && new CourtConvictionNRCED(records[0]);

        this.changeDetectionRef.detectChanges();
      });
    }

    this.isPublished = this.isRecordPublished();
  }

  publish(): void {
    this.factoryService
      .publishRecord(this.data)
      .pipe(
        takeUntil(this.ngUnsubscribe),
        catchError(error => {
          console.log('Publish error:', error);
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

        this.data = new CourtConvictionNRCED(response);
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
          console.log('Unpublish error:', error);
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

        this.data = new CourtConvictionNRCED(response);
        this.isPublished = this.isRecordPublished();

        this.changeDetectionRef.detectChanges();
      });
  }

  isRecordPublished(): boolean {
    return this.data && this.data.read && this.data.read.includes('public');
  }

  userInNrcedRole() {
    return this.factoryService.userInRole(ApplicationRoles.ADMIN_NRCED);
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
