import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { FormGroup, FormControl, FormArray } from '@angular/forms';
import { Picklists, EpicProjectIds } from '../../../../../../common/src/app/utils/record-constants';
import { FactoryService } from '../../../services/factory.service';
import { Utils, LoadingScreenService, LoggerService, StoreService } from 'nrpti-angular-components';
import { Utils as CommonUtils } from '../../../../../../common/src/app/utils/utils';
import { RecordUtils } from '../../utils/record-utils';
import { Constants } from '../../../utils/constants/misc';
import { AgencyDataService } from '../../../../../../../projects/global/src/lib/utils/agency-data-service';
import { ActDataServiceNRPTI } from '../../../../../../global/src/lib/utils/act-data-service-nrpti';

@Component({
  selector: 'app-court-conviction-add-edit',
  templateUrl: './court-conviction-add-edit.component.html',
  styleUrls: ['./court-conviction-add-edit.component.scss']
})
export class CourtConvictionAddEditComponent implements OnInit, OnDestroy {
  protected ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  public loading = true;
  public isEditing = false;
  public currentRecord = null;
  public myForm: FormGroup;
  public lastEditedSubText = null;

  // Flavour data
  public nrcedFlavour = null;
  public lngFlavour = null;
  public bcmiFlavour = null;
  public lngPublishSubtext = 'Not published';
  public nrcedPublishSubtext = 'Not published';
  public bcmiPublishSubtext = 'Not published';

  // Pick lists
  public agencies = Picklists.getAgencyCodes(this.factoryService);
  public authors = Picklists.authorPicklist;
  public courtConvictionSubtypes = Picklists.courtConvictionSubtypePicklist;
  protected defaultAgency = '';

  // Documents
  public documents = [];
  public links = [];
  public documentsToDelete = [];

  public datepickerMinDate = Constants.DatepickerMinDate;
  public datepickerMaxDate = Constants.DatepickerMaxDate;

  constructor(
    protected route: ActivatedRoute,
    protected router: Router,
    protected recordUtils: RecordUtils,
    protected factoryService: FactoryService,
    protected loadingScreenService: LoadingScreenService,
    protected logger: LoggerService,
    protected utils: Utils,
    protected _changeDetectionRef: ChangeDetectorRef,
    // @ts-ignore used by record-association component
    protected storeService: StoreService
  ) {}

