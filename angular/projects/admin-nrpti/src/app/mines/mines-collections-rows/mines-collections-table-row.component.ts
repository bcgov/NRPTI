import { ChangeDetectorRef, Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
// import { DialogService } from 'ng2-bootstrap-modal';
// import { MatDialog } from '@angular/material/dialog';
import { TableRowComponent, StoreService } from 'nrpti-angular-components';
import { ConfirmComponentNew } from '../../confirm/confirm.component';
import { FactoryService } from '../../services/factory.service';
import { StateIDs, StateStatus } from '../../../../../common/src/app/utils/record-constants';
// import { takeUntil, catchError } from 'rxjs/operators';
import { Subject } from 'rxjs';
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
    // private matDialog: MatDialog,
    // private dialogService: DialogService
  ) {
    super();
  }

  ngOnInit() {
    console.log("Deploy Test");
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
  deleteCollection_old() {
    // this.dialogService
    //   .addDialog(
    //     ConfirmComponent,
    //     { title: 'Confirm Deletion', message: 'Do you really want to delete this Collection?', okOnly: false },
    //     { backdropColor: 'rgba(0, 0, 0, 0.5)' }
    //   )
    //   .pipe(
    //     takeUntil(this.ngUnsubscribe),
    //     catchError(() => {
    //       alert('Failed to delete collection.');
    //       return of(null);
    //     })
    //   )
    //   .subscribe(async isConfirmed => {
    //     if (!isConfirmed) {
    //       return;
    //     }

    //     try {
    //       await this.factoryService.deleteCollection(this.rowData._id);

    //       // update tableData to remove deleted collection
    //       this.tableData.items = this.tableData.items.filter(item => item.rowData._id !== this.rowData._id);
    //     } catch (e) {
    //       alert('Could not delete Collection.');
    //     }
    //   });
  }

    /**
   * Delete the collection.
   *
   * @memberof MinesCollectionsTableRowComponent
   */
  deleteCollection_new() {
    // const dialogRef = this.matDialog.open(ConfirmComponentNew, {
    //   data: {
    //     title: 'Confirm Deletion',
    //     message: 'Do you really want to delete this Collection?',
    //     okOnly: false
    //   },
    //   disableClose: true,
    //   width: '500px',
    //   maxWidth: '800px'
    // });

    // dialogRef.afterClosed().subscribe(async (isConfirmed: boolean) => {
    //   if (!isConfirmed) return;

    //   try {
    //     await this.factoryService.deleteCollection(this.rowData._id);

    //     // update tableData to remove deleted collection
    //     this.tableData.items = this.tableData.items.filter(item => item.rowData._id !== this.rowData._id);
    //   } catch (e) {
    //     alert('Could not delete Collection.');
    //   }
    // });
  }

  deleteCollection() {
    // Open the modal
    this.modalRef = this.modalService.show(ConfirmComponentNew, {
      initialState: {
        title: 'Confirm Deletion',
        message: 'Do you really want to delete this Collection?',
        okOnly: false
      },
      class: 'modal-md',          // medium modal size
      ignoreBackdropClick: true   // equivalent to disableClose
    });

    // Subscribe to the result
    this.modalRef.content.onClose.subscribe(async (isConfirmed: boolean) => {
      if (!isConfirmed) return;

      try {
        await this.factoryService.deleteCollection(this.rowData._id);

        // update tableData to remove deleted collection
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
