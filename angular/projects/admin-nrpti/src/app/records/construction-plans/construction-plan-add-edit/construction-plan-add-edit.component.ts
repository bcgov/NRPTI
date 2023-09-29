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
import { LoadingScreenService, StoreService, LoggerService } from 'nrpti-angular-components';
import { Constants } from '../../../utils/constants/misc';
import { AgencyDataService } from '../../../../../../../projects/global/src/lib/utils/agency-data-service';

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
  public agencies = Picklists.agencyCodePicklist;

  // Documents
  public documents = [];
  public links = [];
  public documentsToDelete = [];

  public datepickerMinDate = Constants.DatepickerMinDate;
  public datepickerMaxDate = Constants.DatepickerMaxDate;

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    private recordUtils: RecordUtils,
    private storeService: StoreService,
    private factoryService: FactoryService,
    private logger: LoggerService,
    private loadingScreenService: LoadingScreenService,
    private utils: Utils,
    private _changeDetectionRef: ChangeDetectorRef
  ) { }

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
      } else {
        this.currentRecord = {
          sourceSystemRef: 'nrpti',
          documents: []
        };
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
        disabled:
          this.currentRecord && this.currentRecord.sourceSystemRef !== 'nrpti' && !this.factoryService.userInLngRole()
      }),
      dateIssued: new FormControl({
        value:
          (this.currentRecord &&
            this.currentRecord.dateIssued &&
            this.utils.convertJSDateToNGBDate(new Date(this.currentRecord.dateIssued))) ||
          '',
        disabled: this.currentRecord && this.currentRecord.sourceSystemRef !== 'nrpti'
      }),
      issuingAgency: new FormControl({
        value: (this.currentRecord && this.currentRecord.issuingAgency) || '',
        disabled: this.currentRecord && this.currentRecord.sourceSystemRef !== 'nrpti'
      }),
      author: new FormControl({
        value: (this.currentRecord && this.currentRecord.author) || '',
        disabled: this.currentRecord && this.currentRecord.sourceSystemRef !== 'nrpti'
      }),
      projectName: new FormControl({
        value: (this.currentRecord && this.currentRecord.projectName) || '',
        disabled: this.currentRecord && this.currentRecord.sourceSystemRef !== 'nrpti'
      }),
      location: new FormControl({
        value: (this.currentRecord && this.currentRecord.location) || '',
        disabled: this.currentRecord && this.currentRecord.sourceSystemRef !== 'nrpti'
      }),
      latitude: new FormControl({
        value: (this.currentRecord && this.currentRecord.centroid && this.currentRecord.centroid[1]) || '',
        disabled: this.currentRecord && this.currentRecord.sourceSystemRef !== 'nrpti'
      }),
      longitude: new FormControl({
        value: (this.currentRecord && this.currentRecord.centroid && this.currentRecord.centroid[0]) || '',
        disabled: this.currentRecord && this.currentRecord.sourceSystemRef !== 'nrpti'
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
      }),

      association: new FormGroup({
        _epicProjectId: new FormControl({
          value: (this.currentRecord && this.currentRecord._epicProjectId) || null,
          disabled: this.currentRecord && this.currentRecord.sourceSystemRef !== 'nrpti'
        }),
        mineGuid: new FormControl({
          value: (this.currentRecord && this.currentRecord.mineGuid) || null,
          disabled: this.currentRecord && this.currentRecord.sourceSystemRef !== 'nrpti'
        })
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
    this.myForm.controls.issuingAgency.dirty &&
      (constructionPlan['issuingAgency'] = this.myForm.controls.issuingAgency.value);
    this.myForm.controls.author.dirty && (constructionPlan['author'] = this.myForm.controls.author.value);

    // Project name logic
    // If LNG Canada or Coastal Gaslink are selected we need to put it their corresponding OIDs
    if (this.myForm.controls.projectName.dirty) {
      constructionPlan['projectName'] = this.myForm.controls.projectName.value;
      if (constructionPlan['projectName'] === 'LNG Canada') {
        constructionPlan['_epicProjectId'] = EpicProjectIds.lngCanadaId;
      } else if (constructionPlan['projectName'] === 'Coastal Gaslink') {
        constructionPlan['_epicProjectId'] = EpicProjectIds.coastalGaslinkId;
      } else {
        constructionPlan['_epicProjectId'] = null;
      }
    }

    this.myForm.controls.location.dirty && (constructionPlan['location'] = this.myForm.controls.location.value);
    constructionPlan['centroid'] = [];
    if (this.myForm.controls.latitude.value && this.myForm.controls.longitude.value) {
      (constructionPlan['centroid'] = [this.myForm.controls.longitude.value, this.myForm.controls.latitude.value]);
    }

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

    if (this.myForm.get('association._epicProjectId').dirty) {
      constructionPlan['_epicProjectId'] = this.myForm.get('association._epicProjectId').value;
    }

    if (this.myForm.get('association.mineGuid').dirty) {
      constructionPlan['mineGuid'] = this.myForm.get('association.mineGuid').value;
    }

    // Set the friendly name of projectName
    const epicProjectList = this.storeService.getItem('epicProjects');
    const filterResult = epicProjectList.filter(item => {
      return item._id === constructionPlan['_epicProjectId'];
    });
    if (filterResult && filterResult[0] && filterResult[0].name) {
      constructionPlan['projectName'] = filterResult[0].name;
    }

    if (!this.isEditing) {
      const res = await this.factoryService.writeRecord(constructionPlan, 'constructionPlans', true);
      this.recordUtils.parseResForErrors(res);
      let _id = null;
      if (Array.isArray(res[0][0].object)) {
        _id = res[0][0].object.find(r => r._schemaName === 'ConstructionPlan')._id;
      } else {
        _id = res[0][0].object._id;
      }

      const docResponse = await this.recordUtils.handleDocumentChanges(
        this.links,
        this.documents,
        this.documentsToDelete,
        _id,
        this.factoryService
      );

      this.logger.log(docResponse);
      this.loadingScreenService.setLoadingState(false, 'main');
      this.router.navigate(['records']);
    } else {
      constructionPlan['_id'] = this.currentRecord._id;

      if (this.lngFlavour) {
        if (!CommonUtils.isObject(constructionPlan['ConstructionPlanLNG'])) {
          constructionPlan['ConstructionPlanLNG'] = {};
        }

        // always update if flavour exists, regardless of flavour field changes, as fields in master might have changed
        constructionPlan['ConstructionPlanLNG']['_id'] = this.lngFlavour._id;
      }

      const res = await this.factoryService.writeRecord(constructionPlan, 'constructionPlans', false);
      this.recordUtils.parseResForErrors(res);
      const docResponse = await this.recordUtils.handleDocumentChanges(
        this.links,
        this.documents,
        this.documentsToDelete,
        this.currentRecord._id,
        this.factoryService
      );

      this.logger.log(docResponse);
      this.loadingScreenService.setLoadingState(false, 'main');
      this.router.navigate(['records', 'construction-plans', this.currentRecord._id, 'detail']);
    }
  }

  convertAcronyms(acronym) {
    return Utils.convertAcronyms(acronym);
  }

  displayName(agency) {
    const agencyDataService = new AgencyDataService(this.factoryService);
    return agencyDataService.displayNameFull(agency);
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
