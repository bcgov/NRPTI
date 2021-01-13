import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Subject, of } from 'rxjs';
import { FormGroup, FormControl } from '@angular/forms';
import { Picklists, StateStatus, StateIDs } from '../../../../../common/src/app/utils/record-constants';
import { ActivatedRoute, Router } from '@angular/router';
import { RecordUtils } from '../../records/utils/record-utils';
import { FactoryService } from '../../services/factory.service';
import { LoadingScreenService, Utils, StoreService } from 'nrpti-angular-components';
import { DialogService } from 'ng2-bootstrap-modal';
import moment from 'moment';
import { ConfirmComponent } from '../../confirm/confirm.component';
import { takeUntil, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-mines-records-edit',
  templateUrl: './mines-records-edit.component.html',
  styleUrls: ['./mines-records-edit.component.scss']
})
export class MinesRecordsEditComponent implements OnInit {

  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  // flags
  public loading = true;
  public isPublished = false;
  public canPublish = false;

  // form
  public myForm: FormGroup;

  // data
  public record = null;
  public bcmiFlavour = null;
  public lastEditedSubText = null;
  // source mine
  public mine = null;

  // Documents
  public documents = [];
  public links = [];
  public documentsToDelete = [];
  public disableEdit = false;

  // Pick lists
  public recordTypePickList = Picklists.collectionTypePicklist;
  public recordTypeNamesBCMI = Object.values(Picklists.bcmiRecordTypePicklist).map(item => {
    return item.displayName;
  }).sort();
  public permitTypes = ['OGP', 'AMD'];

  public recordAgencies = Picklists.collectionAgencyPicklist;

  // record add edit state
  public recordState = null;

