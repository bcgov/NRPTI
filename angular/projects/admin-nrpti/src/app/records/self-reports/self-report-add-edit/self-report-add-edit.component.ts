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
  selector: 'app-self-report-add-edit',
  templateUrl: './self-report-add-edit.component.html',
  styleUrls: ['./self-report-add-edit.component.scss']
})
export class SelfReportAddEditComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  public loading = true;
  public isEditing = false;
  public currentRecord = null;
  public myForm: FormGroup;
  public lastEditedSubText = null;

  // Flavour data
  public lngFlavour = null;
  public lngPublishSubtext = 'Not published';

  // Pick lists
  public agencies = Picklists.agencyPicklist;
  public authors = Picklists.authorPicklist;

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
      this.isEditing = res.breadcrumb !== 'Add Compliance Self-Report';
      if (this.isEditing) {
        if (res && res.record && res.record[0] && res.record[0].data) {
          this.currentRecord = res.record[0].data;
          this.populateTextFields();
        } else {
          alert('Error: could not load edit selfReport.');
          this.router.navigate(['/']);
        }
      } else {
        this.currentRecord = {
          sourceSystemRef: 'nrpti',
          documents: []
        };
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
        case 'SelfReportLNG':
          this.lngFlavour = flavour;
          this.lngFlavour.read.includes('public') &&
            (this.lngPublishSubtext = `Published on ${this.utils.convertJSDateToString(
              new Date(this.lngFlavour.datePublished)
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

    this.myForm.get('legislationDescription').setValue(Picklists.getLegislationDescription('SelfReport', legislation));
    this.myForm.get('legislationDescription').markAsDirty();
  }

  private buildForm() {
    this.myForm = new FormGroup({
      // Master
      recordName: new FormControl({
        value: (this.currentRecord && this.currentRecord.recordName) || '',
        disabled: this.currentRecord.sourceSystemRef !== 'nrpti' && !this.factoryService.userInLngRole()
      }),
      dateIssued: new FormControl({
        value: (this.currentRecord &&
          this.currentRecord.dateIssued &&
          this.utils.convertJSDateToNGBDate(new Date(this.currentRecord.dateIssued))) ||
        '',
        disabled: this.currentRecord.sourceSystemRef !== 'nrpti'
      }),
      issuingAgency: new FormControl({
        value: (this.currentRecord && this.currentRecord.issuingAgency) || '',
        disabled: this.currentRecord.sourceSystemRef !== 'nrpti'
      }),
      author: new FormControl({
        value: (this.currentRecord && this.currentRecord.author) || '',
        disabled: this.currentRecord.sourceSystemRef !== 'nrpti'
      }),
      legislation: new FormGroup({
        act: new FormControl({
          value: (this.currentRecord && this.currentRecord.legislation && this.currentRecord.legislation.act) || '',
          disabled: this.currentRecord.sourceSystemRef !== 'nrpti'
        }),
        regulation: new FormControl({
          value: (this.currentRecord && this.currentRecord.legislation && this.currentRecord.legislation.regulation) || '',
          disabled: this.currentRecord.sourceSystemRef !== 'nrpti'
        }),
        section: new FormControl({
          value: (this.currentRecord && this.currentRecord.legislation && this.currentRecord.legislation.section) || '',
          disabled: this.currentRecord.sourceSystemRef !== 'nrpti'
        }),
        subSection: new FormControl({
          value: (this.currentRecord && this.currentRecord.legislation && this.currentRecord.legislation.subSection) || '',
          disabled: this.currentRecord.sourceSystemRef !== 'nrpti'
        }),
        paragraph: new FormControl({
          value: (this.currentRecord && this.currentRecord.legislation && this.currentRecord.legislation.paragraph) || '',
          disabled: this.currentRecord.sourceSystemRef !== 'nrpti'
        })
      }),
      legislationDescription: new FormControl({
        value: (this.currentRecord && this.currentRecord.legislationDescription) || '',
        disabled: this.currentRecord.sourceSystemRef !== 'nrpti'
      }),
      projectName: new FormControl({
        value: (this.currentRecord && this.currentRecord.projectName) || '',
        disabled: this.currentRecord.sourceSystemRef !== 'nrpti'
      }),
      location: new FormControl({
        value: (this.currentRecord && this.currentRecord.location) || '',
        disabled: this.currentRecord.sourceSystemRef !== 'nrpti'
      }),
      latitude: new FormControl({
        value: (this.currentRecord && this.currentRecord.centroid && this.currentRecord.centroid[1]) || '',
        disabled: this.currentRecord.sourceSystemRef !== 'nrpti'
      }),
      longitude: new FormControl({
        value: (this.currentRecord && this.currentRecord.centroid && this.currentRecord.centroid[0]) || '',
        disabled: this.currentRecord.sourceSystemRef !== 'nrpti'
      }),

      // LNG
      lngRelatedPhase: new FormControl((this.currentRecord && this.lngFlavour && this.lngFlavour.relatedPhase) || ''),
      lngDescription: new FormControl({
        value: (this.currentRecord && this.lngFlavour && this.lngFlavour.description) || '',
        disabled: !this.factoryService.userInLngRole()
      }),
      publishLng: new FormControl({
        value: (this.currentRecord && this.lngFlavour && this.lngFlavour.read.includes('public')) || false,
        disabled: !this.factoryService.userInLngRole()
      })
    });
  }

  navigateToDetails() {
    this.router.navigate(['records', 'self-reports', this.currentRecord._id, 'detail']);
  }

  togglePublish(event, flavour) {
    switch (flavour) {
      case 'lng':
        this.myForm.controls.publishLng.setValue(event.checked);
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

    const selfReport = {};
    this.myForm.controls.recordName.dirty && (selfReport['recordName'] = this.myForm.controls.recordName.value);
    this.myForm.controls.dateIssued.dirty &&
      (selfReport['dateIssued'] = this.utils.convertFormGroupNGBDateToJSDate(this.myForm.get('dateIssued').value));
    this.myForm.controls.issuingAgency.dirty &&
      (selfReport['issuingAgency'] = this.myForm.controls.issuingAgency.value);
    this.myForm.controls.author.dirty && (selfReport['author'] = this.myForm.controls.author.value);

    if (
      this.myForm.get('legislation.act').dirty ||
      this.myForm.get('legislation.regulation').dirty ||
      this.myForm.get('legislation.section').dirty ||
      this.myForm.get('legislation.subSection').dirty ||
      this.myForm.get('legislation.paragraph').dirty
    ) {
      selfReport['legislation'] = {
        act: this.myForm.get('legislation.act').value,
        regulation: this.myForm.get('legislation.regulation').value,
        section: this.myForm.get('legislation.section').value,
        subSection: this.myForm.get('legislation.subSection').value,
        paragraph: this.myForm.get('legislation.paragraph').value
      };
    }
    this.myForm.controls.legislationDescription.dirty &&
      (selfReport['legislationDescription'] = this.myForm.controls.legislationDescription.value);

    // Project name logic
    // If LNG Canada or Coastal Gaslink are selected we need to put it their corresponding OIDs
    if (this.myForm.controls.projectName.dirty) {
      selfReport['projectName'] = this.myForm.controls.projectName.value;
      if (selfReport['projectName'] === 'LNG Canada') {
        selfReport['_epicProjectId'] = EpicProjectIds.lngCanadaId;
      } else if (selfReport['projectName'] === 'Coastal Gaslink') {
        selfReport['_epicProjectId'] = EpicProjectIds.coastalGaslinkId;
      } else {
        selfReport['_epicProjectId'] = null;
      }
    }

    this.myForm.controls.location.dirty && (selfReport['location'] = this.myForm.controls.location.value);
    (this.myForm.controls.latitude.dirty || this.myForm.controls.longitude.dirty) &&
      (selfReport['centroid'] = [this.myForm.controls.longitude.value, this.myForm.controls.latitude.value]);

    // LNG flavour
    if (
      this.myForm.controls.lngDescription.dirty ||
      this.myForm.controls.lngRelatedPhase.dirty ||
      this.myForm.controls.publishLng.dirty
    ) {
      selfReport['SelfReportLNG'] = {};
    }
    this.myForm.controls.lngDescription.dirty &&
      (selfReport['SelfReportLNG']['description'] = this.myForm.controls.lngDescription.value);
    this.myForm.controls.lngRelatedPhase.dirty &&
      (selfReport['SelfReportLNG']['relatedPhase'] = this.myForm.controls.lngRelatedPhase.value);
    if (this.myForm.controls.publishLng.dirty && this.myForm.controls.publishLng.value) {
      selfReport['SelfReportLNG']['addRole'] = 'public';
    } else if (this.myForm.controls.publishLng.dirty && !this.myForm.controls.publishLng.value) {
      selfReport['SelfReportLNG']['removeRole'] = 'public';
    }

    if (!this.isEditing) {
      this.factoryService.writeRecord(selfReport, 'selfReports', true).subscribe(async res => {
        this.recordUtils.parseResForErrors(res);
        const docResponse = await this.recordUtils.handleDocumentChanges(
          this.links,
          this.documents,
          this.documentsToDelete,
          res[0][0].object._id,
          this.factoryService
        );

        console.log(docResponse);
        this.loadingScreenService.setLoadingState(false, 'main');
        this.router.navigate(['records']);
      });
    } else {
      selfReport['_id'] = this.currentRecord._id;

      if (this.lngFlavour) {
        if (!CommonUtils.isObject(selfReport['SelfReportLNG'])) {
          selfReport['SelfReportLNG'] = {};
        }

        // always update if flavour exists, regardless of flavour field changes, as fields in master might have changed
        selfReport['SelfReportLNG']['_id'] = this.lngFlavour._id;
      }

      this.factoryService.writeRecord(selfReport, 'selfReports', false).subscribe(async res => {
        this.recordUtils.parseResForErrors(res);
        const docResponse = await this.recordUtils.handleDocumentChanges(
          this.links,
          this.documents,
          this.documentsToDelete,
          this.currentRecord._id,
          this.factoryService
        );

        console.log(docResponse);
        this.loadingScreenService.setLoadingState(false, 'main');
        this.router.navigate(['records', 'self-reports', this.currentRecord._id, 'detail']);
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
        this.router.navigate(['records', 'self-reports', this.currentRecord._id, 'detail']);
      }
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
