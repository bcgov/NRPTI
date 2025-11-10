import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import moment from 'moment';
import { LoadingScreenService, Utils, StoreService } from 'nrpti-angular-components';
import { takeUntil, catchError } from 'rxjs/operators';
import { Subject, of } from 'rxjs';
import { Picklists, StateIDs, StateStatus } from '../../../../../common/src/app/utils/record-constants';
import { ConfirmComponent } from '../../confirm/confirm.component';
import { FactoryService } from '../../services/factory.service';
import { RecordUtils } from '../../records/utils/record-utils';
import { Constants } from '../../utils/constants/misc';
import { AgencyDataService } from '../../../../../../projects/global/src/lib/utils/agency-data-service';

import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  standalone: false,
  selector: 'app-mines-collections-add-edit',
  templateUrl: './mines-collections-add-edit.component.html',
  styleUrls: ['./mines-collections-add-edit.component.scss']
})
export class MinesCollectionsAddEditComponent implements OnInit, OnDestroy {
  modalRef?: BsModalRef;

  private ngUnsubscribe: Subject<void> = new Subject<void>();
  // flags
  public loading = true;
  public isEditing = false;
  public showRecordForm = false;

  // form
  public myForm: FormGroup;

  // data
  public mine = null;
  public collection = null;
  public lastEditedSubText = null;
  public pendingRecords = [];

  // Pick lists
  public collectionTypes = Picklists.collectionTypePicklist;
  public collectionAgencies = Picklists.collectionAgencyCodePicklist;

  // collection add edit state
  public collectionState = null;

  // Datepicker is off by one, so add a one to the desired year.
  public minDateYear = Constants.DatepickerMinDate;

  public newRecord = {
    recordName: null,
    recordAgency: null,
    dateIssued: null,
    recordType: null,
    documents: null
  };

  private recordsToUnlink: any[] = [];

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    private location: Location,
    private factoryService: FactoryService,
    private recordUtils: RecordUtils,
    private loadingScreenService: LoadingScreenService,
    private utils: Utils,
    private modalService: BsModalService,
    private storeService: StoreService,
    private _changeDetectionRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadingScreenService.setLoadingState(true, 'main');

    this.setOrRemoveCollectionAddEditState();

