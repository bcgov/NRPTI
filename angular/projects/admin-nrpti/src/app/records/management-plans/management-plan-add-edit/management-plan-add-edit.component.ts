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
  selector: 'app-management-plan-add-edit',
  templateUrl: './management-plan-add-edit.component.html',
  styleUrls: ['./management-plan-add-edit.component.scss']
})
export class ManagementPlanAddEditComponent implements OnInit, OnDestroy {
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
      this.isEditing = res.breadcrumb !== 'Add Management Plan';
      if (this.isEditing) {
        if (res && res.record && res.record[0] && res.record[0].data) {
          this.currentRecord = res.record[0].data;
          this.populateTextFields();
        } else {
          alert('Error: could not load edit management plan.');
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
        case 'ManagementPlanLNG':
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
      agency: new FormControl((this.currentRecord && this.currentRecord.agency) || ''),
      author: new FormControl((this.currentRecord && this.currentRecord.author) || ''),
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

      // LNG
      lngRelatedPhase: new FormControl((this.currentRecord && this.lngFlavour && this.lngFlavour.relatedPhase) || ''),
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
    this.router.navigate(['records', 'management-plans', this.currentRecord._id, 'detail']);
  }

  togglePublish(event, flavour) {
    switch (flavour) {
      case 'lng':
        this.myForm.controls.publishLng.setValue(event);
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
    // projectName
    // documentURL

    const managementPlan = {};
    this.myForm.controls.recordName.dirty && (managementPlan['recordName'] = this.myForm.controls.recordName.value);
    this.myForm.controls.dateIssued.dirty &&
      (managementPlan['dateIssued'] = this.utils.convertFormGroupNGBDateToJSDate(this.myForm.get('dateIssued').value));
    this.myForm.controls.agency.dirty && (managementPlan['agency'] = this.myForm.controls.agency.value);
    this.myForm.controls.author.dirty && (managementPlan['author'] = this.myForm.controls.author.value);
    this.myForm.controls.issuedTo.dirty && (managementPlan['issuedTo'] = this.myForm.controls.issuedTo.value);

    // Project name logic
    // If LNG Canada or Coastal Gaslink are selected we need to put it their corresponding OIDs
    this.myForm.controls.projectName.dirty && (managementPlan['projectName'] = this.myForm.controls.projectName.value);
    if (managementPlan['projectName'] === 'LNG Canada') {
      managementPlan['_epicProjectId'] = EpicProjectIds.lngCanadaId;
    } else if (managementPlan['projectName'] === 'Coastal Gaslink') {
      managementPlan['_epicProjectId'] = EpicProjectIds.coastalGaslinkId;
    }

    this.myForm.controls.location.dirty && (managementPlan['location'] = this.myForm.controls.location.value);
    (this.myForm.controls.latitude.dirty || this.myForm.controls.longitude.dirty) &&
      (managementPlan['centroid'] = [this.myForm.controls.latitude.value, this.myForm.controls.longitude.value]);
    this.myForm.controls.outcomeStatus.dirty &&
      (managementPlan['outcomeStatus'] = this.myForm.controls.outcomeStatus.value);
    this.myForm.controls.outcomeDescription.dirty &&
      (managementPlan['outcomeDescription'] = this.myForm.controls.outcomeDescription.value);

    // LNG flavour
    if (this.myForm.controls.lngDescription.dirty ||
      this.myForm.controls.lngRelatedPhase.dirty
      || this.myForm.controls.publishLng.dirty
    ) {
      managementPlan['ManagementPlanLNG'] = {};
    }
    this.myForm.controls.lngDescription.dirty &&
      (managementPlan['ManagementPlanLNG']['description'] = this.myForm.controls.lngDescription.value);
    this.myForm.controls.lngRelatedPhase.dirty &&
      (managementPlan['ManagementPlanLNG']['relatedPhase'] = this.myForm.controls.lngRelatedPhase.value);
    if (this.myForm.controls.publishLng.dirty && this.myForm.controls.publishLng.value) {
      managementPlan['ManagementPlanLNG']['addRole'] = 'public';
    } else if (this.myForm.controls.publishLng.dirty && !this.myForm.controls.publishLng.value) {
      managementPlan['ManagementPlanLNG']['removeRole'] = 'public';
    }

    if (!this.isEditing) {
      this.factoryService.createManagementPlan(managementPlan).subscribe(async res => {
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
      managementPlan['_id'] = this.currentRecord._id;

      this.lngFlavour && managementPlan['ManagementPlanLNG'] &&
        (managementPlan['ManagementPlanLNG']['_id'] = this.lngFlavour._id);

      this.factoryService.editManagementPlan(managementPlan).subscribe(async res => {
        this.recordUtils.parseResForErrors(res);
        const docResponse = await this.recordUtils.handleDocumentChanges(
          this.links,
          this.documents,
          this.documentsToDelete,
          this.currentRecord._id,
          this.factoryService
        );

        console.log(docResponse);
        this.router.navigate(['records', 'management-plans', this.currentRecord._id, 'detail']);
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
        this.router.navigate(['records', 'management-plans', this.currentRecord._id, 'detail']);
      }
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
