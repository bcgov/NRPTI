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
  selector: 'app-restorative-justice-add-edit',
  templateUrl: './restorative-justice-add-edit.component.html',
  styleUrls: ['./restorative-justice-add-edit.component.scss']
})
export class RestorativeJusticeAddEditComponent implements OnInit, OnDestroy {
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
  ) {}

  ngOnInit() {
    this.route.data.pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: any) => {
      this.isEditing = res.breadcrumb !== 'Add Restorative Justice';
      if (this.isEditing) {
        if (res && res.record && res.record[0] && res.record[0].data) {
          this.currentRecord = res.record[0].data;
          this.populateTextFields();
        } else {
          alert('Error: could not load edit restorative justice.');
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
        case 'RestorativeJusticeLNG':
          this.lngFlavour = flavour;
          this.lngFlavour.read.includes('public') &&
            (this.lngPublishSubtext = `Published on ${this.utils.convertJSDateToString(
              new Date(this.lngFlavour.datePublished)
            )}`);
          break;
        case 'RestorativeJusticeNRCED':
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
      offence: new FormControl((this.currentRecord && this.currentRecord.offence) || ''),
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
      penalty: new FormControl((this.currentRecord && this.currentRecord.penalty) || ''),

      // NRCED
      nrcedSummary: new FormControl((this.currentRecord && this.nrcedFlavour && this.nrcedFlavour.summary) || ''),
      publishNrced: new FormControl(
        (this.currentRecord && this.nrcedFlavour && this.nrcedFlavour.read.includes('public')) || false
      ),

      // LNG
      lngDescription: new FormControl((this.currentRecord && this.lngFlavour && this.lngFlavour.description) || ''),
      publishLng: new FormControl(
        (this.currentRecord && this.lngFlavour && this.lngFlavour.read.includes('public')) || false
      )
    });
  }

  navigateToDetails() {
    this.router.navigate(['records', 'restorative-justices', this.currentRecord._id, 'detail']);
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

    const restorativeJustice = {};
    this.myForm.controls.recordName.dirty && (restorativeJustice['recordName'] = this.myForm.controls.recordName.value);
    this.myForm.controls.dateIssued.dirty &&
      (restorativeJustice['dateIssued'] = this.utils.convertFormGroupNGBDateToJSDate(
        this.myForm.get('dateIssued').value
      ));
    this.myForm.controls.issuingAgency.dirty &&
      (restorativeJustice['issuingAgency'] = this.myForm.controls.issuingAgency.value);
    this.myForm.controls.author.dirty && (restorativeJustice['author'] = this.myForm.controls.author.value);

    if (
      this.myForm.controls.act.dirty ||
      this.myForm.controls.regulation.dirty ||
      this.myForm.controls.section.dirty ||
      this.myForm.controls.subSection.dirty ||
      this.myForm.controls.paragraph.dirty
    ) {
      restorativeJustice['legislation'] = {
        act: this.myForm.controls.act.value,
        regulation: this.myForm.controls.regulation.value,
        section: this.myForm.controls.section.value,
        subSection: this.myForm.controls.subSection.value,
        paragraph: this.myForm.controls.paragraph.value
      };
    }

    this.myForm.controls.offence.dirty && (restorativeJustice['offence'] = this.myForm.controls.offence.value);
    this.myForm.controls.issuedTo.dirty && (restorativeJustice['issuedTo'] = this.myForm.controls.issuedTo.value);

    // Project name logic
    // If LNG Canada or Coastal Gaslink are selected we need to put it their corresponding OIDs
    this.myForm.controls.projectName.dirty &&
      (restorativeJustice['projectName'] = this.myForm.controls.projectName.value);
    if (restorativeJustice['projectName'] === 'LNG Canada') {
      restorativeJustice['_epicProjectId'] = EpicProjectIds.lngCanadaId;
    } else if (restorativeJustice['projectName'] === 'Coastal Gaslink') {
      restorativeJustice['_epicProjectId'] = EpicProjectIds.coastalGaslinkId;
    }

    this.myForm.controls.location.dirty && (restorativeJustice['location'] = this.myForm.controls.location.value);
    (this.myForm.controls.latitude.dirty || this.myForm.controls.longitude.dirty) &&
      (restorativeJustice['centroid'] = [this.myForm.controls.latitude.value, this.myForm.controls.longitude.value]);
    this.myForm.controls.outcomeStatus.dirty &&
      (restorativeJustice['outcomeStatus'] = this.myForm.controls.outcomeStatus.value);
    this.myForm.controls.outcomeDescription.dirty &&
      (restorativeJustice['outcomeDescription'] = this.myForm.controls.outcomeDescription.value);
    this.myForm.controls.penalty.dirty && (restorativeJustice['penalty'] = this.myForm.controls.penalty.value);

    // NRCED flavour
    if (this.myForm.controls.nrcedSummary.dirty || this.myForm.controls.publishNrced.dirty) {
      restorativeJustice['RestorativeJusticeNRCED'] = {};
    }
    this.myForm.controls.nrcedSummary.dirty &&
      (restorativeJustice['RestorativeJusticeNRCED']['summary'] = this.myForm.controls.nrcedSummary.value);
    if (this.myForm.controls.publishNrced.dirty && this.myForm.controls.publishNrced.value) {
      restorativeJustice['RestorativeJusticeNRCED']['addRole'] = 'public';
    } else if (this.myForm.controls.publishNrced.dirty && !this.myForm.controls.publishNrced.value) {
      restorativeJustice['RestorativeJusticeNRCED']['removeRole'] = 'public';
    }

    // LNG flavour
    if (this.myForm.controls.lngDescription.dirty || this.myForm.controls.publishLng.dirty) {
      restorativeJustice['RestorativeJusticeLNG'] = {};
    }
    this.myForm.controls.lngDescription.dirty &&
      (restorativeJustice['RestorativeJusticeLNG']['description'] = this.myForm.controls.lngDescription.value);
    if (this.myForm.controls.publishLng.dirty && this.myForm.controls.publishLng.value) {
      restorativeJustice['RestorativeJusticeLNG']['addRole'] = 'public';
    } else if (this.myForm.controls.publishLng.dirty && !this.myForm.controls.publishLng.value) {
      restorativeJustice['RestorativeJusticeLNG']['removeRole'] = 'public';
    }

    if (!this.isEditing) {
      this.factoryService.createRestorativeJustice(restorativeJustice).subscribe(async res => {
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
      restorativeJustice['_id'] = this.currentRecord._id;

      this.nrcedFlavour &&
        restorativeJustice['RestorativeJusticeNRCED'] &&
        (restorativeJustice['RestorativeJusticeNRCED']['_id'] = this.nrcedFlavour._id);
      this.lngFlavour &&
        restorativeJustice['RestorativeJusticeLNG'] &&
        (restorativeJustice['RestorativeJusticeLNG']['_id'] = this.lngFlavour._id);

      this.factoryService.editRestorativeJustice(restorativeJustice).subscribe(async res => {
        this.recordUtils.parseResForErrors(res);
        const docResponse = await this.recordUtils.handleDocumentChanges(
          this.links,
          this.documents,
          this.documentsToDelete,
          this.currentRecord._id,
          this.factoryService
        );

        console.log(docResponse);
        this.router.navigate(['records', 'restorative-justices', this.currentRecord._id, 'detail']);
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
        this.router.navigate(['records', 'restorative-justices', this.currentRecord._id, 'detail']);
      }
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
