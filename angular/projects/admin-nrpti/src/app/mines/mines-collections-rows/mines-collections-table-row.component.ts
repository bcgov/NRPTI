import { ChangeDetectorRef, Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TableRowComponent, StoreService } from 'nrpti-angular-components';
import { ConfirmComponent } from '../../confirm/confirm.component';
import { FactoryService } from '../../services/factory.service';
import { StateIDs, StateStatus } from '../../../../../common/src/app/utils/record-constants';
import { Subject, of } from 'rxjs';
import { takeUntil, catchError } from 'rxjs/operators';
import { AgencyDataService } from '../../../../../global/src/lib/utils/agency-data-service';

import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';



@Component({
  standalone: false,
  selector: 'tr[app-mines-collections-table-row]',
  templateUrl: './mines-collections-table-row.component.html',
  styleUrls: ['./mines-collections-table-row.component.scss']
})
export class MinesCollectionsTableRowComponent extends TableRowComponent implements OnInit, OnDestroy {
  modalRef?: BsModalRef;

  public isEditingCollection: boolean;
  private ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private storeService: StoreService,
    public changeDetectionRef: ChangeDetectorRef,
    public factoryService: FactoryService,
    private modalService: BsModalService
  ) {
    super();
  }

  ngOnInit() {
    this.setOrRemoveCollectionAddEditState();

    this.changeDetectionRef.detectChanges();
  }

  displayName(agency) {
    const agencyDataService = new AgencyDataService(this.factoryService);
    return agencyDataService.displayNameFull(agency);
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
    if (this.isEditingCollection) {
      this.goToEdit();
    } else {
      this.goToDetails();
    }
  }

  /**
   * Navigate to collection details page.
   *
   * @memberof MinesCollectionsTableRowComponent
   */
  goToDetails() {
    this.router.navigate([this.rowData._id, 'detail'], { relativeTo: this.route });
  }

  /**
   * Navigate to collection edit page.
   *
   * @memberof MinesCollectionsTableRowComponent
   */
  goToEdit() {
    this.router.navigate([this.rowData._id, 'edit'], { relativeTo: this.route });
  }

/**
 * Delete the collection.
 *
 * @memberof MinesCollectionsTableRowComponent
 */
deleteCollection() {
  // Open the modal
  this.modalRef = this.modalService.show(ConfirmComponent, {
    initialState: {
      title: 'Confirm Deletion',
      message: 'Do you really want to delete this Collection?',
      okOnly: false
    },
    class: 'modal-md',
    ignoreBackdropClick: true
  });

  // Subscribe to the modal's onClose observable with RxJS operators
  this.modalRef.content.onClose
    ?.pipe(
      takeUntil(this.ngUnsubscribe), // automatically unsubscribe when component is destroyed
      catchError(err => {
        alert('Failed to delete collection.');
        return of(null); // fallback value so the subscriber still executes
      })
    )
    .subscribe(async (isConfirmed: boolean) => {
      if (!isConfirmed) {
        return;
      }

      try {
        await this.factoryService.deleteCollection(this.rowData._id);

        // Remove the deleted collection from the table
        this.tableData.items = this.tableData.items.filter(
          item => item.rowData._id !== this.rowData._id
        );
      } catch (e) {
        alert('Could not delete Collection.');
      }
    });
}


  /**
   * Sets the initial collectionState state, or removes it from the store if it is invalid.
   *
   * @memberof MinesRecordsListComponent
   */
  setOrRemoveCollectionAddEditState() {
    const tempCollectionAddEditState = this.storeService.getItem(StateIDs.collectionAddEdit);
    if (tempCollectionAddEditState) {
      if (tempCollectionAddEditState.status === StateStatus.invalid) {
        this.storeService.removeItem(StateIDs.collectionAddEdit);
        this.isEditingCollection = false;
      } else {
        this.isEditingCollection = true;
      }
    }
  }

  ngOnDestroy() {
    const collectionAddEditState = this.storeService.getItem(StateIDs.collectionAddEdit);
    if (collectionAddEditState && collectionAddEditState.status !== StateStatus.valid) {
      this.storeService.removeItem(StateIDs.collectionAddEdit);
    }

    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
