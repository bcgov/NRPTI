import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import moment from 'moment';
import { DialogService } from 'ng2-bootstrap-modal';
import { LoadingScreenService, Utils, StoreService } from 'nrpti-angular-components';
import { of } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import { Picklists, StateIDs, StateStatus } from '../../../../../common/src/app/utils/record-constants';
import { ConfirmComponent } from '../../confirm/confirm.component';
import { RecordUtils } from '../../records/utils/record-utils';
import { FactoryService } from '../../services/factory.service';

@Component({
  selector: 'app-mines-collections-add-edit',
  templateUrl: './mines-collections-add-edit.component.html',
  styleUrls: ['./mines-collections-add-edit.component.scss']
})
export class MinesCollectionsAddEditComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  // flags
  public loading = true;
  public isEditing = false;
  public isPublished = false;
  public showRecordForm = false;

  // form
  public myForm: FormGroup;

  // data
  public mine = null;
  public collection = null;
  public lastEditedSubText = null;

  // Pick lists
  public collectionTypes = Picklists.collectionTypePicklist;
  public collectionAgencies = Picklists.collectionAgencyPicklist;

  // collection add edit state
  public collectionState = null;

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
    private recordUtils: RecordUtils,
    private factoryService: FactoryService,
    private loadingScreenService: LoadingScreenService,
    private utils: Utils,
    private dialogService: DialogService,
    private storeService: StoreService,
    private _changeDetectionRef: ChangeDetectorRef
  ) { }

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
        (this.collectionState &&
          this.collectionState.collectionDate &&
          this.utils.convertJSDateToNGBDate(new Date(this.collectionState.collectionDate.date))) ||
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
      collectionPublish: new FormControl(
        (this.collectionState && this.collectionState.collectionPublish) ||
        (this.collection && this.collection.read.includes('public')) ||
        false
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
      this.myForm.get('collectionPublish').markAsDirty();
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
    const records = this.collection && this.collection.collectionRecords || [];
    const stateRecords = this.collectionState && this.collectionState.collectionRecords || [];
    const collectionRecords = this.collection && this.collection.collectionRecords || [];

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

  updateRecordsCollectionId(collectionId) {
    const recordsFormArray = this.myForm.get('collectionRecords');

    if (!recordsFormArray || !recordsFormArray.value || !recordsFormArray.value.length || !this.myForm.get('collectionRecords').dirty) {
      return;
    }

    recordsFormArray.value.forEach(recordFormGroup => {
      recordFormGroup.record.collectionId = collectionId;
      this.factoryService.editMineRecord(recordFormGroup.record).subscribe(async res => {
        this.recordUtils.parseResForErrors(res);
      });
    });

    if (this.recordsToUnlink.length > 0) {
      for (const recordToUnlink of this.recordsToUnlink) {
        recordToUnlink.collectionId = null;
        this.factoryService.editMineRecord(recordToUnlink).subscribe(async res => {
          this.recordUtils.parseResForErrors(res);
        });
      }
    }
  }

  /**
   * Toggle the publish formcontrol.
   *
   * @param {*} event
   * @memberof MinesCollectionsAddEditComponent
   */
  togglePublish(event) {
    this.myForm.get('collectionPublish').setValue(event.checked);
    this._changeDetectionRef.detectChanges();
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
        collectionPublish: this.myForm.get('collectionPublish').value,
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
    this.recordsToUnlink.push(recordControl.value.record);

    (this.myForm.get('collectionRecords') as FormArray).removeAt(idx);
    this.myForm.get('collectionRecords').markAsDirty();
  }

  /**
   * Submit form data to API.
   *
   * @memberof MinesCollectionsAddEditComponent
   */
  async submit() {
    this.loadingScreenService.setLoadingState(true, 'main');

    const collection = {};

    this.myForm.get('collectionName').dirty && (collection['name'] = this.myForm.get('collectionName').value);
    this.myForm.get('collectionDate').dirty &&
      (collection['date'] = this.utils.convertFormGroupNGBDateToJSDate(this.myForm.get('collectionDate').value));
    this.myForm.get('collectionType').dirty && (collection['type'] = this.myForm.get('collectionType').value);
    this.myForm.get('collectionAgency').dirty && (collection['agency'] = this.myForm.get('collectionAgency').value);

    this.myForm.get('collectionRecords').dirty && (collection['records'] = this.parseRecordsFormGroups());

    if (this.myForm.get('collectionPublish').dirty) {
      if (this.myForm.get('collectionPublish').value) {
        collection['addRole'] = 'public';
        collection['isBcmiPublished'] = true;
      } else {
        collection['removeRole'] = 'public';
        collection['isBcmiPublished'] = false;
      }
    }

    if (this.isEditing) {
      collection['_id'] = this.collection._id;

      this.factoryService.editCollection(collection).subscribe(async res => {
        this.recordUtils.parseResForErrors(res);

        // update the records collectionId
        this.updateRecordsCollectionId(this.collection._id);

        this.loadingScreenService.setLoadingState(false, 'main');
        this.router.navigate(['mines', this.collection._master, 'collections', this.collection._id, 'detail']);
      });
    } else {
      collection['_master'] = this.route.snapshot.paramMap.get('mineId');
      collection['project'] = this.route.snapshot.paramMap.get('mineId');

      this.factoryService.createCollection(collection).subscribe(async (res: any) => {
        this.recordUtils.parseResForErrors(res);

        const createdCollection = res && res.length && res[0] && res[0].length && res[0][0] && res[0][0].object;

        this.loadingScreenService.setLoadingState(false, 'main');
        if (createdCollection) {
          // update the records collectionId
          this.updateRecordsCollectionId(createdCollection._id);

          this.router.navigate(['mines', createdCollection._master, 'collections', createdCollection._id, 'detail']);
        } else {
          this.router.navigate(['../'], { relativeTo: this.route });
        }
      });
    }
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
          await this.factoryService.deleteCollection(this.collection._id);

          this.router.navigate(['mines', this.collection._master, 'collections']);
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
        this.router.navigate(['mines', this.collection._master, 'collections', this.collection._id, 'detail']);
      } else {
        this.location.back();
      }
    }
  }

  updateRecordList(recordToAdd) {
    const formArray = this.myForm.get('collectionRecords') as FormArray;
    formArray.push(new FormGroup({
      record: new FormControl(recordToAdd || null)
    }));

    this.myForm.get('collectionRecords').markAsDirty();
    this.showRecordForm = false;
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
