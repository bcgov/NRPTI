import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { FormGroup, FormControl } from '@angular/forms';
import { Picklists, EpicProjectIds } from '../../../../../../common/src/app/utils/record-constants';
import { Legislation } from '../../../../../../common/src/app/models/master/common-models/legislation';
import { FactoryService } from '../../../services/factory.service';
import { Utils } from 'nrpti-angular-components';
import { Utils as CommonUtils } from '../../../../../../common/src/app/utils/utils';
import { RecordUtils } from '../../utils/record-utils';
import { LoadingScreenService } from 'nrpti-angular-components';

@Component({
  selector: 'app-report-add-edit',
  templateUrl: './report-add-edit.component.html',
  styleUrls: ['./report-add-edit.component.scss']
})
export class ReportAddEditComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  public loading = true;
  public isEditing = false;
  public currentRecord = null;
  public myForm: FormGroup;
  public lastEditedSubText = null;

  // Flavour data
  public nrcedFlavour = null;
  public nrcedPublishSubtext = 'Not published';
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
      this.isEditing = res.breadcrumb !== 'Add Report';
      if (this.isEditing) {
        if (res && res.record && res.record[0] && res.record[0].data) {
          this.currentRecord = res.record[0].data;
          this.populateTextFields();
        } else {
          alert('Error: could not load edit report.');
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
      switch (flavour._schemaName) {
        case 'ReportNRCED':
          this.nrcedFlavour = flavour;
          this.nrcedFlavour.read.includes('public') &&
            (this.nrcedPublishSubtext = `Published on ${this.utils.convertJSDateToString(
              new Date(this.nrcedFlavour.datePublished)
            )}`);
          break;
        case 'ReportBCMI':
          this.bcmiFlavour = flavour;
          this.bcmiFlavour.read.includes('public') &&
            (this.bcmiPublishSubtext = `Published on ${this.utils.convertJSDateToString(
              new Date(this.bcmiFlavour.datePublished)
            )}`);
          break;
        default:
          break;
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
      getLegislationDescription('Report', legislation));
    this.myForm.get('legislationDescription').markAsDirty();
  }

  private buildForm() {
    this.myForm = new FormGroup({
      // Master
      recordName: new FormControl({
        value: (this.currentRecord && this.currentRecord.recordName) || '',
        disabled: !this.factoryService.userInNrcedRole() || !this.factoryService.userInBcmiRole()
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

      // nrced
      nrcedDescription: new FormControl(
        // default to using the master description if the flavour record does not exist
        (this.currentRecord &&
          ((this.nrcedFlavour && this.nrcedFlavour.description) ||
          (!this.nrcedFlavour && this.currentRecord.description))) ||
        ''
      ),
      publishNrced: new FormControl({
        value: (this.currentRecord && this.nrcedFlavour && this.nrcedFlavour.read.includes('public')) || false,
        disabled: !this.factoryService.userInNrcedRole()
      }),

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
    this.router.navigate(['records', 'reports', this.currentRecord._id, 'detail']);
  }

  togglePublish(event, flavour) {
    switch (flavour) {
      case 'nrced':
        this.myForm.controls.publishNrced.setValue(event.checked);
        break;
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

    const report = {};
    this.myForm.controls.recordName.dirty &&
      (report['recordName'] = this.myForm.controls.recordName.value);
    this.myForm.controls.dateIssued.dirty &&
      (report['dateIssued'] =
        this.utils.convertFormGroupNGBDateToJSDate(this.myForm.get('dateIssued').value));
    this.myForm.controls.issuingAgency.dirty &&
      (report['issuingAgency'] = this.myForm.controls.issuingAgency.value);

    if (
      this.myForm.get('legislation.act').dirty ||
      this.myForm.get('legislation.regulation').dirty ||
      this.myForm.get('legislation.section').dirty ||
      this.myForm.get('legislation.subSection').dirty ||
      this.myForm.get('legislation.paragraph').dirty
    ) {
      report['legislation'] = {
        act: this.myForm.get('legislation.act').value,
        regulation: this.myForm.get('legislation.regulation').value,
        section: this.myForm.get('legislation.section').value,
        subSection: this.myForm.get('legislation.subSection').value,
        paragraph: this.myForm.get('legislation.paragraph').value
      };
    }

    this.myForm.controls.legislationDescription.dirty &&
      (report['legislationDescription'] = this.myForm.controls.legislationDescription.value);

    if (
      this.myForm.get('issuedTo.type').dirty ||
      this.myForm.get('issuedTo.companyName').dirty ||
      this.myForm.get('issuedTo.firstName').dirty ||
      this.myForm.get('issuedTo.middleName').dirty ||
      this.myForm.get('issuedTo.lastName').dirty ||
      this.myForm.get('issuedTo.fullName').dirty ||
      this.myForm.get('issuedTo.dateOfBirth').dirty
    ) {
      report['issuedTo'] = {
        type: this.myForm.get('issuedTo.type').value,
        companyName: this.myForm.get('issuedTo.companyName').value,
        firstName: this.myForm.get('issuedTo.firstName').value,
        middleName: this.myForm.get('issuedTo.middleName').value,
        lastName: this.myForm.get('issuedTo.lastName').value,
        fullName: this.myForm.get('issuedTo.fullName').value,
        dateOfBirth: this.utils.convertFormGroupNGBDateToJSDate(this.myForm.get('issuedTo.dateOfBirth').value)
      };
    }
    // Project name logic
    // If LNG Canada or Coastal Gaslink are selected we need to put it their corresponding OIDs
    if (this.myForm.controls.projectName.dirty) {
      report['projectName'] = this.myForm.controls.projectName.value;
      if (report['projectName'] === 'LNG Canada') {
        report['_epicProjectId'] = EpicProjectIds.lngCanadaId;
      } else if (report['projectName'] === 'Coastal Gaslink') {
        report['_epicProjectId'] = EpicProjectIds.coastalGaslinkId;
      } else {
        report['_epicProjectId'] = null;
      }
    }

    this.myForm.controls.location.dirty && (report['location'] = this.myForm.controls.location.value);
    (this.myForm.controls.latitude.dirty || this.myForm.controls.longitude.dirty) &&
      (report['centroid'] = [this.myForm.controls.longitude.value, this.myForm.controls.latitude.value]);

    // nrced flavour
    if (this.myForm.controls.nrcedDescription.dirty || this.myForm.controls.publishNrced.dirty) {
      report['ReportNRCED'] = {};
    }
    this.myForm.controls.nrcedDescription.dirty &&
      (report['ReportNRCED']['description'] = this.myForm.controls.nrcedDescription.value);
    if (this.myForm.controls.publishNrced.dirty && this.myForm.controls.publishNrced.value) {
      report['ReportNRCED']['addRole'] = 'public';
    } else if (this.myForm.controls.publishNrced.dirty && !this.myForm.controls.publishNrced.value) {
      report['ReportNRCED']['removeRole'] = 'public';
    }

    // BCMI flavour
    if (this.myForm.controls.bcmiDescription.dirty || this.myForm.controls.publishBcmi.dirty) {
      report['ReportBCMI'] = {};
    }
    this.myForm.controls.bcmiDescription.dirty &&
      (report['ReportBCMI']['description'] = this.myForm.controls.bcmiDescription.value);
    if (this.myForm.controls.publishBcmi.dirty && this.myForm.controls.publishBcmi.value) {
      report['ReportBCMI']['addRole'] = 'public';
    } else if (this.myForm.controls.publishBcmi.dirty && !this.myForm.controls.publishBcmi.value) {
      report['ReportBCMI']['removeRole'] = 'public';
    }

    if (!this.isEditing) {
      this.factoryService.writeRecord(report, 'reports', true).subscribe(async res => {
        this.recordUtils.parseResForErrors(res);
        let _id = null;
        if (Array.isArray(res[0][0].object)) {
          _id = res[0][0].object.find(r => r._schemaName === 'Report')._id;
        } else {
          _id = res[0][0].object._id;
        }

        await this.recordUtils.handleDocumentChanges(
          this.links,
          this.documents,
          this.documentsToDelete,
          _id,
          this.factoryService
        );

        this.loadingScreenService.setLoadingState(false, 'main');
        this.router.navigate(['records']);
      });
    } else {
      report['_id'] = this.currentRecord._id;

      if (this.nrcedFlavour) {
        if (!CommonUtils.isObject(report['ReportNRCED'])) {
          report['ReportNRCED'] = {};
        }

        // always update if flavour exists, regardless of flavour field changes, as fields in master might have changed
        report['ReportNRCED']['_id'] = this.nrcedFlavour._id;
      }

      if (this.bcmiFlavour) {
        if (!CommonUtils.isObject(report['ReportBCMI'])) {
          report['ReportBCMI'] = {};
        }

        // always update if flavour exists, regardless of flavour field changes, as fields in master might have changed
        report['ReportBCMI']['_id'] = this.bcmiFlavour._id;
      }

      this.factoryService.writeRecord(report, 'reports', false).subscribe(async res => {
        this.recordUtils.parseResForErrors(res);
        await this.recordUtils.handleDocumentChanges(
          this.links,
          this.documents,
          this.documentsToDelete,
          this.currentRecord._id,
          this.factoryService
        );

        this.loadingScreenService.setLoadingState(false, 'main');
        this.router.navigate(['records', 'reports', this.currentRecord._id, 'detail']);
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
        this.router.navigate(['records', 'reports', this.currentRecord._id, 'detail']);
      }
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
