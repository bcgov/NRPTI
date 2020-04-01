import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { FormGroup, FormControl } from '@angular/forms';
import { Picklists } from '../../../utils/constants/record-constants';
import { EpicProjectIds } from '../../../utils/constants/record-constants';
import { FactoryService } from '../../../services/factory.service';
import { Utils } from 'nrpti-angular-components';
import { RecordUtils } from '../../utils/record-utils';

@Component({
  selector: 'app-inspection-add-edit',
  templateUrl: './inspection-add-edit.component.html',
  styleUrls: ['./inspection-add-edit.component.scss']
})
export class InspectionAddEditComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  public loading = true;
  public isEditing = false;
  public currentRecord = null;
  public myForm: FormGroup;
  public lastEditedSubText = null;

  // Flavour data
  public nrcedFlavour = null;
  public lngFlavour = null;
  public lngPublishSubtext = 'Not published';
  public nrcedPublishSubtext = 'Not published';

  // Pick lists
  public agencies = Picklists.agencyPicklist;
  public authors = Picklists.authorPicklist;
  public outcomeStatuses = Picklists.outcomeStatusPicklist;

  // Documents
  public documents = [];
  public links = [];
  public documentsToDelete = [];

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    private recordUtils: RecordUtils,
    private factoryService: FactoryService,
    private utils: Utils,
    private _changeDetectionRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.route.data.pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: any) => {
      this.isEditing = res.breadcrumb !== 'Add Inspection';
      if (this.isEditing) {
        if (res && res.record && res.record[0] && res.record[0].data) {
          this.currentRecord = res.record[0].data;
          this.populateTextFields();
        } else {
          alert('Error: could not load edit inspection.');
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
      this.lastEditedSubText = `Last Edited on ${this.utils.convertJSDateToString(
        new Date(this.currentRecord.dateUpdated)
      )}`;
    } else {
      this.lastEditedSubText = `Added on ${this.utils.convertJSDateToString(new Date(this.currentRecord.dateAdded))}`;
    }
    for (const flavour of this.currentRecord.flavours) {
      switch (flavour._schemaName) {
        case 'InspectionLNG':
          this.lngFlavour = flavour;
          this.lngFlavour.read.includes('public') &&
            (this.lngPublishSubtext = `Published on ${this.utils.convertJSDateToString(
              new Date(this.lngFlavour.datePublished)
            )}`);
          break;
        case 'InspectionNRCED':
          this.nrcedFlavour = flavour;
          this.nrcedFlavour.read.includes('public') &&
            (this.nrcedPublishSubtext = `Published on ${this.utils.convertJSDateToString(
              new Date(this.nrcedFlavour.datePublished)
            )}`);
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
        (this.currentRecord &&
          this.currentRecord.dateIssued &&
          this.utils.convertJSDateToNGBDate(new Date(this.currentRecord.dateIssued))) ||
        ''
      ),
      issuingAgency: new FormControl((this.currentRecord && this.currentRecord.issuingAgency) || ''),
      author: new FormControl((this.currentRecord && this.currentRecord.author) || ''),
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
      ),
      legislationDescription: new FormControl((this.currentRecord && this.currentRecord.legislationDescription) || ''),
      issuedTo: new FormControl((this.currentRecord && this.currentRecord.issuedTo) || ''),
      projectName: new FormControl((this.currentRecord && this.currentRecord.projectName) || ''),
      location: new FormControl((this.currentRecord && this.currentRecord.location) || ''),
      latitude: new FormControl(
        (this.currentRecord && this.currentRecord.centroid && this.currentRecord.centroid[0]) || ''
      ),
      longitude: new FormControl(
        (this.currentRecord && this.currentRecord.centroid && this.currentRecord.centroid[1]) || ''
      ),
      outcomeStatus: new FormControl((this.currentRecord && this.currentRecord.outcomeStatus) || ''),
      outcomeDescription: new FormControl((this.currentRecord && this.currentRecord.outcomeDescription) || ''),

      // NRCED
      nrcedSummary: new FormControl(
        // default to using the master description if the flavour record does not exist
        (this.currentRecord &&
          ((this.nrcedFlavour && this.nrcedFlavour.summary) ||
            (!this.nrcedFlavour && this.currentRecord.description))) ||
        ''
      ),
      publishNrced: new FormControl(
        (this.currentRecord && this.nrcedFlavour && this.nrcedFlavour.read.includes('public')) || false
      ),

      // LNG
      lngDescription: new FormControl(
        // default to using the master description if the flavour record does not exist
        (this.currentRecord &&
          ((this.lngFlavour && this.lngFlavour.description) || (!this.lngFlavour && this.currentRecord.description))) ||
        ''
      ),
      publishLng: new FormControl(
        (this.currentRecord && this.lngFlavour && this.lngFlavour.read.includes('public')) || false
      )
    });
  }

  navigateToDetails() {
    this.router.navigate(['records', 'inspections', this.currentRecord._id, 'detail']);
  }

  togglePublish(event, flavour) {
    switch (flavour) {
      case 'lng':
        this.myForm.controls.publishLng.setValue(event);
        break;
      case 'nrced':
        this.myForm.controls.publishNrced.setValue(event);
        break;
      default:
        break;
    }
    this._changeDetectionRef.detectChanges();
  }

  async submit() {
    // TODO
    // _epicProjectId
    // _sourceRefId
    // _epicMilestoneId
    // legislation
    // projectName

    const inspection = {};
    this.myForm.controls.recordName.dirty && (inspection['recordName'] = this.myForm.controls.recordName.value);
    this.myForm.controls.dateIssued.dirty &&
      (inspection['dateIssued'] = this.utils.convertFormGroupNGBDateToJSDate(this.myForm.get('dateIssued').value));
    this.myForm.controls.issuingAgency.dirty &&
      (inspection['issuingAgency'] = this.myForm.controls.issuingAgency.value);
    this.myForm.controls.author.dirty && (inspection['author'] = this.myForm.controls.author.value);

    if (
      this.myForm.controls.act.dirty ||
      this.myForm.controls.regulation.dirty ||
      this.myForm.controls.section.dirty ||
      this.myForm.controls.subSection.dirty ||
      this.myForm.controls.paragraph.dirty
    ) {
      inspection['legislation'] = {
        act: this.myForm.controls.act.value,
        regulation: this.myForm.controls.regulation.value,
        section: this.myForm.controls.section.value,
        subSection: this.myForm.controls.subSection.value,
        paragraph: this.myForm.controls.paragraph.value
      };
    }

    this.myForm.controls.legislationDescription.dirty &&
      (inspection['legislationDescription'] = this.myForm.controls.legislationDescription.value);
    this.myForm.controls.issuedTo.dirty && (inspection['issuedTo'] = this.myForm.controls.issuedTo.value);

    // Project name logic
    // If LNG Canada or Coastal Gaslink are selected we need to put it their corresponding OIDs
    this.myForm.controls.projectName.dirty && (inspection['projectName'] = this.myForm.controls.projectName.value);
    if (inspection['projectName'] === 'LNG Canada') {
      inspection['_epicProjectId'] = EpicProjectIds.lngCanadaId;
    } else if (inspection['projectName'] === 'Coastal Gaslink') {
      inspection['_epicProjectId'] = EpicProjectIds.coastalGaslinkId;
    }

    this.myForm.controls.location.dirty && (inspection['location'] = this.myForm.controls.location.value);
    (this.myForm.controls.latitude.dirty || this.myForm.controls.longitude.dirty) &&
      (inspection['centroid'] = [this.myForm.controls.latitude.value, this.myForm.controls.longitude.value]);
    this.myForm.controls.outcomeStatus.dirty &&
      (inspection['outcomeStatus'] = this.myForm.controls.outcomeStatus.value);
    this.myForm.controls.outcomeDescription.dirty &&
      (inspection['outcomeDescription'] = this.myForm.controls.outcomeDescription.value);

    // NRCED flavour
    if (this.myForm.controls.nrcedSummary.dirty || this.myForm.controls.publishNrced.dirty) {
      inspection['InspectionNRCED'] = {};
    }
    this.myForm.controls.nrcedSummary.dirty &&
      (inspection['InspectionNRCED']['summary'] = this.myForm.controls.nrcedSummary.value);
    if (this.myForm.controls.publishNrced.dirty && this.myForm.controls.publishNrced.value) {
      inspection['InspectionNRCED']['addRole'] = 'public';
    } else if (this.myForm.controls.publishNrced.dirty && !this.myForm.controls.publishNrced.value) {
      inspection['InspectionNRCED']['removeRole'] = 'public';
    }

    // LNG flavour
    if (this.myForm.controls.lngDescription.dirty || this.myForm.controls.publishLng.dirty) {
      inspection['InspectionLNG'] = {};
    }
    this.myForm.controls.lngDescription.dirty &&
      (inspection['InspectionLNG']['description'] = this.myForm.controls.lngDescription.value);
    if (this.myForm.controls.publishLng.dirty && this.myForm.controls.publishLng.value) {
      inspection['InspectionLNG']['addRole'] = 'public';
    } else if (this.myForm.controls.publishLng.dirty && !this.myForm.controls.publishLng.value) {
      inspection['InspectionLNG']['removeRole'] = 'public';
    }

    if (!this.isEditing) {
      this.factoryService.createInspection(inspection).subscribe(async res => {
        this.recordUtils.parseResForErrors(res);
        const docResponse = await this.recordUtils.handleDocumentChanges(
          this.links,
          this.documents,
          this.documentsToDelete,
          res[0][0].object._id,
          this.factoryService
        );

        console.log(docResponse);
        this.router.navigate(['records']);
      });
    } else {
      inspection['_id'] = this.currentRecord._id;

      this.nrcedFlavour && inspection['InspectionNRCED'] &&
        (inspection['InspectionNRCED']['_id'] = this.nrcedFlavour._id);
      this.lngFlavour && inspection['InspectionLNG'] && (inspection['InspectionLNG']['_id'] = this.lngFlavour._id);

      this.factoryService.editInspection(inspection).subscribe(async res => {
        this.recordUtils.parseResForErrors(res);
        const docResponse = await this.recordUtils.handleDocumentChanges(
          this.links,
          this.documents,
          this.documentsToDelete,
          this.currentRecord._id,
          this.factoryService
        );

        console.log(docResponse);
        this.router.navigate(['records', 'inspections', this.currentRecord._id, 'detail']);
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
        this.router.navigate(['records', 'inspections', this.currentRecord._id, 'detail']);
      }
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
