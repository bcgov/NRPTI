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
import { LoadingScreenService, StoreService } from 'nrpti-angular-components';
import { Constants } from '../../../utils/constants/misc';

@Component({
  selector: 'app-permit-add-edit',
  templateUrl: './permit-add-edit.component.html',
  styleUrls: ['./permit-add-edit.component.scss']
})
export class PermitAddEditComponent implements OnInit, OnDestroy {
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
  public permitSubtypes = Picklists.permitSubtypePicklist;
  public agencies = Picklists.agencyPicklist;
  private defaultAgency = '';

  // Documents
  public documents = [];
  public links = [];
  public documentsToDelete = [];
  public disableEdit = false;

  public datepickerMinDate = Constants.DatepickerMinDate;
  public datepickerMaxDate = Constants.DatepickerMaxDate;

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    private recordUtils: RecordUtils,
    private factoryService: FactoryService,
    private storeService: StoreService,
    private loadingScreenService: LoadingScreenService,
    private utils: Utils,
    private _changeDetectionRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.route.data.pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: any) => {
      this.isEditing = res.breadcrumb !== 'Add Permit';
      if (this.isEditing) {
        if (res && res.record && res.record[0] && res.record[0].data) {
          this.currentRecord = res.record[0].data;
          this.populateTextFields();
          this.disableMasterEdit();
        } else {
          alert('Error: could not load edit permit.');
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
        case 'PermitLNG':
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

  private disableMasterEdit() {
    if (this.currentRecord.sourceSystemRef === 'core') {
      this.disableEdit = true;
    }
  }

  private updateLegislationDescription() {
    const legislation = new Legislation({
      act: this.myForm.get('legislation.act').value,
      regulation: this.myForm.get('legislation.regulation').value,
      section: this.myForm.get('legislation.section').value,
      subSection: this.myForm.get('legislation.subSection').value,
      paragraph: this.myForm.get('legislation.paragraph').value
    });

    this.myForm.get('legislationDescription').setValue(Picklists.getLegislationDescription('Permit', legislation));
    this.myForm.get('legislationDescription').markAsDirty();
  }

  private buildForm() {
    const flavourEditRequiredRoles = Constants.FlavourEditRequiredRoles.WARNING;

    for (const role of Constants.ApplicationLimitedRoles) {
      if (this.factoryService.userOnlyInLimitedRole(role)) {
        this.agencies = Constants.RoleAgencyPickList[role];
        this.defaultAgency = this.agencies[0];
      }
    }

    this.myForm = new FormGroup({
      // Master
      recordName: new FormControl({
        value: (this.currentRecord && this.currentRecord.recordName) || '',
        disabled: (this.currentRecord && this.currentRecord.sourceSystemRef !== 'nrpti') &&
          !this.factoryService.userInLngRole() && this.disableEdit
      }),
      recordSubtype: new FormControl({
        value: (this.currentRecord && this.currentRecord.recordSubtype) || '',
        disabled: (this.currentRecord && this.currentRecord.sourceSystemRef !== 'nrpti')
      }),
      dateIssued: new FormControl({
        value: (this.currentRecord &&
          this.currentRecord.dateIssued &&
          this.utils.convertJSDateToNGBDate(new Date(this.currentRecord.dateIssued))) ||
          '',
        disabled: (this.currentRecord && this.currentRecord.sourceSystemRef !== 'nrpti')
      }),
      issuingAgency: new FormControl({
        value: (this.currentRecord && this.currentRecord.issuingAgency) || this.defaultAgency,
        disabled: (this.currentRecord && this.currentRecord.sourceSystemRef !== 'nrpti')
      }),
      legislation: new FormGroup({
        act: new FormControl({
          value: (this.currentRecord && this.currentRecord.legislation && this.currentRecord.legislation.act) || '',
          disabled: (this.currentRecord && this.currentRecord.sourceSystemRef !== 'nrpti')
        }),
        regulation: new FormControl({
          value: (this.currentRecord && this.currentRecord.legislation && this.currentRecord.legislation.regulation) || '',
          disabled: (this.currentRecord && this.currentRecord.sourceSystemRef !== 'nrpti')
        }),
        section: new FormControl({
          value: (this.currentRecord && this.currentRecord.legislation && this.currentRecord.legislation.section) || '',
          disabled: (this.currentRecord && this.currentRecord.sourceSystemRef !== 'nrpti')
        }),
        subSection: new FormControl({
          value: (this.currentRecord && this.currentRecord.legislation && this.currentRecord.legislation.subSection) || '',
          disabled: (this.currentRecord && this.currentRecord.sourceSystemRef !== 'nrpti')
        }),
        paragraph: new FormControl({
          value: (this.currentRecord && this.currentRecord.legislation && this.currentRecord.legislation.paragraph) || '',
          disabled: (this.currentRecord && this.currentRecord.sourceSystemRef !== 'nrpti')
        })
      }),
      legislationDescription: new FormControl({
        value: (this.currentRecord && this.currentRecord.legislationDescription) || '',
        disabled: (this.currentRecord && this.currentRecord.sourceSystemRef !== 'nrpti')
      }),
      projectName: new FormControl({
        value: (this.currentRecord && this.currentRecord.projectName) || '',
        disabled: (this.currentRecord && this.currentRecord.sourceSystemRef !== 'nrpti')
      }),
      location: new FormControl({
        value: (this.currentRecord && this.currentRecord.location) || '',
        disabled: (this.currentRecord && this.currentRecord.sourceSystemRef !== 'nrpti')
      }),
      latitude: new FormControl({
        value: (this.currentRecord && this.currentRecord.centroid && this.currentRecord.centroid[1]) || '',
        disabled: (this.currentRecord && this.currentRecord.sourceSystemRef !== 'nrpti')
      }),
      longitude: new FormControl({
        value: (this.currentRecord && this.currentRecord.centroid && this.currentRecord.centroid[0]) || '',
        disabled: (this.currentRecord && this.currentRecord.sourceSystemRef !== 'nrpti')
      }),

      // LNG
      lngDescription: new FormControl({
        value: (this.currentRecord && this.lngFlavour && this.lngFlavour.description) || '',
        disabled: !this.factoryService.isFlavourEditEnabled(flavourEditRequiredRoles.LNG)
      }),
      publishLng: new FormControl({
        value: (this.currentRecord && this.lngFlavour && this.lngFlavour.read.includes('public')) || false,
        disabled: !this.factoryService.isFlavourEditEnabled(flavourEditRequiredRoles.LNG)
      }),

      association: new FormGroup({
        _epicProjectId: new FormControl({
          value: this.currentRecord && this.currentRecord._epicProjectId || null,
          disabled: this.currentRecord && this.currentRecord.sourceSystemRef !== 'nrpti'
        }),
        mineGuid: new FormControl({
          value: this.currentRecord && this.currentRecord.mineGuid || null,
          disabled: this.currentRecord && this.currentRecord.sourceSystemRef !== 'nrpti'
        })
      }),
    });
  }

  navigateToDetails() {
    this.router.navigate(['records', 'permits', this.currentRecord._id, 'detail']);
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

    const permit = {};
    this.myForm.controls.recordName.dirty && (permit['recordName'] = this.myForm.controls.recordName.value);
    this.myForm.controls.recordSubtype.dirty && (permit['recordSubtype'] = this.myForm.controls.recordSubtype.value);
    this.myForm.controls.dateIssued.dirty &&
      (permit['dateIssued'] = this.utils.convertFormGroupNGBDateToJSDate(this.myForm.get('dateIssued').value));
    (this.myForm.controls.issuingAgency.dirty || this.defaultAgency) &&
      (permit['issuingAgency'] = this.myForm.controls.issuingAgency.value);

    if (
      this.myForm.get('legislation.act').dirty ||
      this.myForm.get('legislation.regulation').dirty ||
      this.myForm.get('legislation.section').dirty ||
      this.myForm.get('legislation.subSection').dirty ||
      this.myForm.get('legislation.paragraph').dirty
    ) {
      permit['legislation'] = {
        act: this.myForm.get('legislation.act').value,
        regulation: this.myForm.get('legislation.regulation').value,
        section: this.myForm.get('legislation.section').value,
        subSection: this.myForm.get('legislation.subSection').value,
        paragraph: this.myForm.get('legislation.paragraph').value
      };
    }
    this.myForm.controls.legislationDescription.dirty &&
      (permit['legislationDescription'] = this.myForm.controls.legislationDescription.value);

    this.myForm.controls.location.dirty && (permit['location'] = this.myForm.controls.location.value);
    (this.myForm.controls.latitude.dirty || this.myForm.controls.longitude.dirty) &&
      (permit['centroid'] = [this.myForm.controls.longitude.value, this.myForm.controls.latitude.value]);

    // LNG flavour
    if (this.myForm.controls.lngDescription.dirty || this.myForm.controls.publishLng.dirty) {
      permit['PermitLNG'] = {};
    }
    this.myForm.controls.lngDescription.dirty &&
      (permit['PermitLNG']['description'] = this.myForm.controls.lngDescription.value);
    if (this.myForm.controls.publishLng.dirty && this.myForm.controls.publishLng.value) {
      permit['PermitLNG']['addRole'] = 'public';
    } else if (this.myForm.controls.publishLng.dirty && !this.myForm.controls.publishLng.value) {
      permit['PermitLNG']['removeRole'] = 'public';
    }

    if (this.myForm.get('association._epicProjectId').dirty) {
      permit['_epicProjectId'] = this.myForm.get('association._epicProjectId').value;
    }

    if (this.myForm.get('association.mineGuid').dirty) {
      permit['mineGuid'] = this.myForm.get('association.mineGuid').value;
    }

    // Set the friendly name of projectName
    const epicProjectList = this.storeService.getItem('epicProjects');
    const filterResult = epicProjectList.filter(item => {
      return item._id === permit['_epicProjectId'];
    });
    if (filterResult && filterResult[0] && filterResult[0].name) {
      permit['projectName'] = filterResult[0].name;
    }

    if (!this.isEditing) {
      const res = await this.factoryService.writeRecord(permit, 'permits', true);
      this.recordUtils.parseResForErrors(res);
      let _id = null;
      if (Array.isArray(res[0][0].object)) {
        _id = res[0][0].object.find(r => r._schemaName === 'Permit')._id;
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
    } else {
      permit['_id'] = this.currentRecord._id;

      if (this.lngFlavour) {
        if (!CommonUtils.isObject(permit['PermitLNG'])) {
          permit['PermitLNG'] = {};
        }

        // always update if flavour exists, regardless of flavour field changes, as fields in master might have changed
        permit['PermitLNG']['_id'] = this.lngFlavour._id;
      }

      const res = await this.factoryService.writeRecord(permit, 'permits', false);
      this.recordUtils.parseResForErrors(res);
      await this.recordUtils.handleDocumentChanges(
        this.links,
        this.documents,
        this.documentsToDelete,
        this.currentRecord._id,
        this.factoryService
      );

      this.loadingScreenService.setLoadingState(false, 'main');
      this.router.navigate(['records', 'permits', this.currentRecord._id, 'detail']);
    }
  }

  convertAcronyms(acronym) {
    return Utils.convertAcronyms(acronym);
  }

  displayName(agency) {
    return Utils.displayNameFull(agency);
  }

  cancel() {
    const shouldCancel = confirm(
      'Leaving this page will discard unsaved changes. Are you sure you would like to continue?'
    );
    if (shouldCancel) {
      if (!this.isEditing) {
        this.router.navigate(['records']);
      } else {
        this.router.navigate(['records', 'permits', this.currentRecord._id, 'detail']);
      }
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