  ngOnInit() {
    this.route.data.pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: any) => {
      this.isEditing = res.breadcrumb !== 'Add Court Conviction';
      if (this.isEditing) {
        if (res && res.record && res.record[0] && res.record[0].data) {
          this.currentRecord = res.record[0].data;
          this.populateTextFields();
        } else {
          alert('Error: could not load edit court conviction.');
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

  protected populateTextFields() {
    if (this.currentRecord.dateUpdated) {
      this.lastEditedSubText = `Last Edited on ${this.utils.convertJSDateToString(
        new Date(this.currentRecord.dateUpdated)
      )}`;
    } else {
      this.lastEditedSubText = `Added on ${this.utils.convertJSDateToString(new Date(this.currentRecord.dateAdded))}`;
    }
    for (const flavour of this.currentRecord.flavours) {
      switch (flavour._schemaName) {
        case 'CourtConvictionLNG':
          this.lngFlavour = flavour;
          this.lngFlavour.read.includes('public') &&
            (this.lngPublishSubtext = `Published on ${this.utils.convertJSDateToString(
              new Date(this.lngFlavour.datePublished)
            )}`);
          break;
        case 'CourtConvictionNRCED':
          this.nrcedFlavour = flavour;
          this.nrcedFlavour.read.includes('public') &&
            (this.nrcedPublishSubtext = `Published on ${this.utils.convertJSDateToString(
              new Date(this.nrcedFlavour.datePublished)
            )}`);
          break;
        case 'CourtConvictionBCMI':
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

  protected subscribeToFormControlChanges() {
    // Set long/lat when mine value updates
    this.myForm
      .get('association.mineGuid')
      .valueChanges.pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(val => {
        const selectedMine = this.storeService.getItem('mines').find(mine => mine._sourceRefId === val);
        if (selectedMine.name !== 'None') {
          this.myForm.get('latitude').setValue(selectedMine.location.coordinates[1]);
          this.myForm.get('longitude').setValue(selectedMine.location.coordinates[0]);
        } else {
          this.myForm.get('latitude').setValue('');
          this.myForm.get('longitude').setValue('');
        }
        this.myForm.controls.latitude.markAsDirty();
        this.myForm.controls.longitude.markAsDirty();
      });
  }

  public buildForm() {
    const flavourEditRequiredRoles = Constants.FlavourEditRequiredRoles.COURT_CONVICTION;

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
        disabled:
          this.currentRecord && this.currentRecord.sourceSystemRef !== 'nrpti' && !this.factoryService.userInLngRole()
      }),
      recordSubtype: new FormControl({
        value: (this.currentRecord && this.currentRecord.recordSubtype) || '',
        disabled: this.currentRecord && this.currentRecord.sourceSystemRef !== 'nrpti'
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
        value: (this.currentRecord && this.currentRecord.issuingAgency) || this.defaultAgency,
        disabled: this.currentRecord && this.currentRecord.sourceSystemRef !== 'nrpti'
      }),
      author: new FormControl({
        value: (this.currentRecord && this.currentRecord.author) || '',
        disabled: this.currentRecord && this.currentRecord.sourceSystemRef !== 'nrpti'
      }),
      association: new FormGroup({
        _epicProjectId: new FormControl({
          value: (this.currentRecord && this.currentRecord._epicProjectId) || null,
          disabled: this.currentRecord && this.currentRecord.sourceSystemRef !== 'nrpti'
        }),
        mineGuid: new FormControl({
          value: (this.currentRecord && this.currentRecord.mineGuid) || null,
          disabled: this.currentRecord && this.currentRecord.sourceSystemRef !== 'nrpti'
        }),
        unlistedMine: new FormControl({
          value: (this.currentRecord && this.currentRecord.unlistedMine) || '',
          disabled: this.currentRecord && this.currentRecord.sourceSystemRef !== 'nrpti'
        }),
        unlistedMineType: new FormControl({
          value: (this.currentRecord && this.currentRecord.unlistedMineType) || '',
          disabled: this.currentRecord && this.currentRecord.sourceSystemRef !== 'nrpti'
        })
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

      penalties: new FormArray(this.getPenaltiesFormGroups()),

      convictionInfoType: new FormControl({
        value: '',
        disabled: this.currentRecord && this.currentRecord.sourceSystemRef !== 'nrpti'
      }),

      // NRCED
      nrcedSummary: new FormControl({
        value: (this.currentRecord && this.nrcedFlavour && this.nrcedFlavour.summary) || '',
        disabled: !this.factoryService.isFlavourEditEnabled(flavourEditRequiredRoles.NRCED)
      }),
      publishNrced: new FormControl({
        value: (this.currentRecord && this.nrcedFlavour && this.nrcedFlavour.read.includes('public')) || false,
        disabled: !this.factoryService.isFlavourEditEnabled(flavourEditRequiredRoles.NRCED)
      }),

      // LNG
      lngDescription: new FormControl({
        value: (this.currentRecord && this.lngFlavour && this.lngFlavour.description) || '',
        disabled: !this.factoryService.isFlavourEditEnabled(flavourEditRequiredRoles.NRCED)
      }),
      publishLng: new FormControl({
        value: (this.currentRecord && this.lngFlavour && this.lngFlavour.read.includes('public')) || false,
        disabled: !this.factoryService.isFlavourEditEnabled(flavourEditRequiredRoles.NRCED)
      }),

      // BCMI
      bcmiDescription: new FormControl({
        value: (this.currentRecord && this.bcmiFlavour && this.bcmiFlavour.description) || '',
        disabled: !this.factoryService.isFlavourEditEnabled(flavourEditRequiredRoles.BCMI)
      }),
      publishBcmi: new FormControl({
        value: (this.currentRecord && this.bcmiFlavour && this.bcmiFlavour.read.includes('public')) || false,
        disabled: !this.factoryService.isFlavourEditEnabled(flavourEditRequiredRoles.BCMI)
      })
    });
  }

  /**
   * Builds an array of legislations FormGroups, each with its own set of FormControls.
   *
   * @returns {FormGroup[]} array of legislations FormGroup elements
   * @memberof CourtConvictionAddEditComponent
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
          offence: new FormControl({
            value: leg.offence || '',
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
   * @memberof CourtConvictionAddEditComponent
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
        offence: legislationsFormGroup.offence
      });
    });

    return legislations;
  }

  /**
   * Builds an array of penalties FormGroups, each with its own set of FormControls.
   *
   * @returns {FormGroup[]} array of penalties FormGroup elements
   * @memberof CourtConvictionAddEditComponent
   */
  getPenaltiesFormGroups(): FormGroup[] {
    if (!this.currentRecord || !this.currentRecord.penalties || !this.currentRecord.penalties.length) {
      return [];
    }

    const penalties: FormGroup[] = [];

    this.currentRecord.penalties.forEach(penalty => {
      penalties.push(
        new FormGroup({
          type: new FormControl(penalty.type || ''),
          penalty: new FormGroup({
            type: new FormControl(penalty.penalty.type || ''),
            value: new FormControl(penalty.penalty.value || null)
          }),
          description: new FormControl(penalty.description || '')
        })
      );
    });

    return penalties;
  }

  /**
   * Parses an array of penalties FormGroups into objects expected by the API.
   *
   * @returns {object[]} array of penalties objects
   * @memberof CourtConvictionAddEditComponent
   */
  parsePenaltiesFormGroups(): object[] {
    const penaltiesFormArray = this.myForm.get('penalties');

    if (!penaltiesFormArray || !penaltiesFormArray.value || !penaltiesFormArray.value.length) {
      return [];
    }

    const penalties: object[] = [];

    penaltiesFormArray.value.forEach(penaltyFormGroup => {
      let penaltyValue = penaltyFormGroup.penalty.value;
      // If the penalty type indicates a number, save the value as a number.
      if (penaltyFormGroup.penalty.type !== 'Other' && !isNaN(penaltyFormGroup.penalty.value)) {
        penaltyValue = Number(penaltyFormGroup.penalty.value);
      }

      penalties.push({
        type: penaltyFormGroup.type,
        penalty: {
          type: penaltyFormGroup.penalty.type,
          value: penaltyValue
        },
        description: penaltyFormGroup.description
      });
    });

    return penalties;
  }

  togglePublish(event, flavour) {
    switch (flavour) {
      case 'lng':
        this.myForm.controls.publishLng.setValue(event.checked);
        break;
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

  async save() {
    const courtConviction = {};
    this.myForm.controls.recordName.dirty && (courtConviction['recordName'] = this.myForm.controls.recordName.value);
    this.myForm.controls.recordSubtype.dirty &&
      (courtConviction['recordSubtype'] = this.myForm.controls.recordSubtype.value);
    this.myForm.controls.dateIssued.dirty &&
      (courtConviction['dateIssued'] = this.utils.convertFormGroupNGBDateToJSDate(this.myForm.get('dateIssued').value));
    (this.myForm.controls.issuingAgency.dirty || this.defaultAgency) &&
      (courtConviction['issuingAgency'] = this.myForm.controls.issuingAgency.value);
    this.myForm.controls.author.dirty && (courtConviction['author'] = this.myForm.controls.author.value);

    if (this.myForm.get('association._epicProjectId').dirty) {
      courtConviction['_epicProjectId'] = this.myForm.get('association._epicProjectId').value;
    }

    if (this.myForm.get('association.mineGuid').dirty) {
      if (!this.myForm.get('association.mineGuid').value) {
        courtConviction['mineGuid'] = '';
      } else {
        courtConviction['mineGuid'] = this.myForm.get('association.mineGuid').value;
      }
    }

    if (this.myForm.get('association.unlistedMine').dirty) {
      courtConviction['unlistedMine'] = this.myForm.get('association.unlistedMine').value;
    }

    if (this.myForm.get('association.unlistedMineType').dirty) {
      courtConviction['unlistedMineType'] = this.myForm.get('association.unlistedMineType').value;
    }

    if (
      this.myForm.get('issuedTo.type').dirty ||
      this.myForm.get('issuedTo.companyName').dirty ||
      this.myForm.get('issuedTo.firstName').dirty ||
      this.myForm.get('issuedTo.middleName').dirty ||
      this.myForm.get('issuedTo.lastName').dirty ||
      this.myForm.get('issuedTo.fullName').dirty ||
      this.myForm.get('issuedTo.dateOfBirth').dirty
    ) {
      courtConviction['issuedTo'] = {
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
      courtConviction['projectName'] = this.myForm.controls.projectName.value;
      if (courtConviction['projectName'] === 'LNG Canada') {
        courtConviction['_epicProjectId'] = EpicProjectIds.lngCanadaId;
      } else if (courtConviction['projectName'] === 'Coastal Gaslink') {
        courtConviction['_epicProjectId'] = EpicProjectIds.coastalGaslinkId;
      } else {
        courtConviction['_epicProjectId'] = null;
      }
    }

    this.myForm.controls.location.dirty && (courtConviction['location'] = this.myForm.controls.location.value);
    courtConviction['centroid'] = [];
    if (this.myForm.controls.latitude.value && this.myForm.controls.longitude.value) {
      courtConviction['centroid'] = [this.myForm.controls.longitude.value, this.myForm.controls.latitude.value];
    }

    // tslint:disable-next-line:max-line-length
    this.myForm.get('legislations').dirty && (courtConviction['legislation'] = this.parseLegislationsFormGroups());
      //swapping legislation with actCode
      const actTitle = courtConviction['legislation'][0]['act'];
      const dataservice = new ActDataServiceNRPTI(this.factoryService);
      const actCode = dataservice.getCodeFromTitle(actTitle);
      courtConviction['legislation'][0]['act'] = actCode;

    this.myForm.get('penalties').dirty && (courtConviction['penalties'] = this.parsePenaltiesFormGroups());

    // NRCED flavour
    if (this.myForm.controls.nrcedSummary.dirty || this.myForm.controls.publishNrced.dirty) {
      courtConviction['CourtConvictionNRCED'] = {};
    }
    this.myForm.controls.nrcedSummary.dirty &&
      (courtConviction['CourtConvictionNRCED']['summary'] = this.myForm.controls.nrcedSummary.value);
    if (this.myForm.controls.publishNrced.dirty && this.myForm.controls.publishNrced.value) {
      courtConviction['CourtConvictionNRCED']['addRole'] = 'public';
    } else if (this.myForm.controls.publishNrced.dirty && !this.myForm.controls.publishNrced.value) {
      courtConviction['CourtConvictionNRCED']['removeRole'] = 'public';
    }

    // LNG flavour
    if (this.myForm.controls.lngDescription.dirty || this.myForm.controls.publishLng.dirty) {
      courtConviction['CourtConvictionLNG'] = {};
    }
    this.myForm.controls.lngDescription.dirty &&
      (courtConviction['CourtConvictionLNG']['description'] = this.myForm.controls.lngDescription.value);
    if (this.myForm.controls.publishLng.dirty && this.myForm.controls.publishLng.value) {
      courtConviction['CourtConvictionLNG']['addRole'] = 'public';
    } else if (this.myForm.controls.publishLng.dirty && !this.myForm.controls.publishLng.value) {
      courtConviction['CourtConvictionLNG']['removeRole'] = 'public';
    }

    // BCMI flavour
    if (this.myForm.controls.bcmiDescription.dirty || this.myForm.controls.publishBcmi.dirty) {
      courtConviction['CourtConvictionBCMI'] = {};
    }
    this.myForm.controls.bcmiDescription.dirty &&
      (courtConviction['CourtConvictionBCMI']['description'] = this.myForm.controls.bcmiDescription.value);
    if (this.myForm.controls.publishBcmi.dirty && this.myForm.controls.publishBcmi.value) {
      courtConviction['CourtConvictionBCMI']['addRole'] = 'public';
    } else if (this.myForm.controls.publishBcmi.dirty && !this.myForm.controls.publishBcmi.value) {
      courtConviction['CourtConvictionBCMI']['removeRole'] = 'public';
    }

    if (!this.isEditing) {
      const res = await this.factoryService.writeRecord(courtConviction, 'courtConvictions', true);
      this.recordUtils.parseResForErrors(res);
      let _id = null;
      if (Array.isArray(res[0][0].object)) {
        _id = res[0][0].object.find(r => r._schemaName === 'CourtConviction')._id;
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
    } else {
      courtConviction['_id'] = this.currentRecord._id;

      if (this.nrcedFlavour) {
        if (!CommonUtils.isObject(courtConviction['CourtConvictionNRCED'])) {
          courtConviction['CourtConvictionNRCED'] = {};
        }

        // always update if flavour exists, regardless of flavour field changes, as fields in master might have changed
        courtConviction['CourtConvictionNRCED']['_id'] = this.nrcedFlavour._id;
      }

      if (this.lngFlavour) {
        if (!CommonUtils.isObject(courtConviction['CourtConvictionLNG'])) {
          courtConviction['CourtConvictionLNG'] = {};
        }

        // always update if flavour exists, regardless of flavour field changes, as fields in master might have changed
        courtConviction['CourtConvictionLNG']['_id'] = this.lngFlavour._id;
      }

      if (this.bcmiFlavour) {
        if (!CommonUtils.isObject(courtConviction['CourtConvictionBCMI'])) {
          courtConviction['CourtConvictionBCMI'] = {};
        }

        // always update if flavour exists, regardless of flavour field changes, as fields in master might have changed
        courtConviction['CourtConvictionBCMI']['_id'] = this.bcmiFlavour._id;
      }

      const res = await this.factoryService.writeRecord(courtConviction, 'courtConvictions', false);
      this.recordUtils.parseResForErrors(res);
      await this.recordUtils.handleDocumentChanges(
        this.links,
        this.documents,
        this.documentsToDelete,
        this.currentRecord._id,
        this.factoryService
      );
    }
  }

  async submit() {
    await this.save();

    if (!this.isEditing) {
      this.router.navigate(['records']);
    } else {
      this.router.navigate(['records', 'court-convictions', this.currentRecord._id, 'detail']);
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
        this.router.navigate(['records', 'court-convictions', this.currentRecord._id, 'detail']);
      }
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
