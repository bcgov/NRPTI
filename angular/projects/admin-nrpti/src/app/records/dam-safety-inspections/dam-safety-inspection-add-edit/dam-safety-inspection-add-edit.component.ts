import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { FormGroup, FormControl, FormArray } from '@angular/forms';
import { Picklists, EpicProjectIds } from '../../../../../../common/src/app/utils/record-constants';
import { FactoryService } from '../../../services/factory.service';
import { Utils } from 'nrpti-angular-components';
import { Utils as CommonUtils } from '../../../../../../common/src/app/utils/utils';
import { RecordUtils } from '../../utils/record-utils';
import { LoadingScreenService, StoreService } from 'nrpti-angular-components';
import { Constants } from '../../../utils/constants/misc';
import { AgencyDataService } from '../../../../../../../projects/global/src/lib/utils/agency-data-service';
import { ActDataServiceNRPTI } from '../../../../../../global/src/lib/utils/act-data-service-nrpti';

@Component({
  selector: 'app-dam-safety-inspection-add-edit',
  templateUrl: './dam-safety-inspection-add-edit.component.html',
  styleUrls: ['./dam-safety-inspection-add-edit.component.scss']
})
export class DamSafetyInspectionAddEditComponent implements OnInit, OnDestroy {
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
  public agencies = Picklists.getAgencyCodes(this.factoryService);

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
    private loadingScreenService: LoadingScreenService,
    private utils: Utils,
    private _changeDetectionRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.route.data.pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: any) => {
      this.isEditing = res.breadcrumb !== 'Add Dam Safety Inspection';
      if (this.isEditing) {
        if (res && res.record && res.record[0] && res.record[0].data) {
          this.currentRecord = res.record[0].data;
          this.populateTextFields();
        } else {
          alert('Error: could not load edit dam safety inspection.');
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
        case 'DamSafetyInspectionNRCED':
          this.nrcedFlavour = flavour;
          this.nrcedFlavour.read.includes('public') &&
            (this.nrcedPublishSubtext = `Published on ${this.utils.convertJSDateToString(
              new Date(this.nrcedFlavour.datePublished)
            )}`);
          break;
        case 'DamSafetyInspectionBCMI':
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

  private buildForm() {
    this.myForm = new FormGroup({
      // Master
      recordName: new FormControl({
        value: (this.currentRecord && this.currentRecord.recordName) || '',
        disabled:
          this.currentRecord &&
          this.currentRecord.sourceSystemRef !== 'nrpti' &&
          (!this.factoryService.userInNrcedRole() || !this.factoryService.userInBcmiRole())
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
      issuedTo: new FormGroup({
        type: new FormControl({
          value: (this.currentRecord && this.currentRecord.issuedTo && this.currentRecord.issuedTo.type) || '',
          disabled: this.currentRecord && this.currentRecord.sourceSystemRef !== 'nrpti'
        }),
        companyName: new FormControl({
          value: (this.currentRecord && this.currentRecord.issuedTo && this.currentRecord.issuedTo.companyName) || '',
          disabled: this.currentRecord && this.currentRecord.sourceSystemRef !== 'nrpti'
        }),
        firstName: new FormControl({
          value: (this.currentRecord && this.currentRecord.issuedTo && this.currentRecord.issuedTo.firstName) || '',
          disabled: this.currentRecord && this.currentRecord.sourceSystemRef !== 'nrpti'
        }),
        middleName: new FormControl({
          value: (this.currentRecord && this.currentRecord.issuedTo && this.currentRecord.issuedTo.middleName) || '',
          disabled: this.currentRecord && this.currentRecord.sourceSystemRef !== 'nrpti'
        }),
        lastName: new FormControl({
          value: (this.currentRecord && this.currentRecord.issuedTo && this.currentRecord.issuedTo.lastName) || '',
          disabled: this.currentRecord && this.currentRecord.sourceSystemRef !== 'nrpti'
        }),
        fullName: new FormControl({
          value: (this.currentRecord && this.currentRecord.issuedTo && this.currentRecord.issuedTo.fullName) || '',
          disabled: this.currentRecord && this.currentRecord.sourceSystemRef !== 'nrpti'
        }),
        dateOfBirth: new FormControl({
          value:
            (this.currentRecord &&
              this.currentRecord.issuedTo &&
              this.currentRecord.issuedTo.dateOfBirth &&
              this.utils.convertJSDateToNGBDate(new Date(this.currentRecord.issuedTo.dateOfBirth))) ||
            '',
          disabled: this.currentRecord && this.currentRecord.sourceSystemRef !== 'nrpti'
        }),
        anonymous: new FormControl({
          value: (this.currentRecord && this.currentRecord.issuedTo && this.currentRecord.issuedTo.anonymous) || '',
          disabled: this.currentRecord && this.currentRecord.sourceSystemRef !== 'nrpti'
        })
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

      legislations: new FormArray(this.getLegislationsFormGroups()),

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

  /**
   * Builds an array of legislations FormGroups, each with its own set of FormControls.
   *
   * @returns {FormGroup[]} array of legislations FormGroup elements
   * @memberof DamSafetyInspectionAddEditComponent
   */
  getLegislationsFormGroups(): FormGroup[] {
    if (!this.currentRecord || !this.currentRecord.legislation || !this.currentRecord.legislation.length) {
      return [];
    }

    const legislations: FormGroup[] = [];

    this.currentRecord.legislation.forEach(leg => {
      legislations.push(
        new FormGroup({
          act: new FormControl({
            value: leg.act || '',
            disabled: this.currentRecord && this.currentRecord.sourceSystemRef !== 'nrpti'
          }),
          regulation: new FormControl({
            value: leg.regulation || '',
            disabled: this.currentRecord && this.currentRecord.sourceSystemRef !== 'nrpti'
          }),
          section: new FormControl({
            value: leg.section || '',
            disabled: this.currentRecord && this.currentRecord.sourceSystemRef !== 'nrpti'
          }),
          subSection: new FormControl({
            value: leg.subSection || '',
            disabled: this.currentRecord && this.currentRecord.sourceSystemRef !== 'nrpti'
          }),
          paragraph: new FormControl({
            value: leg.paragraph || '',
            disabled: this.currentRecord && this.currentRecord.sourceSystemRef !== 'nrpti'
          }),
          legislationDescription: new FormControl({
            value: leg.legislationDescription || '',
            disabled: this.currentRecord && this.currentRecord.sourceSystemRef !== 'nrpti'
          })
        })
      );
    });
    return legislations;
  }

  /**
   * Parses an array of legislations FormGroups into objects expected by the API.
   *
   * @returns {object[]} array of legislations objects
   * @memberof DamSafetyInspectionAddEditComponent
   */
  parseLegislationsFormGroups(): object[] {
    const legislationsFormArray = this.myForm.get('legislations');

    if (!legislationsFormArray || !legislationsFormArray.value || !legislationsFormArray.value.length) {
      return [];
    }

    const legislations: object[] = [];

    legislationsFormArray.value.forEach(legislationsFormGroup => {
      legislations.push({
        act: legislationsFormGroup.act,
        regulation: legislationsFormGroup.regulation,
        section: legislationsFormGroup.section,
        subSection: legislationsFormGroup.subSection,
        paragraph: legislationsFormGroup.paragraph,
        legislationDescription: legislationsFormGroup.legislationDescription
      });
    });

    return legislations;
  }

  navigateToDetails() {
    this.router.navigate(['records', 'dam-safety-inspections', this.currentRecord._id, 'detail']);
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

    const damSafetyInspection = {};
    this.myForm.controls.recordName.dirty &&
      (damSafetyInspection['recordName'] = this.myForm.controls.recordName.value);
    this.myForm.controls.dateIssued.dirty &&
      (damSafetyInspection['dateIssued'] = this.utils.convertFormGroupNGBDateToJSDate(
        this.myForm.get('dateIssued').value
      ));
    this.myForm.controls.issuingAgency.dirty &&
      (damSafetyInspection['issuingAgency'] = this.myForm.controls.issuingAgency.value);

    if (
      this.myForm.get('issuedTo.type').dirty ||
      this.myForm.get('issuedTo.companyName').dirty ||
      this.myForm.get('issuedTo.firstName').dirty ||
      this.myForm.get('issuedTo.middleName').dirty ||
      this.myForm.get('issuedTo.lastName').dirty ||
      this.myForm.get('issuedTo.fullName').dirty ||
      this.myForm.get('issuedTo.dateOfBirth').dirty
    ) {
      damSafetyInspection['issuedTo'] = {
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
      damSafetyInspection['projectName'] = this.myForm.controls.projectName.value;
      if (damSafetyInspection['projectName'] === 'LNG Canada') {
        damSafetyInspection['_epicProjectId'] = EpicProjectIds.lngCanadaId;
      } else if (damSafetyInspection['projectName'] === 'Coastal Gaslink') {
        damSafetyInspection['_epicProjectId'] = EpicProjectIds.coastalGaslinkId;
      } else {
        damSafetyInspection['_epicProjectId'] = null;
      }
    }

    this.myForm.controls.location.dirty && (damSafetyInspection['location'] = this.myForm.controls.location.value);
    damSafetyInspection['centroid'] = [];
    if (this.myForm.controls.latitude.value && this.myForm.controls.longitude.value) {
      damSafetyInspection['centroid'] = [this.myForm.controls.longitude.value, this.myForm.controls.latitude.value];
    }

    // tslint:disable-next-line:max-line-length
    this.myForm.get('legislations').dirty && (damSafetyInspection['legislation'] = this.parseLegislationsFormGroups());
    // swapping legislation with actCode
    const actTitle = damSafetyInspection['legislation'][0]['act'];
    const dataservice = new ActDataServiceNRPTI(this.factoryService);
    const actCode = dataservice.getCodeFromTitle(actTitle);
    damSafetyInspection['legislation'][0]['act'] = actCode;
    // nrced flavour
    if (this.myForm.controls.nrcedDescription.dirty || this.myForm.controls.publishNrced.dirty) {
      damSafetyInspection['DamSafetyInspectionNRCED'] = {};
    }
    this.myForm.controls.nrcedDescription.dirty &&
      (damSafetyInspection['DamSafetyInspectionNRCED']['description'] = this.myForm.controls.nrcedDescription.value);
    if (this.myForm.controls.publishNrced.dirty && this.myForm.controls.publishNrced.value) {
      damSafetyInspection['DamSafetyInspectionNRCED']['addRole'] = 'public';
    } else if (this.myForm.controls.publishNrced.dirty && !this.myForm.controls.publishNrced.value) {
      damSafetyInspection['DamSafetyInspectionNRCED']['removeRole'] = 'public';
    }

    // BCMI flavour
    if (this.myForm.controls.bcmiDescription.dirty || this.myForm.controls.publishBcmi.dirty) {
      damSafetyInspection['DamSafetyInspectionBCMI'] = {};
    }
    this.myForm.controls.bcmiDescription.dirty &&
      (damSafetyInspection['DamSafetyInspectionBCMI']['description'] = this.myForm.controls.bcmiDescription.value);
    if (this.myForm.controls.publishBcmi.dirty && this.myForm.controls.publishBcmi.value) {
      damSafetyInspection['DamSafetyInspectionBCMI']['addRole'] = 'public';
    } else if (this.myForm.controls.publishBcmi.dirty && !this.myForm.controls.publishBcmi.value) {
      damSafetyInspection['DamSafetyInspectionBCMI']['removeRole'] = 'public';
    }

    if (this.myForm.get('association._epicProjectId').dirty) {
      damSafetyInspection['_epicProjectId'] = this.myForm.get('association._epicProjectId').value;
    }

    if (this.myForm.get('association.mineGuid').dirty) {
      damSafetyInspection['mineGuid'] = this.myForm.get('association.mineGuid').value;
    }

    // Set the friendly name of projectName
    const epicProjectList = this.storeService.getItem('epicProjects');
    const filterResult = epicProjectList.filter(item => {
      return item._id === damSafetyInspection['_epicProjectId'];
    });
    if (filterResult && filterResult[0] && filterResult[0].name) {
      damSafetyInspection['projectName'] = filterResult[0].name;
    }

    if (!this.isEditing) {
      const res = await this.factoryService.writeRecord(damSafetyInspection, 'damSafetyInspections', true);
      this.recordUtils.parseResForErrors(res);
      let _id = null;
      if (Array.isArray(res[0][0].object)) {
        _id = res[0][0].object.find(r => r._schemaName === 'DamSafetyInspection')._id;
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
      damSafetyInspection['_id'] = this.currentRecord._id;

      if (this.nrcedFlavour) {
        if (!CommonUtils.isObject(damSafetyInspection['DamSafetyInspectionNRCED'])) {
          damSafetyInspection['DamSafetyInspectionNRCED'] = {};
        }

        // always update if flavour exists, regardless of flavour field changes, as fields in master might have changed
        damSafetyInspection['DamSafetyInspectionNRCED']['_id'] = this.nrcedFlavour._id;
      }

      if (this.bcmiFlavour) {
        if (!CommonUtils.isObject(damSafetyInspection['DamSafetyInspectionBCMI'])) {
          damSafetyInspection['DamSafetyInspectionBCMI'] = {};
        }

        // always update if flavour exists, regardless of flavour field changes, as fields in master might have changed
        damSafetyInspection['DamSafetyInspectionBCMI']['_id'] = this.bcmiFlavour._id;
      }

      const res = await this.factoryService.writeRecord(damSafetyInspection, 'damSafetyInspections', false);
      this.recordUtils.parseResForErrors(res);
      await this.recordUtils.handleDocumentChanges(
        this.links,
        this.documents,
        this.documentsToDelete,
        this.currentRecord._id,
        this.factoryService
      );

      this.loadingScreenService.setLoadingState(false, 'main');
      this.router.navigate(['records', 'dam-safety-inspections', this.currentRecord._id, 'detail']);
    }
  }

  convertAcronyms(acronym) {
    return Utils.convertAcronyms(acronym);
  }

  cancel() {
    const shouldCancel = confirm(
      'Leaving this page will discard unsaved changes. Are you sure you would like to continue?'
    );
    if (shouldCancel) {
      if (!this.isEditing) {
        this.router.navigate(['records']);
      } else {
        this.router.navigate(['records', 'dam-safety-inspections', this.currentRecord._id, 'detail']);
      }
    }
  }

  displayName(agency) {
    const agencyDataService = new AgencyDataService(this.factoryService);
    return agencyDataService.displayNameFull(agency);
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
