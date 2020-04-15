import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { FormGroup, FormControl, FormArray } from '@angular/forms';
import { Picklists } from '../../../utils/constants/record-constants';
import { EpicProjectIds } from '../../../utils/constants/record-constants';
import { FactoryService } from '../../../services/factory.service';
import { Utils } from 'nrpti-angular-components';
import { Utils as CommonUtils } from '../../../../../../common/src/app/utils/utils';
import { RecordUtils } from '../../utils/record-utils';
import { ENTITY_TYPE } from '../../../../../../common/src/app/models/master/common-models/entity';

@Component({
  selector: 'app-court-conviction-add-edit',
  templateUrl: './court-conviction-add-edit.component.html',
  styleUrls: ['./court-conviction-add-edit.component.scss']
})
export class CourtConvictionAddEditComponent implements OnInit, OnDestroy {
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
  public courtConvictionSubtypes = Picklists.courtConvictionSubtypePicklist;

  // Documents
  public documents = [];
  public links = [];
  public documentsToDelete = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private recordUtils: RecordUtils,
    private factoryService: FactoryService,
    private utils: Utils,
    private _changeDetectionRef: ChangeDetectorRef
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
        default:
          break;
      }
    }
  }

  private buildForm() {
    this.myForm = new FormGroup({
      // Master
      recordName: new FormControl((this.currentRecord && this.currentRecord.recordName) || ''),
      recordSubtype: new FormControl((this.currentRecord && this.currentRecord.recordSubtype) || ''),
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
      issuedTo: new FormGroup({
        type: new FormControl(
          (this.currentRecord && this.currentRecord.issuedTo && this.currentRecord.issuedTo.type) || ''
        ),
        companyName: new FormControl(
          (this.currentRecord && this.currentRecord.issuedTo && this.currentRecord.issuedTo.companyName) || ''
        ),
        firstName: new FormControl(
          (this.currentRecord && this.currentRecord.issuedTo && this.currentRecord.issuedTo.firstName) || ''
        ),
        middleName: new FormControl(
          (this.currentRecord && this.currentRecord.issuedTo && this.currentRecord.issuedTo.middleName) || ''
        ),
        lastName: new FormControl(
          (this.currentRecord && this.currentRecord.issuedTo && this.currentRecord.issuedTo.lastName) || ''
        ),
        fullName: new FormControl(
          (this.currentRecord && this.currentRecord.issuedTo && this.currentRecord.issuedTo.fullName) || ''
        ),
        dateOfBirth: new FormControl(
          (this.currentRecord &&
            this.currentRecord.issuedTo &&
            this.currentRecord.issuedTo.dateOfBirth &&
            this.utils.convertJSDateToNGBDate(new Date(this.currentRecord.issuedTo.dateOfBirth))) ||
            ''
        ),
        forceAnonymous: new FormControl(
          (this.currentRecord && this.currentRecord.issuedTo && this.currentRecord.issuedTo.forceAnonymous) || ''
        )
      }),
      projectName: new FormControl((this.currentRecord && this.currentRecord.projectName) || ''),
      location: new FormControl((this.currentRecord && this.currentRecord.location) || ''),
      latitude: new FormControl(
        (this.currentRecord && this.currentRecord.centroid && this.currentRecord.centroid[0]) || ''
      ),
      longitude: new FormControl(
        (this.currentRecord && this.currentRecord.centroid && this.currentRecord.centroid[1]) || ''
      ),
      penalties: new FormArray(this.getPenaltiesFormGroups()),

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
      default:
        break;
    }
    this._changeDetectionRef.detectChanges();
  }

  async submit() {
    const courtConviction = {};
    this.myForm.controls.recordName.dirty && (courtConviction['recordName'] = this.myForm.controls.recordName.value);
    this.myForm.controls.recordSubtype.dirty &&
      (courtConviction['recordSubtype'] = this.myForm.controls.recordSubtype.value);
    this.myForm.controls.dateIssued.dirty &&
      (courtConviction['dateIssued'] = this.utils.convertFormGroupNGBDateToJSDate(this.myForm.get('dateIssued').value));
    this.myForm.controls.issuingAgency.dirty &&
      (courtConviction['issuingAgency'] = this.myForm.controls.issuingAgency.value);
    this.myForm.controls.author.dirty && (courtConviction['author'] = this.myForm.controls.author.value);

    if (
      this.myForm.controls.act.dirty ||
      this.myForm.controls.regulation.dirty ||
      this.myForm.controls.section.dirty ||
      this.myForm.controls.subSection.dirty ||
      this.myForm.controls.paragraph.dirty
    ) {
      courtConviction['legislation'] = {
        act: this.myForm.controls.act.value,
        regulation: this.myForm.controls.regulation.value,
        section: this.myForm.controls.section.value,
        subSection: this.myForm.controls.subSection.value,
        paragraph: this.myForm.controls.paragraph.value
      };
    }

    this.myForm.controls.offence.dirty && (courtConviction['offence'] = this.myForm.controls.offence.value);

    if (
      this.myForm.get('issuedTo.type').dirty ||
      this.myForm.get('issuedTo.companyName').dirty ||
      this.myForm.get('issuedTo.firstName').dirty ||
      this.myForm.get('issuedTo.middleName').dirty ||
      this.myForm.get('issuedTo.lastName').dirty ||
      this.myForm.get('issuedTo.fullName').dirty ||
      this.myForm.get('issuedTo.dateOfBirth').dirty ||
      this.myForm.get('issuedTo.forceAnonymous').dirty
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

      if (this.myForm.get('issuedTo.forceAnonymous').touched) {
        // anonymity may be enforced (via roles, below) automatically by the business logic, but in that case, don't
        // update this value, which should only be set when the user manually toggles the anonymity.
        courtConviction['issuedTo']['forceAnonymous'] = this.myForm.get('issuedTo.forceAnonymous').value;
      }

      if (this.myForm.get('issuedTo.type').value === ENTITY_TYPE.Company) {
        courtConviction['issuedTo']['forceAnonymous'] = null;
      }
    }

    // Project name logic
    // If LNG Canada or Coastal Gaslink are selected we need to put it their corresponding OIDs
    this.myForm.controls.projectName.dirty && (courtConviction['projectName'] = this.myForm.controls.projectName.value);
    if (courtConviction['projectName'] === 'LNG Canada') {
      courtConviction['_epicProjectId'] = EpicProjectIds.lngCanadaId;
    } else if (courtConviction['projectName'] === 'Coastal Gaslink') {
      courtConviction['_epicProjectId'] = EpicProjectIds.coastalGaslinkId;
    }

    this.myForm.controls.location.dirty && (courtConviction['location'] = this.myForm.controls.location.value);
    (this.myForm.controls.latitude.dirty || this.myForm.controls.longitude.dirty) &&
      (courtConviction['centroid'] = [this.myForm.controls.latitude.value, this.myForm.controls.longitude.value]);

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

    if (!this.isEditing) {
      this.factoryService.createCourtConviction(courtConviction).subscribe(async res => {
        this.recordUtils.parseResForErrors(res);
        await this.recordUtils.handleDocumentChanges(
          this.links,
          this.documents,
          this.documentsToDelete,
          res[0][0].object._id,
          this.factoryService
        );

        this.router.navigate(['records']);
      });
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

      this.factoryService.editCourtConviction(courtConviction).subscribe(async res => {
        this.recordUtils.parseResForErrors(res);
        await this.recordUtils.handleDocumentChanges(
          this.links,
          this.documents,
          this.documentsToDelete,
          this.currentRecord._id,
          this.factoryService
        );

        this.router.navigate(['records', 'court-convictions', this.currentRecord._id, 'detail']);
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
        this.router.navigate(['records', 'court-convictions', this.currentRecord._id, 'detail']);
      }
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
