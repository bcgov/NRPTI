import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { FormGroup, FormControl } from '@angular/forms';
import { Picklists, EpicProjectIds } from '../../../../../../common/src/app/utils/record-constants';
import { FactoryService } from '../../../services/factory.service';
import { Utils } from 'nrpti-angular-components';
import { Utils as CommonUtils } from '../../../../../../common/src/app/utils/utils';
import { RecordUtils } from '../../utils/record-utils';
import { LoadingScreenService } from 'nrpti-angular-components';

@Component({
  selector: 'app-construction-plan-add-edit',
  templateUrl: './construction-plan-add-edit.component.html',
  styleUrls: ['./construction-plan-add-edit.component.scss']
})
export class ConstructionPlanAddEditComponent implements OnInit, OnDestroy {
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
    private loadingScreenService: LoadingScreenService,
    private utils: Utils,
    private _changeDetectionRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.route.data.pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: any) => {
      this.isEditing = res.breadcrumb !== 'Add Construction Plan';
      if (this.isEditing) {
        if (res && res.record && res.record[0] && res.record[0].data) {
          this.currentRecord = res.record[0].data;
          this.populateTextFields();
        } else {
          alert('Error: could not load edit construction plan.');
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
        case 'ConstructionPlanLNG':
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
      recordName: new FormControl({
        value: (this.currentRecord && this.currentRecord.recordName) || '',
        disabled: !this.factoryService.userInLngRole()
      }),
      dateIssued: new FormControl(
        (this.currentRecord &&
          this.currentRecord.dateIssued &&
          this.utils.convertJSDateToNGBDate(new Date(this.currentRecord.dateIssued))) ||
          ''
      ),
      agency: new FormControl((this.currentRecord && this.currentRecord.agency) || ''),
      author: new FormControl((this.currentRecord && this.currentRecord.author) || ''),
      projectName: new FormControl((this.currentRecord && this.currentRecord.projectName) || ''),
      location: new FormControl((this.currentRecord && this.currentRecord.location) || ''),
      latitude: new FormControl(
        (this.currentRecord && this.currentRecord.centroid && this.currentRecord.centroid[1]) || ''
      ),
      longitude: new FormControl(
        (this.currentRecord && this.currentRecord.centroid && this.currentRecord.centroid[0]) || ''
      ),

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
    this.router.navigate(['records', 'construction-plans', this.currentRecord._id, 'detail']);
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
    // projectName

    const constructionPlan = {};
    this.myForm.controls.recordName.dirty && (constructionPlan['recordName'] = this.myForm.controls.recordName.value);
    this.myForm.controls.dateIssued.dirty &&
      (constructionPlan['dateIssued'] = this.utils.convertFormGroupNGBDateToJSDate(
        this.myForm.get('dateIssued').value
      ));
    this.myForm.controls.agency.dirty && (constructionPlan['agency'] = this.myForm.controls.agency.value);
    this.myForm.controls.author.dirty && (constructionPlan['author'] = this.myForm.controls.author.value);

    // Project name logic
    // If LNG Canada or Coastal Gaslink are selected we need to put it their corresponding OIDs
    this.myForm.controls.projectName.dirty &&
      (constructionPlan['projectName'] = this.myForm.controls.projectName.value);
    if (constructionPlan['projectName'] === 'LNG Canada') {
      constructionPlan['_epicProjectId'] = EpicProjectIds.lngCanadaId;
    } else if (constructionPlan['projectName'] === 'Coastal Gaslink') {
      constructionPlan['_epicProjectId'] = EpicProjectIds.coastalGaslinkId;
    } else {
      constructionPlan['_epicProjectId'] = null;
    }

    this.myForm.controls.location.dirty && (constructionPlan['location'] = this.myForm.controls.location.value);
    (this.myForm.controls.latitude.dirty || this.myForm.controls.longitude.dirty) &&
      (constructionPlan['centroid'] = [this.myForm.controls.longitude.value, this.myForm.controls.latitude.value]);

    // LNG flavour
    if (
      this.myForm.controls.lngDescription.dirty ||
      this.myForm.controls.lngRelatedPhase.dirty ||
      this.myForm.controls.publishLng.dirty
    ) {
      constructionPlan['ConstructionPlanLNG'] = {};
    }
    this.myForm.controls.lngDescription.dirty &&
      (constructionPlan['ConstructionPlanLNG']['description'] = this.myForm.controls.lngDescription.value);
    this.myForm.controls.lngRelatedPhase.dirty &&
      (constructionPlan['ConstructionPlanLNG']['relatedPhase'] = this.myForm.controls.lngRelatedPhase.value);
    if (this.myForm.controls.publishLng.dirty && this.myForm.controls.publishLng.value) {
      constructionPlan['ConstructionPlanLNG']['addRole'] = 'public';
    } else if (this.myForm.controls.publishLng.dirty && !this.myForm.controls.publishLng.value) {
      constructionPlan['ConstructionPlanLNG']['removeRole'] = 'public';
    }

    if (!this.isEditing) {
      this.factoryService.createConstructionPlan(constructionPlan).subscribe(async res => {
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
      constructionPlan['_id'] = this.currentRecord._id;

      if (this.lngFlavour) {
        if (!CommonUtils.isObject(constructionPlan['ConstructionPlanLNG'])) {
          constructionPlan['ConstructionPlanLNG'] = {};
        }

        // always update if flavour exists, regardless of flavour field changes, as fields in master might have changed
        constructionPlan['ConstructionPlanLNG']['_id'] = this.lngFlavour._id;
      }

      this.factoryService.editConstructionPlan(constructionPlan).subscribe(async res => {
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
        this.router.navigate(['records', 'construction-plans', this.currentRecord._id, 'detail']);
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
        this.router.navigate(['records', 'construction-plans', this.currentRecord._id, 'detail']);
      }
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
