import { ChangeDetectorRef, Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { DialogService } from 'ng2-bootstrap-modal';
import { TableRowComponent } from 'nrpti-angular-components';
import { ConfirmComponent } from '../../confirm/confirm.component';
import { FactoryService } from '../../services/factory.service';
import { takeUntil, catchError } from 'rxjs/operators';
import { Subject, of } from 'rxjs';

@Component({
  selector: 'tr[app-mines-collections-table-row]',
  templateUrl: './mines-collections-table-row.component.html',
  styleUrls: ['./mines-collections-table-row.component.scss']
})
export class MinesCollectionsTableRowComponent extends TableRowComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(
    private router: Router,
    public changeDetectionRef: ChangeDetectorRef,
    public factoryService: FactoryService,
    private dialogService: DialogService
  ) {
    super();
  }

  ngOnInit() {
    this.changeDetectionRef.detectChanges();
  }

  /**
   * Listen for clicks on the row.
   *
   * Note: Other click handlers will need to call `$event.stopPropagation()` to prevent their click events from
   * bubbling up to this listener.
   *
   * @memberof MinesCollectionsTableRowComponent
   */
  @HostListener('click') onItemClicked() {
    this.goToDetails();
  }

  /**
   * Navigate to collection details page.
   *
   * @memberof MinesCollectionsTableRowComponent
   */
  goToDetails() {
    // TODO update when collections detail page exists
    this.router.navigate(['collections', this.rowData._id, 'detail']);
  }

  /**
   * Navigate to collection edit page.
   *
   * @memberof MinesCollectionsTableRowComponent
   */
  goToEdit() {
    // TODO update when collections add-edit page exists
    this.router.navigate(['collections', this.rowData._id, 'edit']);
  }

  /**
   * Publish the collection, adding the `public` role to the read array.
   *
   * @memberof MinesCollectionsTableRowComponent
   */
  publishCollection(): void {
    this.factoryService
      .publishRecord(this.rowData)
      .pipe(
        takeUntil(this.ngUnsubscribe),
        catchError(() => {
          alert('Failed to publish collection.');
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

        this.rowData = response;

        this.changeDetectionRef.detectChanges();
      });
  }

  /**
   * Unpublish the collection, removing the `public` role from the read array.
   *
   * @memberof MinesCollectionsTableRowComponent
   */
  unpublishCollection(): void {
    this.factoryService
      .unPublishRecord(this.rowData)
      .pipe(
        takeUntil(this.ngUnsubscribe),
        catchError(() => {
          alert('Failed to unpublish collection.');
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

        this.rowData = response;

        this.changeDetectionRef.detectChanges();
      });
  }

  /**
   * Delete the collection.
   *
   * @memberof MinesCollectionsTableRowComponent
   */
  deleteCollection() {
    this.dialogService
      .addDialog(
        ConfirmComponent,
        { title: 'Confirm Deletion', message: 'Do you really want to delete this Collection?', okOnly: false },
        { backdropColor: 'rgba(0, 0, 0, 0.5)' }
      )
      .pipe(
        takeUntil(this.ngUnsubscribe),
        catchError(() => {
          alert('Failed to delete collection.');
          return of(null);
        })
      )
      .subscribe(async isConfirmed => {
        if (!isConfirmed) {
          return;
        }

        try {
          await this.factoryService.deleteCollection(this.rowData._id);

          // update tableData to remove deleted collection
          this.tableData.items = this.tableData.items.filter(item => item.rowData._id !== this.rowData._id);
        } catch (e) {
          alert('Could not delete Collection.');
        }
      });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
