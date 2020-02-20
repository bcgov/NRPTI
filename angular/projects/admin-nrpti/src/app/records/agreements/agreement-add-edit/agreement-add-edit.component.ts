import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { FormGroup, FormControl } from '@angular/forms';
import { Agreement } from '../../../../../../common/src/app/models/master';
import { EpicProjectIds } from '../../../utils/constants/record-constants';
import { FactoryService } from '../../../services/factory.service';
import { Utils } from 'nrpti-angular-components';

@Component({
  selector: 'app-agreement-add-edit',
  templateUrl: './agreement-add-edit.component.html',
  styleUrls: ['./agreement-add-edit.component.scss']
})
export class AgreementAddEditComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  public loading = true;
  public isEditing = false;
  public currentRecord = null;
  public myForm: FormGroup;
  public lastEditedSubText = null;

  // Flavour data
  public lngFlavour = null;
  public lngPublishStatus = 'Unpublished';
  public lngPublishSubtext = 'Not published';

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    private factoryService: FactoryService,
    private utils: Utils,
    private _changeDetectionRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.route.data.pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: any) => {
      this.isEditing = res.breadcrumb !== 'Add Agreement';
      if (this.isEditing) {
        if (res && res.record && res.record[0] && res.record[0].data) {
          this.currentRecord = res.record[0].data;
          this.populateTextFields();
        } else {
          alert('Error: could not load edit agreement.');
          this.router.navigate(['/']);
        }
      }
      this.buildForm();
      this.loading = false;
      this._changeDetectionRef.detectChanges();
    });
  }

  private populateTextFields() {
    if (this.currentRecord.dateUpdated) {
      this.lastEditedSubText = `Last Edited on ${this.utils.convertJSDateToString(new Date(this.currentRecord.dateUpdated))}`;
    } else {
      this.lastEditedSubText = `Added on ${this.utils.convertJSDateToString(new Date(this.currentRecord.dateAdded))}`;
    }
    for (const flavour of this.currentRecord.flavours) {
      switch (flavour._schemaName) {
        case 'AgreementLNG':
          this.lngFlavour = flavour;
          this.lngFlavour.read.includes('public') && (this.lngPublishStatus = 'Published');
          this.lngFlavour.read.includes('public') && (this.lngPublishSubtext = `Published on ${this.utils.convertJSDateToString(new Date(this.lngFlavour.datePublished))}`);
          break;
        default:
          break;
      }
    }
  }

  private buildForm() {
    this.myForm = new FormGroup({
      // Master
      recordName: new FormControl((this.currentRecord && this.currentRecord.recordName) || ''),
      dateIssued: new FormControl(
        (
          this.currentRecord &&
          this.currentRecord.dateIssued &&
          this.utils.convertJSDateToNGBDate(new Date(this.currentRecord.dateIssued))
        ) || ''
      ),
      nationName: new FormControl((this.currentRecord && this.currentRecord.nationName) || ''),
      projectName: new FormControl((this.currentRecord && this.currentRecord.projectName) || ''),

      // LNG
      lngDescription: new FormControl((this.currentRecord && this.lngFlavour && this.lngFlavour.description) || '')
    });
  }

  navigateToDetails() {
    this.router.navigate(['records', 'agreements', this.currentRecord._id, 'detail']);
  }

  togglePublish(flavour) {
    switch (flavour) {
      case 'lng':
        this.lngPublishStatus = this.lngPublishStatus === 'Unpublished' ? 'Published' : 'Unpublished';
        break;
      default:
        break;
    }
    this._changeDetectionRef.detectChanges();
  }

  submit() {
    // TODO
    // _epicProjectId
    // _sourceRefId
    // _epicMilestoneId
    // projectName
    // documentURL

    // TODO: For editing we should create an object with only the changed fields.
    const agreement = new Agreement({
      recordName: this.myForm.controls.recordName.value,
      recordType: 'Agreement',
      dateIssued: this.utils.convertFormGroupNGBDateToJSDate(this.myForm.get('dateIssued').value),
      nationName: this.myForm.controls.nationName.value,
      projectName: this.myForm.controls.projectName.value,
    });

    // Project name logic
    // If LNG Canada or Coastal Gaslink are selected we need to put it their corresponding OIDs
    if (agreement.projectName === 'LNG Canada') {
      agreement._epicProjectId = EpicProjectIds.lngCanadaId;
    } else if (agreement.projectName === 'Coastal Gaslink') {
      agreement._epicProjectId = EpicProjectIds.coastalGaslinkId;
    }

    // Publishing logic
    agreement.AgreementLNG = {
      description: this.myForm.controls.lngDescription.value
    };
    if (this.lngPublishStatus === 'Published') {
      agreement.AgreementLNG['addRole'] = 'public';
    } else if (this.isEditing && this.lngPublishStatus === 'Unpublished') {
      agreement.AgreementLNG['removeRole'] = 'public';
    }

    if (!this.isEditing) {
      this.factoryService.createAgreement(agreement).subscribe(res => {
        this.parseResForErrors(res);
        this.router.navigate(['records']);
      });
    } else {
      agreement._id = this.currentRecord._id;

      this.lngFlavour && (agreement.AgreementLNG['_id'] = this.lngFlavour._id);

      this.factoryService.editAgreement(agreement).subscribe(res => {
        this.parseResForErrors(res);
        this.router.navigate(['records', 'agreements', this.currentRecord._id, 'detail']);
      });
    }
  }

  private parseResForErrors(res) {
    if (!res || !res.length || !res[0] || !res[0].length || !res[0][0]) {
      alert('Failed to save record.');
    }

    if (res[0][0].status === 'failure') {
      alert('Failed to save master record.');
    }

    if (res[0][0].flavours) {
      let flavourFailure = false;
      res[0][0].flavours.forEach(flavour => {
        if (flavour.status === 'failure') {
          flavourFailure = true;
        }
      });
      if (flavourFailure) {
        alert('Failed to save one or more flavour records');
      }
    }
  }

  cancel() {
    const shouldCancel = confirm(
      'Leaving this page will discard unsaved changes. Are you sure you would like to continue?'
    );
    if (shouldCancel) {
      if (!this.isEditing) {
        this.router.navigate(['records']);
      } else {
        this.router.navigate(['records', 'agreements', this.currentRecord._id, 'detail']);
      }
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
