import { Component, HostListener, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { takeUntil, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Subject, of } from 'rxjs';

import { TableRowComponent } from 'nrpti-angular-components';
import { FactoryService } from '../../../services/factory.service';
import { LoggerService } from 'nrpti-angular-components';

@Component({
  selector: 'tr[app-enforcement-actions-table-row]',
  templateUrl: './enforcement-actions-table-row.component.html',
  styleUrls: ['./enforcement-actions-table-row.component.scss']
})
export class EnforcementActionsTableRowComponent extends TableRowComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  public bcmiFlavour: any;
  public isPublished = false;

  constructor(
    private router: Router,
    public factoryService: FactoryService,
    private logger: LoggerService,
    public changeDetectionRef: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit() {
    this.bcmiFlavour = this.rowData.flavours.find(flavour => flavour._schemaName.endsWith('BCMI'));
    this.isPublished = this.isRecordPublished();
    this.changeDetectionRef.detectChanges();
  }

  public getAttributeValue(attribute) {
    return this.rowData[attribute] || '-';
  }

  private getSchemaRoute(schemaName) {
    switch (schemaName) {
      case 'AdministrativePenalty':
        return 'administrative-penalties';
      case 'CourtConviction':
        return 'court-convictions';
    }
  }
  goToDetails() {
    this.router.navigate([
      'mines',
      'enforcement-actions',
      this.getSchemaRoute(this.rowData._schemaName),
      this.rowData._id
    ]);
  }

  goToEdit() {
    this.router.navigate([
      'mines',
      'enforcement-actions',
      this.getSchemaRoute(this.rowData._schemaName),
      this.rowData._id,
      'edit'
    ]);
  }

  publish() {
    if (!this.bcmiFlavour) {
      alert('Failed to unpublish record. No BCMI record found.');
      return;
    }

    this.factoryService
      .publishRecord(this.bcmiFlavour)
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

        this.isPublished = true;
        this.changeDetectionRef.detectChanges();
      });
  }

  unPublish() {
    if (!this.bcmiFlavour) {
      alert('Failed to unpublish record. No BCMI record found.');
      return;
    }

    this.factoryService
      .unPublishRecord(this.bcmiFlavour)
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

        this.isPublished = false;
        this.changeDetectionRef.detectChanges();
      });
  }

  isRecordPublished(): boolean {
    return this.rowData && this.rowData.read && this.rowData.isBcmiPublished;
  }

  @HostListener('click') onItemClicked() {
    this.goToDetails();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
