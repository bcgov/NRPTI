import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { FormGroup, FormControl } from '@angular/forms';
import { Picklists } from '../../../../../../common/src/app/utils/record-constants';
import { Legislation } from '../../../../../../common/src/app/models/master/common-models/legislation';
import { FactoryService } from '../../../services/factory.service';
import { Utils } from 'nrpti-angular-components';
import { Utils as CommonUtils } from '../../../../../../common/src/app/utils/utils';
import { RecordUtils } from '../../utils/record-utils';
import { LoadingScreenService } from 'nrpti-angular-components';

@Component({
  selector: 'app-annual-report-add-edit',
  templateUrl: './annual-report-add-edit.component.html',
  styleUrls: ['./annual-report-add-edit.component.scss']
})
export class AnnualReportAddEditComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  public loading = true;
  public isEditing = false;
  public currentRecord = null;
  public myForm: FormGroup;
  public lastEditedSubText = null;

  // Flavour data
  public bcmiFlavour = null;
  public bcmiPublishSubtext = 'Not published';

  // Pick lists
  public agencies = Picklists.agencyPicklist;

  // Documents
  public documents = [];
  public links = [];
  public documentsToDelete = [];
  constructor(
    public route: ActivatedRoute,
    public router: Router,
    private recordUtils: RecordUtils,
    private factoryService: FactoryService,
    private loadingScreenService: LoadingScreenService,
    private utils: Utils,
    private _changeDetectionRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.route.data.pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: any) => {
      this.isEditing = res.breadcrumb !== 'Add Annual Report';
      if (this.isEditing) {
        if (res && res.record && res.record[0] && res.record[0].data) {
          this.currentRecord = res.record[0].data;
          this.populateTextFields();
        } else {
          alert('Error: could not load edit annual report.');
          this.router.navigate(['/']);
        }
      }
      this.buildForm();

      this.subscribeToFormControlChanges();

      this.loading = false;
      this._changeDetectionRef.detectChanges();
    });
  }

  private populateTextFields() {
    if (this.currentRecord.dateUpdated) {
      this.lastEditedSubText = `Last Edited on ${this.utils.convertJSDateToString(
        new Date(this.currentRecord.dateUpdated)
      )}`;
    } else {
      this.lastEditedSubText = `Added on ${this.utils.convertJSDateToString(new Date(this.currentRecord.dateAdded))}`;
    }
    for (const flavour of this.currentRecord.flavours) {
      if (flavour._schemaName === 'AnnualReportBCMI') {
        this.bcmiFlavour = flavour;
        this.bcmiFlavour.read.includes('public') &&
          (this.bcmiPublishSubtext = `Published on ${this.utils.convertJSDateToString(
            new Date(this.bcmiFlavour.datePublished)
          )}`);
      }
    }
  }

  private subscribeToFormControlChanges() {
    // listen to legislation control changes
    const debouncedUpdateLegislationDescription = this.utils.debounced(500, () => this.updateLegislationDescription());
    this.myForm
      .get('legislation')
      .valueChanges.pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        debouncedUpdateLegislationDescription();
      });
  }

  private updateLegislationDescription() {
    const legislation = new Legislation({
      act: this.myForm.get('legislation.act').value,
      regulation: this.myForm.get('legislation.regulation').value,
      section: this.myForm.get('legislation.section').value,
      subSection: this.myForm.get('legislation.subSection').value,
      paragraph: this.myForm.get('legislation.paragraph').value
    });

    this.myForm.get('legislationDescription').setValue(Picklists.
      getLegislationDescription('AnnualReport', legislation));
    this.myForm.get('legislationDescription').markAsDirty();
  }

  private buildForm() {
    this.myForm = new FormGroup({
      // Master
      recordName: new FormControl({
        value: (this.currentRecord && this.currentRecord.recordName) || '',
        disabled: !this.factoryService.userInBcmiRole()
      }),
      dateIssued: new FormControl(
        (this.currentRecord &&
          this.currentRecord.dateIssued &&
          this.utils.convertJSDateToNGBDate(new Date(this.currentRecord.dateIssued))) ||
        ''
      ),
      issuingAgency: new FormControl((this.currentRecord && this.currentRecord.issuingAgency) || ''),
      legislation: new FormGroup({
        act: new FormControl(
          (this.currentRecord && this.currentRecord.legislation && this.currentRecord.legislation.act) || ''
        ),
        regulation: new FormControl(
          (this.currentRecord && this.currentRecord.legislation && this.currentRecord.legislation.regulation) || ''
        ),
        section: new FormControl(
          (this.currentRecord && this.currentRecord.legislation && this.currentRecord.legislation.section) || ''
        ),
        subSection: new FormControl(
          (this.currentRecord && this.currentRecord.legislation && this.currentRecord.legislation.subSection) || ''
        ),
        paragraph: new FormControl(
          (this.currentRecord && this.currentRecord.legislation && this.currentRecord.legislation.paragraph) || ''
        )
      }),
      legislationDescription: new FormControl((this.currentRecord && this.currentRecord.legislationDescription) || ''),
      issuedTo: new FormGroup({
        type: new FormControl(
          (this.currentRecord && this.currentRecord.issuedTo && this.currentRecord.issuedTo.type) || ''
        ),
        companyName: new FormControl(
          (this.currentRecord && this.currentRecord.issuedTo && this.currentRecord.issuedTo.companyName) || ''
        ),
        firstName: new FormControl(
          (this.currentRecord && this.currentRecord.issuedTo && this.currentRecord.issuedTo.firstName) || ''
        ),
        middleName: new FormControl(
          (this.currentRecord && this.currentRecord.issuedTo && this.currentRecord.issuedTo.middleName) || ''
        ),
        lastName: new FormControl(
          (this.currentRecord && this.currentRecord.issuedTo && this.currentRecord.issuedTo.lastName) || ''
        ),
        fullName: new FormControl(
          (this.currentRecord && this.currentRecord.issuedTo && this.currentRecord.issuedTo.fullName) || ''
        ),
        dateOfBirth: new FormControl(
          (this.currentRecord &&
            this.currentRecord.issuedTo &&
            this.currentRecord.issuedTo.dateOfBirth &&
            this.utils.convertJSDateToNGBDate(new Date(this.currentRecord.issuedTo.dateOfBirth))) ||
          ''
        ),
        anonymous: new FormControl(
          (this.currentRecord && this.currentRecord.issuedTo && this.currentRecord.issuedTo.anonymous) || ''
        )
      }),
      projectName: new FormControl((this.currentRecord && this.currentRecord.projectName) || ''),
      location: new FormControl((this.currentRecord && this.currentRecord.location) || ''),
      latitude: new FormControl(
        (this.currentRecord && this.currentRecord.centroid && this.currentRecord.centroid[1]) || ''
      ),
      longitude: new FormControl(
        (this.currentRecord && this.currentRecord.centroid && this.currentRecord.centroid[0]) || ''
      ),

      // BCMI
      bcmiDescription: new FormControl(
        // default to using the master description if the flavour record does not exist
        (this.currentRecord &&
          ((this.bcmiFlavour && this.bcmiFlavour.description) ||
          (!this.bcmiFlavour && this.currentRecord.description))) ||
          ''
      ),
      publishBcmi: new FormControl({
        value: (this.currentRecord && this.bcmiFlavour && this.bcmiFlavour.read.includes('public')) || false,
        disabled: !this.factoryService.userInBcmiRole()
      })
    });
  }

  navigateToDetails() {
    this.router.navigate(['records', 'annual-reports', this.currentRecord._id, 'detail']);
  }

  togglePublish(event, flavour) {
    switch (flavour) {
      case 'bcmi':
        this.myForm.controls.publishBcmi.setValue(event.checked);
        break;
      default:
        break;
    }
    this._changeDetectionRef.detectChanges();
  }

  async submit() {
    this.loadingScreenService.setLoadingState(true, 'main');
    // TODO
    // _epicProjectId
    // _sourceRefId
    // _epicMilestoneId
    // legislation
    // projectName

    const annualReport = {};
    this.myForm.controls.recordName.dirty &&
      (annualReport['recordName'] = this.myForm.controls.recordName.value);
    this.myForm.controls.dateIssued.dirty &&
      (annualReport['dateIssued'] =
        this.utils.convertFormGroupNGBDateToJSDate(this.myForm.get('dateIssued').value));
    this.myForm.controls.issuingAgency.dirty &&
      (annualReport['issuingAgency'] = this.myForm.controls.issuingAgency.value);

    if (
      this.myForm.get('legislation.act').dirty ||
      this.myForm.get('legislation.regulation').dirty ||
      this.myForm.get('legislation.section').dirty ||
      this.myForm.get('legislation.subSection').dirty ||
      this.myForm.get('legislation.paragraph').dirty
    ) {
      annualReport['legislation'] = {
        act: this.myForm.get('legislation.act').value,
        regulation: this.myForm.get('legislation.regulation').value,
        section: this.myForm.get('legislation.section').value,
        subSection: this.myForm.get('legislation.subSection').value,
        paragraph: this.myForm.get('legislation.paragraph').value
      };
    }

    this.myForm.controls.legislationDescription.dirty &&
      (annualReport['legislationDescription'] = this.myForm.controls.legislationDescription.value);

    if (
      this.myForm.get('issuedTo.type').dirty ||
      this.myForm.get('issuedTo.companyName').dirty ||
      this.myForm.get('issuedTo.firstName').dirty ||
      this.myForm.get('issuedTo.middleName').dirty ||
      this.myForm.get('issuedTo.lastName').dirty ||
      this.myForm.get('issuedTo.fullName').dirty ||
      this.myForm.get('issuedTo.dateOfBirth').dirty
    ) {
      annualReport['issuedTo'] = {
        type: this.myForm.get('issuedTo.type').value,
        companyName: this.myForm.get('issuedTo.companyName').value,
        firstName: this.myForm.get('issuedTo.firstName').value,
        middleName: this.myForm.get('issuedTo.middleName').value,
        lastName: this.myForm.get('issuedTo.lastName').value,
        fullName: this.myForm.get('issuedTo.fullName').value,
        dateOfBirth: this.utils.convertFormGroupNGBDateToJSDate(this.myForm.get('issuedTo.dateOfBirth').value)
      };
    }

    this.myForm.controls.location.dirty && (annualReport['location'] = this.myForm.controls.location.value);
    (this.myForm.controls.latitude.dirty || this.myForm.controls.longitude.dirty) &&
      (annualReport['centroid'] = [this.myForm.controls.longitude.value, this.myForm.controls.latitude.value]);

    // BCMI flavour
    if (this.myForm.controls.bcmiDescription.dirty || this.myForm.controls.publishBcmi.dirty) {
      annualReport['AnnualReportBCMI'] = {};
    }
    this.myForm.controls.bcmiDescription.dirty &&
      (annualReport['AnnualReportBCMI']['description'] = this.myForm.controls.bcmiDescription.value);
    if (this.myForm.controls.publishBcmi.dirty && this.myForm.controls.publishBcmi.value) {
      annualReport['AnnualReportBCMI']['addRole'] = 'public';
    } else if (this.myForm.controls.publishBcmi.dirty && !this.myForm.controls.publishBcmi.value) {
      annualReport['AnnualReportBCMI']['removeRole'] = 'public';
    }

    if (!this.isEditing) {
      this.factoryService.createAnnualReport(annualReport).subscribe(async res => {
        this.recordUtils.parseResForErrors(res);
        await this.recordUtils.handleDocumentChanges(
          this.links,
          this.documents,
          this.documentsToDelete,
          res[0][0].object._id,
          this.factoryService
        );

        this.loadingScreenService.setLoadingState(false, 'main');
        this.router.navigate(['records']);
      });
    } else {
      annualReport['_id'] = this.currentRecord._id;

      if (this.bcmiFlavour) {
        if (!CommonUtils.isObject(annualReport['AnnualReportBCMI'])) {
          annualReport['AnnualReportBCMI'] = {};
        }

        // always update if flavour exists, regardless of flavour field changes, as fields in master might have changed
        annualReport['AnnualReportBCMI']['_id'] = this.bcmiFlavour._id;
      }

      this.factoryService.editAnnualReport(annualReport).subscribe(async res => {
        this.recordUtils.parseResForErrors(res);
        await this.recordUtils.handleDocumentChanges(
          this.links,
          this.documents,
          this.documentsToDelete,
          this.currentRecord._id,
          this.factoryService
        );

        this.loadingScreenService.setLoadingState(false, 'main');
        this.router.navigate(['records', 'annual-reports', this.currentRecord._id, 'detail']);
      });
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
        this.router.navigate(['records', 'annual-reports', this.currentRecord._id, 'detail']);
      }
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