  constructor(
    public route: ActivatedRoute,
    public router: Router,
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

    this.setOrRemoveRecordAddEditState();
    this.route.data.pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: any) => {
      if (res && res.record && res.record[0] && res.record[0].data
        && res.record[0].data.searchResults && res.record[0].data.searchResults[0]) {
        this.record = res.record[0].data.searchResults[0];
        this.bcmiFlavour = this.record.flavours.find(f => f._schemaName.endsWith('BCMI'));
        this.mine = res.mine[0].data;
        // if we have a current flavour, use that
        this.populateTextFields();
        if (this.record.sourceSystemRef === 'core') {
          this.disableEdit = true;
        }
      } else {
        alert('Error: could not load record.');
        this.router.navigate(['mines']);
      }
      this.buildForm();

      this.loading = false;
      this.loadingScreenService.setLoadingState(false, 'main');
      this._changeDetectionRef.detectChanges();
    });
  }

  /**
   * Sets the initial recordAddEdit state, or removes it from the store if it is invalid.
   *
   * @memberof MinesRecordsEditComponent
   */
  setOrRemoveRecordAddEditState() {
    const temprecordAddEditState = this.storeService.getItem(StateIDs.recordAddEdit);
    if (temprecordAddEditState) {
      if (temprecordAddEditState.status === StateStatus.invalid) {
        this.storeService.removeItem(StateIDs.recordAddEdit);
      } else {
        this.recordState = temprecordAddEditState;
      }
    }
  }

  /**
   * Derive static text strings.
   *
   * @memberof MinesRecordsEditComponent
   */
  populateTextFields() {
    if (!this.record) {
      return;
    }

    if (this.record.dateUpdated) {
      this.lastEditedSubText = `Last Edited on ${moment(this.record.dateUpdated).format('MMMM DD, YYYY')}`;
    } else if (this.record.dateAdded) {
      this.lastEditedSubText = `Published on ${moment(this.record.dateAdded).format('MMMM DD, YYYY')}`;
    }
  }

  /**
   * Build the add-edit form.
   *
   * If editing, pre-populate any existing values. If StoreService contains an item named 'recordAddEdit', use any
   * values set in that piece of state to pre-populate the form fields, and then clear that item from the store.
   *
   * @private
   * @memberof MinesRecordsEditComponent
   */
  private buildForm() {
    this.myForm = new FormGroup({
      recordName: new FormControl({
        value: (this.recordState && this.recordState.recordName) || (this.record && this.record.recordName) || '',
        disabled: (this.record && this.record.sourceSystemRef !== 'nrpti')
      }),
      recordDate: new FormControl({
        value: (this.recordState &&
          this.recordState.dateIssued &&
          this.utils.convertJSDateToNGBDate(new Date(this.recordState.dateIssued.date))) ||
          (this.record && this.record.dateIssued &&
            this.utils.convertJSDateToNGBDate(new Date(this.record.dateIssued))) ||
          '' || null,
        disabled: (this.record && this.record.sourceSystemRef !== 'nrpti')
      }),
      recordType: new FormControl({
        value: (this.recordState && this.recordState.recordType)
          || (this.record && this.record.recordType) || '',
        disabled: (this.record && this.record.sourceSystemRef !== 'nrpti')
      }),
      typeCode: new FormControl({
        value: (this.recordState && this.recordState.recordType === 'Permit' && this.recordState.typeCode)
          || (this.record && this.record.recordType === 'Permit' && this.record.typeCode) || '',
        disabled: (this.record && this.record.sourceSystemRef !== 'nrpti')
      }),
      recordAgency: new FormControl({
        value: (this.recordState && this.recordState.recordAgency) ||
          (this.record && this.record.agency) ||
          (this.record && this.record.issuingAgency) || '',
        disabled: (this.record && this.record.sourceSystemRef !== 'nrpti')
      }),
    });

    this.myForm.get('recordType').disable();

    if (this.recordState) {
      // State was saved from before, so mark everything dirty so as not to miss any previous user edits
      this.myForm.get('recordName').markAsDirty();
      this.myForm.get('recordDate').markAsDirty();
      this.myForm.get('recordAgency').markAsDirty();

      // Remove used state
      this.storeService.removeItem(StateIDs.recordAddEdit);
    }
  }

  /**
   * Delete the record.
   *
   * @memberof MinesRecordsTableRowComponent
   */
  deleteRecord() {
    this.dialogService
      .addDialog(
        ConfirmComponent,
        { title: 'Confirm Deletion', message: 'Do you really want to delete this Record?', okOnly: false },
        { backdropColor: 'rgba(0, 0, 0, 0.5)' }
      )
      .pipe(
        takeUntil(this.ngUnsubscribe),
        catchError(() => {
          alert('Failed to delete record.');
          return of(null);
        })
      )
      .subscribe(async isConfirmed => {
        if (!isConfirmed) {
          return;
        }

        try {
          for (const flavour of this.record.flavours) {
            if (flavour._schemaName.includes('BCMI')) {
              await this.factoryService.deleteMineRecord(flavour._id);
              break;
            }
          }
          this.router.navigate(['mines', this.mine._id, 'records']);
        } catch (e) {
          alert('Could not delete Record.');
        }
      });
  }

  /**
   * Submit form data to API.
   *
   * @memberof MinesRecordsEditComponent
   */
  async submit() {
    this.loadingScreenService.setLoadingState(true, 'main');

    const record = {};

    this.myForm.get('recordName').dirty && (record['recordName'] = this.myForm.get('recordName').value);
    this.myForm.get('recordDate').dirty &&
      (record['dateIssued'] = this.utils.convertFormGroupNGBDateToJSDate(this.myForm.get('recordDate').value));
    record['recordType'] = this.myForm.get('recordType').value;
    if (record['recordType'] === 'Permit') {
      record['typeCode'] = this.myForm.get('typeCode').value;
    }
    this.myForm.get('recordAgency').dirty && (record['issuingAgency'] = this.myForm.get('recordAgency').value);

    // lookup appropriate schemaName from type value
    const recordSchema = Object.values(Picklists.bcmiRecordTypePicklist).filter(item => {
      return item.displayName === record['recordType'];
    });

    const schemaString = recordSchema[0]._schemaName;

    // BCMI flavour
    record[schemaString] = {};
    record['recordName'] && (record[schemaString]['recordName'] = record['recordName']);
    record['issuingAgency'] && (record[schemaString]['issuingAgency'] = record['issuingAgency']);
    if (record['recordType'] === 'Permit') {
      record[schemaString]['typeCode'] = this.myForm.get('typeCode').value;
    }

    // if we have a flavour, update the flavour.
    // if we do not, create a flavour.
    if (this.bcmiFlavour) {
      record[schemaString]._id = this.bcmiFlavour._id;
    }

    record['_id'] = this.record._id;
    record['recordType'] = this.myForm.get('recordType').dirty ? this.myForm.get('recordType').value
      : this.record.recordType;

    this.factoryService.editMineRecord(record).subscribe(async res => {
      this.recordUtils.parseResForErrors(res);

      await this.recordUtils.handleDocumentChanges(
        this.links,
        this.documents,
        this.documentsToDelete,
        this.record._id,
        this.factoryService
      );

      this.loadingScreenService.setLoadingState(false, 'main');
      this.router.navigate(['mines', this.mine._id, 'records', this.record._id, 'detail']);
    });
  }
  convertAcronyms(acronym) {
    return Utils.convertAcronyms(acronym);
  }

  /**
   * Cancel editing.
   *
   * @memberof MinesRecordsEditComponent
   */
  cancel() {
    const shouldCancel = confirm(
      'Leaving this page will discard unsaved changes. Are you sure you would like to continue?'
    );
    if (shouldCancel) {
      this.router.navigate(['mines', this.mine._id, 'records', this.record._id, 'detail']);
    }
  }
}
