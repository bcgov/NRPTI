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
import { LoadingScreenService, LoggerService } from 'nrpti-angular-components';
import { Constants } from '../../../utils/constants/misc';
import { AgencyDataService } from '../../../../../../../projects/global/src/lib/utils/agency-data-service';

@Component({
  standalone: false,
  selector: 'app-administrative-sanction-add-edit',
  templateUrl: './administrative-sanction-add-edit.component.html',
  styleUrls: ['./administrative-sanction-add-edit.component.scss']
})
export class AdministrativeSanctionAddEditComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<void> = new Subject<void>();

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
  public agencies: any[];
  public authors = Picklists.authorPicklist;
  private defaultAgency = '';

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
    private factoryService: FactoryService,
    private loadingScreenService: LoadingScreenService,
    private logger: LoggerService,
    private utils: Utils,
    private _changeDetectionRef: ChangeDetectorRef
  ) {
    this.agencies = Picklists.getAgencyCodes(this.factoryService);
  }

  ngOnInit() {
    this.route.data.pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: any) => {
      this.isEditing = res.breadcrumb !== 'Add Administrative Sanction';
      if (this.isEditing) {
        if (res && res.record && res.record[0] && res.record[0].data) {
          this.currentRecord = res.record[0].data;
          this.populateTextFields();
        } else {
          alert('Error: could not load edit administrative sanction.');
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
        case 'AdministrativeSanctionLNG':
          this.lngFlavour = flavour;
          this.lngFlavour.read.includes('public') &&
            (this.lngPublishSubtext = `Published on ${this.utils.convertJSDateToString(
              new Date(this.lngFlavour.datePublished)
            )}`);
          break;
        case 'AdministrativeSanctionNRCED':
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
    const flavourEditRequiredRoles = Constants.FlavourEditRequiredRoles.ADMINISTRATIVE_SANCTION;

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
        disabled: !this.factoryService.isFlavourEditEnabled(flavourEditRequiredRoles.LNG)
      }),
      publishLng: new FormControl({
        value: (this.currentRecord && this.lngFlavour && this.lngFlavour.read.includes('public')) || false,
        disabled: !this.factoryService.isFlavourEditEnabled(flavourEditRequiredRoles.LNG)
      })
    });
  }

  /**
   * Builds an array of legislations FormGroups, each with its own set of FormControls.
   *
   * @returns {FormGroup[]} array of legislations FormGroup elements
   * @memberof AdministrativeSanctionAddEditComponent
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
            value: this.recordUtils.replaceActCodeWithTitle(leg.act, this.factoryService) || '',
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
   * @memberof AdministrativeSanctionAddEditComponent
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

  /**
   * Builds an array of penalties FormGroups, each with its own set of FormControls.
   *
   * @returns {FormGroup[]} array of penalties FormGroup elements
   * @memberof AdministrativeSanctionAddEditComponent
   */
  getPenaltiesFormGroups(): FormGroup[] {
    if (!this.currentRecord || !this.currentRecord.penalties || !this.currentRecord.penalties.length) {
      return [];
    }

    const penalties: FormGroup[] = [];

    this.currentRecord.penalties.forEach(penalty => {
      penalties.push(
        new FormGroup({
          type: new FormControl({
            value: penalty.type || '',
            disabled: this.currentRecord && this.currentRecord.sourceSystemRef !== 'nrpti'
          }),
          penalty: new FormGroup({
            type: new FormControl({
              value: penalty.penalty.type || '',
              disabled: this.currentRecord && this.currentRecord.sourceSystemRef !== 'nrpti'
            }),
            value: new FormControl({
              value: penalty.penalty.value || '',
              disabled: this.currentRecord && this.currentRecord.sourceSystemRef !== 'nrpti'
            })
          }),
          description: new FormControl({
            value: penalty.description || '',
            disabled: this.currentRecord && this.currentRecord.sourceSystemRef !== 'nrpti'
          })
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

  navigateToDetails() {
    this.router.navigate(['records', 'administrative-sanctions', this.currentRecord._id, 'detail']);
  }

  togglePublish(event, flavour) {
    switch (flavour) {
      case 'lng':
        this.myForm.controls.publishLng.setValue(event.checked);
        break;
      case 'nrced':
        this.myForm.controls.publishNrced.setValue(event.checked);
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

    const administrativeSanction = {};
    this.myForm.controls.recordName.dirty &&
      (administrativeSanction['recordName'] = this.myForm.controls.recordName.value);
    this.myForm.controls.dateIssued.dirty &&
      (administrativeSanction['dateIssued'] = this.utils.convertFormGroupNGBDateToJSDate(
        this.myForm.get('dateIssued').value
      ));
    (this.myForm.controls.issuingAgency.dirty || this.defaultAgency) &&
      (administrativeSanction['issuingAgency'] = this.myForm.controls.issuingAgency.value);
    this.myForm.controls.author.dirty && (administrativeSanction['author'] = this.myForm.controls.author.value);

    if (
      this.myForm.get('issuedTo.type').dirty ||
      this.myForm.get('issuedTo.companyName').dirty ||
      this.myForm.get('issuedTo.firstName').dirty ||
      this.myForm.get('issuedTo.middleName').dirty ||
      this.myForm.get('issuedTo.lastName').dirty ||
      this.myForm.get('issuedTo.fullName').dirty ||
      this.myForm.get('issuedTo.dateOfBirth').dirty
    ) {
      administrativeSanction['issuedTo'] = {
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
      administrativeSanction['projectName'] = this.myForm.controls.projectName.value;
      if (administrativeSanction['projectName'] === 'LNG Canada') {
        administrativeSanction['_epicProjectId'] = EpicProjectIds.lngCanadaId;
      } else if (administrativeSanction['projectName'] === 'Coastal Gaslink') {
        administrativeSanction['_epicProjectId'] = EpicProjectIds.coastalGaslinkId;
      } else {
        administrativeSanction['_epicProjectId'] = null;
      }
    }

    this.myForm.controls.location.dirty && (administrativeSanction['location'] = this.myForm.controls.location.value);
    administrativeSanction['centroid'] = [];
    if (this.myForm.controls.latitude.value && this.myForm.controls.longitude.value) {
      administrativeSanction['centroid'] = [this.myForm.controls.longitude.value, this.myForm.controls.latitude.value];
    }

    // eslint-disable-next-line max-line-length
    this.myForm.get('legislations').dirty &&
      (administrativeSanction['legislation'] = this.parseLegislationsFormGroups());

    this.recordUtils.replaceActTitleWithCode(administrativeSanction, this.factoryService);
    this.myForm.get('penalties').dirty && (administrativeSanction['penalties'] = this.parsePenaltiesFormGroups());

    // NRCED flavour
    if (this.myForm.controls.nrcedSummary.dirty || this.myForm.controls.publishNrced.dirty) {
      administrativeSanction['AdministrativeSanctionNRCED'] = {};
    }
    this.myForm.controls.nrcedSummary.dirty &&
      (administrativeSanction['AdministrativeSanctionNRCED']['summary'] = this.myForm.controls.nrcedSummary.value);
    if (this.myForm.controls.publishNrced.dirty && this.myForm.controls.publishNrced.value) {
      administrativeSanction['AdministrativeSanctionNRCED']['addRole'] = 'public';
    } else if (this.myForm.controls.publishNrced.dirty && !this.myForm.controls.publishNrced.value) {
      administrativeSanction['AdministrativeSanctionNRCED']['removeRole'] = 'public';
    }

    // LNG flavour
    if (this.myForm.controls.lngDescription.dirty || this.myForm.controls.publishLng.dirty) {
      administrativeSanction['AdministrativeSanctionLNG'] = {};
    }
    this.myForm.controls.lngDescription.dirty &&
      (administrativeSanction['AdministrativeSanctionLNG']['description'] = this.myForm.controls.lngDescription.value);
    if (this.myForm.controls.publishLng.dirty && this.myForm.controls.publishLng.value) {
      administrativeSanction['AdministrativeSanctionLNG']['addRole'] = 'public';
    } else if (this.myForm.controls.publishLng.dirty && !this.myForm.controls.publishLng.value) {
      administrativeSanction['AdministrativeSanctionLNG']['removeRole'] = 'public';
    }

    if (!this.isEditing) {
      const res = await this.factoryService.writeRecord(administrativeSanction, 'administrativeSanctions', true);
      this.recordUtils.parseResForErrors(res);
      let _id = null;
      if (Array.isArray(res[0][0].object)) {
        _id = res[0][0].object.find(r => r._schemaName === 'AdministrativeSanction')._id;
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
      administrativeSanction['_id'] = this.currentRecord._id;

      if (this.nrcedFlavour) {
        if (!CommonUtils.isObject(administrativeSanction['AdministrativeSanctionNRCED'])) {
          administrativeSanction['AdministrativeSanctionNRCED'] = {};
        }

        // always update if flavour exists, regardless of flavour field changes, as fields in master might have changed
        administrativeSanction['AdministrativeSanctionNRCED']['_id'] = this.nrcedFlavour._id;
      }

      if (this.lngFlavour) {
        if (!CommonUtils.isObject(administrativeSanction['AdministrativeSanctionLNG'])) {
          administrativeSanction['AdministrativeSanctionLNG'] = {};
        }

        // always update if flavour exists, regardless of flavour field changes, as fields in master might have changed
        administrativeSanction['AdministrativeSanctionLNG']['_id'] = this.lngFlavour._id;
      }

      const res = await this.factoryService.writeRecord(administrativeSanction, 'administrativeSanctions', false);
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
      this.router.navigate(['records', 'administrative-sanctions', this.currentRecord._id, 'detail']);
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
        this.router.navigate(['records', 'administrative-sanctions', this.currentRecord._id, 'detail']);
      }
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