    this.route.data.pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: any) => {
      this.isEditing = res.breadcrumb !== 'Add Collection';

      if (res && res.mine && res.mine[0] && res.mine[0].data) {
        this.mine = res.mine[0].data;
      }

      if (this.isEditing) {
        if (res && res.collection && res.collection[0] && res.collection[0].data) {
          this.collection = res.collection[0].data;

          this.sortRecords();

          this.populateTextFields();
        } else {
          alert('Error: could not load collection.');
          this.router.navigate(['mines']);
        }
      }
      this.buildForm();

      this.loading = false;
      this.loadingScreenService.setLoadingState(false, 'main');

      this._changeDetectionRef.detectChanges();
    });
  }

  /**
   * Sets the initial collectionAddEdit state, or removes it from the store if it is invalid.
   *
   * @memberof MinesCollectionsAddEditComponent
   */
  setOrRemoveCollectionAddEditState() {
    const tempCollectionAddEditState = this.storeService.getItem(StateIDs.collectionAddEdit);
    if (tempCollectionAddEditState) {
      if (tempCollectionAddEditState.status === StateStatus.invalid) {
        this.storeService.removeItem(StateIDs.collectionAddEdit);
      } else {
        this.collectionState = tempCollectionAddEditState;
      }
    }
  }

  /**
   * Sort the collection.collectionRecords array.
   *
   * Why? Mongo $lookup does not preserve order, so the looked-up records projected into the
   * this.collection.collectionRecords field must be sorted based on the original this.collection.records array which
   * is in proper order.
   *
   * @returns
   * @memberof MinesCollectionsAddEditComponent
   */
  sortRecords() {
    if (!this.collection || !this.collection.collectionRecords || !this.collection.collectionRecords.length) {
      return;
    }

    this.collection.collectionRecords.sort((a, b) => {
      return this.collection.records.indexOf(a._id) - this.collection.records.indexOf(b._id);
    });
  }

  /**
   * Derive static text strings.
   *
   * @memberof MinesCollectionsAddEditComponent
   */
  populateTextFields() {
    if (!this.collection) {
      return;
    }

    if (this.collection.dateUpdated) {
      this.lastEditedSubText = `Last Edited on ${moment(this.collection.dateUpdated).format('MMMM DD, YYYY')}`;
    } else if (this.collection.dateAdded) {
      this.lastEditedSubText = `Added on ${moment(this.collection.dateAdded).format('MMMM DD, YYYY')}`;
    }
  }

  /**
   * Build the add-edit form.
   *
   * If editing, pre-populate any existing values. If StoreService contains an item named 'collectionAddEdit', use any
   * values set in that piece of state to pre-populate the form fields, and then clear that item from the store.
   *
   * @private
   * @memberof MinesCollectionsAddEditComponent
   */
  private buildForm() {
    this.myForm = new FormGroup({
      collectionName: new FormControl(
        (this.collectionState && this.collectionState.collectionName) || (this.collection && this.collection.name) || ''
      ),
      collectionDate: new FormControl(
        (this.collectionState && this.collectionState.collectionDate) ||
          (this.collection &&
            this.collection.date &&
            this.utils.convertJSDateToNGBDate(new Date(this.collection.date))) ||
          '' ||
          null
      ),
      collectionType: new FormControl(
        (this.collectionState && this.collectionState.collectionType) || (this.collection && this.collection.type) || ''
      ),
      collectionAgency: new FormControl(
        (this.collectionState && this.collectionState.collectionAgency) ||
          (this.collection && this.collection.agency) ||
          ''
      ),
      collectionRecords: new FormArray(
        // If editing and have selected records then combine them with existing collection records.
        (this.collectionState && this.getRecordsFormGroups(this.getUniqueRecords())) ||
          (this.collection && this.getRecordsFormGroups(this.collection.collectionRecords)) ||
          []
      )
    });

    if (this.collectionState) {
      // State was saved from before, so mark everything dirty so as not to miss any previous user edits
      this.myForm.get('collectionName').markAsDirty();
      this.myForm.get('collectionDate').markAsDirty();
      this.myForm.get('collectionType').markAsDirty();
      this.myForm.get('collectionAgency').markAsDirty();
      this.myForm.get('collectionRecords').markAsDirty();

      // Remove used state
      this.storeService.removeItem(StateIDs.collectionAddEdit);
    }
  }

  /**
   * If records are arriving form the Records List screen then combine them
   * with existing collection records, but make sure they are unique.
   *
   * @returns {obejct[]} Unique records.
   */
  getUniqueRecords() {
    const records = (this.collection && this.collection.collectionRecords) || [];
    const stateRecords = (this.collectionState && this.collectionState.collectionRecords) || [];
    const collectionRecords = (this.collection && this.collection.collectionRecords) || [];

    for (const stateRecord of stateRecords) {
      if (!collectionRecords.find(collectionRecord => stateRecord._id === collectionRecord._id)) {
        records.push(stateRecord);
      }
    }

    return records;
  }

  /**
   * Builds an array of records FormGroups, each with its own set of FormControls.
   *
   * @param {*} recordsArray array of records to parse into an array of FormGroups
   * @returns {FormGroup[]} array of records FormGroup elements
   * @memberof MinesAddEditComponent
   */
  getRecordsFormGroups(recordsArray): FormGroup[] {
    if (!recordsArray || !recordsArray.length) {
      return [];
    }

    const records: FormGroup[] = [];

    recordsArray.forEach((record: any) => {
      records.push(
        new FormGroup({
          record: new FormControl(record || null)
        })
      );
    });

    return records;
  }

  /**
   * Parses an array of records FormGroups into objects expected by the API.
   *
   * @returns {string[]} array of record ids
   * @memberof MinesCollectionsAddEditComponent
   */
  parseRecordsFormGroups(): string[] {
    const recordsFormArray = this.myForm.get('collectionRecords');

    if (!recordsFormArray || !recordsFormArray.value || !recordsFormArray.value.length) {
      return [];
    }

    const recordIds: string[] = [];

    recordsFormArray.value.forEach(recordFormGroup => {
      recordIds.push(recordFormGroup.record._id);
    });

    return recordIds;
  }

  /**
   * Link has been dragged/dropped.  Update the array of controls to the new order.
   *
   * @param {CdkDragDrop<string[]>} event
   * @memberof MinesCollectionsAddEditComponent
   */
  dropRecord(event: CdkDragDrop<string[]>) {
    const formArray = this.myForm.get('collectionRecords').value;

    moveItemInArray(formArray, event.previousIndex, event.currentIndex);

    this.myForm.get('collectionRecords').patchValue(formArray);
    this.myForm.get('collectionRecords').markAsDirty();
  }

  /**
   * Add records to the collections array of associated records.
   *
   * @memberof MinesCollectionsAddEditComponent
   */
  onAddRecordsToCollection() {
    // Save the current state of the form using the store service.
    // This should always overwrite any existing collectionAddEdit state, and not append to it.
    this.storeService.setItem({
      collectionAddEdit: {
        // routing ids
        mineId: this.route.snapshot.paramMap.get('mineId'),
        collectionId: (this.collection && this.collection._id) || null,

        // form values
        collectionName: this.myForm.get('collectionName').value,
        collectionDate: this.myForm.get('collectionDate').value,
        collectionType: this.myForm.get('collectionType').value,
        collectionAgency: this.myForm.get('collectionAgency').value,
        collectionRecords: this.myForm.get('collectionRecords').value.map(recordFormGroup => recordFormGroup.record),
        originalCollectionRecords: this.myForm
          .get('collectionRecords')
          .value.map(recordFormGroup => recordFormGroup.record),
        status: StateStatus.created
      }
    });

    // Navigate to the record list page for this mine
    this.router.navigate(['mines', this.route.snapshot.paramMap.get('mineId'), 'records']);
  }

  /**
   * Remove a record from the collections array of associated records.
   *
   * @param {number} idx index of record to remove from collection
   * @memberof MinesCollectionsAddEditComponent
   */
  removeRecordFromCollection(idx: number) {
    const recordControl = (this.myForm.get('collectionRecords') as FormArray).at(idx);
    // This is a flag set by mines-record-add component
    // If it is set, this is not a record in the DB
    if (recordControl.value.record.savePending) {
      this.pendingRecords = this.pendingRecords.filter(obj => {
        return obj.recordName !== recordControl.value.record.recordName;
      });
    } else {
      this.recordsToUnlink.push(recordControl.value.record);
    }

    (this.myForm.get('collectionRecords') as FormArray).removeAt(idx);
    this.myForm.get('collectionRecords').markAsDirty();
  }

  isEnableRecordEdit(idx: number) {
    const recordControl = (this.myForm.get('collectionRecords') as FormArray).at(idx);
    const record = recordControl.value.record;

    if (record && record.sourceSystemRef === 'core') {
      return false;
    }

    return true;
  }

  /**
   * Navigate to record details page.
   *
   * @memberof MinesCollectionsAddEditComponent
   */
  goToRecordDetails(idx: number) {
    const recordControl = (this.myForm.get('collectionRecords') as FormArray).at(idx);
    const record = recordControl.value.record;
    window.open(`/mines/${this.mine._id}/records/${record._id}/detail`, '_blank');
  }

  /**
   * Navigate to record details page.
   *
   * @memberof MinesCollectionsAddEditComponent
   */
  goToRecordEdit(idx: number) {
    const recordControl = (this.myForm.get('collectionRecords') as FormArray).at(idx);
    const record = recordControl.value.record;
    window.open(`/mines/${this.mine._id}/records/${record._id}/edit`, '_blank');
  }

  /**
   * Submit form data to API.
   *
   * @memberof MinesCollectionsAddEditComponent
   */
  async submit() {
    // TODO: revisit this update
    const numRecords = this.myForm.get('collectionRecords').value.length;
    const message = numRecords
      ? `This will publish the current collection and ${numRecords} record(s), do you want to proceed?`
      : 'There are no records in this collection, it will not display on BCMI, do you want to proceed?';

    // Open the confirmation modal
    this.modalRef = this.modalService.show(ConfirmComponent, {
      class: 'modal-dialog-centered',
      initialState: {
        title: 'Confirm Publication',
        message,
        okOnly: false
      }
    });

    // Subscribe to modal close
    this.modalRef.content?.onClose
      .pipe(
        takeUntil(this.ngUnsubscribe),
        catchError(() => {
          alert('Failed to confirm publication.');
          return of(null);
        })
      )
      .subscribe(async (isConfirmed) => {
        if (!isConfirmed) return;

        this.loadingScreenService.setLoadingState(true, 'main');

        const collection: any = {};

        if (this.myForm.get('collectionName').dirty)
          collection['name'] = this.myForm.get('collectionName').value;

        if (this.myForm.get('collectionDate').dirty)
          collection['date'] = this.utils.convertFormGroupNGBDateToJSDate(
            this.myForm.get('collectionDate').value
          );

        if (this.myForm.get('collectionType').dirty)
          collection['type'] = this.myForm.get('collectionType').value;

        if (this.myForm.get('collectionAgency').dirty)
          collection['agency'] = this.myForm.get('collectionAgency').value;

        // Add records first
        if (this.myForm.get('collectionRecords').dirty) {
          for (const obj of this.pendingRecords) {
            delete obj.record.savePending;
            const res = await this.factoryService.createMineRecord(obj.record);
            this.recordUtils.parseResForErrors(res);

            // The API responds with master and BCMI flavour records that were created.
            const createdRecord = res && res[0] && res[0].length && res[0][0] && res[0][0].object;

            await this.recordUtils.handleDocumentChanges(
              obj.links,
              obj.documents,
              [],
              createdRecord[1]._id,
              this.factoryService
            );

            const updatedRecordList = this.myForm.get('collectionRecords').value.map((item) =>
              item.record.recordName === createdRecord[0].recordName
                ? { record: createdRecord[0] }
                : item
            );

            this.myForm.get('collectionRecords').patchValue(updatedRecordList);
          }

          collection['records'] = this.parseRecordsFormGroups();
        }

        try {
          if (this.isEditing) {
            collection['_id'] = this.collection._id;
            const res = await this.factoryService.editCollection(collection);

            if (!res || !res._id) {
              alert('Failed to update collection.');
            } else {
              this.router.navigate([
                'mines',
                this.collection.project,
                'collections',
                this.collection._id,
                'detail'
              ]);
            }
          } else {
            collection['project'] = this.route.snapshot.paramMap.get('mineId');
            const res = await this.factoryService.createCollection(collection);

            if (!res || !res._id) {
              alert('Failed to create collection.');
            } else {
              this.router.navigate([
                'mines',
                res.project,
                'collections',
                res._id,
                'detail'
              ]);
            }
          }
        } catch (e) {
          alert('An error occurred while saving the collection.');
        } finally {
          this.loadingScreenService.setLoadingState(false, 'main');
        }
      });
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
      class: 'modal-md',        // medium size modal
      ignoreBackdropClick: true // equivalent to disableClose
    });

    // Subscribe to the result emitted by the modal
    this.modalRef.content.onClose.subscribe(async (isConfirmed: boolean) => {
      if (!isConfirmed) return;

      try {
        await this.factoryService.deleteCollection(this.collection._id);
        // Navigate after deletion
        this.router.navigate(['mines', this.collection.project, 'collections']);
      } catch (e) {
        alert('Could not delete Collection.');
      }
    });
  }

  /**
   * Cancel editing.
   *
   * @memberof MinesCollectionsAddEditComponent
   */
  cancel() {
    const shouldCancel = confirm(
      'Leaving this page will discard unsaved changes. Are you sure you would like to continue?'
    );
    if (shouldCancel) {
      if (this.isEditing) {
        this.router.navigate(['mines', this.collection.project, 'collections', this.collection._id, 'detail']);
      } else {
        this.location.back();
      }
    }
  }

  updateRecordList(recordToAdd) {
    for (const item of this.myForm.get('collectionRecords').value) {
      if (recordToAdd.record.recordName === item.record.recordName) {
        alert('Record names must be unique.');
        return;
      }
    }

    this.pendingRecords.push(recordToAdd);

    // Need to indicate if the pending record is a document or a link.
    recordToAdd.record.isLink = recordToAdd.links.length > 0 ? true : false;

    const formArray = this.myForm.get('collectionRecords') as FormArray;
    formArray.push(
      new FormGroup({
        record: new FormControl(recordToAdd.record || null)
      })
    );

    this.myForm.get('collectionRecords').markAsDirty();
    this.showRecordForm = false;
  }

  convertAcronyms(acronym) {
    return Utils.convertAcronyms(acronym);
  }

  displayName(agency) {
    const agencyDataService = new AgencyDataService(this.factoryService);
    return agencyDataService.displayNameFull(agency);
  }

  ngOnDestroy(): void {
    // When the component is destroying, if collectionAddEdit state exists, but the user hadn't clicked the
    // 'addRecordsToCollection' button, then remove the collection state from the store.
    const collectionAddEditState = this.storeService.getItem(StateIDs.collectionAddEdit);
    if (collectionAddEditState && collectionAddEditState.status !== StateStatus.created) {
      this.storeService.removeItem(StateIDs.collectionAddEdit);
    }

    this.loadingScreenService.setLoadingState(false, 'main');

    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
