import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { FormGroup, FormControl } from '@angular/forms';
import { Picklists, EpicProjectIds } from '../../../../../../common/src/app/utils/record-constants';
import { Legislation } from '../../../../../../common/src/app/models/master/common-models/legislation';
import { FactoryService } from '../../../services/factory.service';
import { Utils } from 'nrpti-angular-components';
import { Utils as CommonUtils } from '../../../../../../common/src/app/utils/utils';
import { RecordUtils } from '../../utils/record-utils';
import { LoadingScreenService, StoreService } from 'nrpti-angular-components';
import { Constants } from '../../../utils/constants/misc';

@Component({
  selector: 'app-certificate-amendment-add-edit',
  templateUrl: './certificate-amendments-add-edit.component.html',
  styleUrls: ['./certificate-amendments-add-edit.component.scss']
})
export class CertificateAmendmentAddEditComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  public loading = true;
  public isEditing = false;
  public currentRecord = null;
  public myForm: FormGroup;
  public lastEditedSubText = null;

  // Flavour data
  public lngFlavour = null;
  public lngPublishSubtext = 'Not published';
  public bcmiFlavour = null;
  public bcmiPublishSubtext = 'Not published';

  // Pick lists
  public certificateSubtypes = Picklists.certificateSubtypePicklist;
  public agencies = Picklists.agencyPicklist;

  public datepickerMinDate = Constants.DatepickerMinDate;

  // Documents
  public documents = [];
  public links = [];
  public documentsToDelete = [];
  constructor(
    public route: ActivatedRoute,
    public router: Router,
    private recordUtils: RecordUtils,
    private storeService: StoreService,
    private factoryService: FactoryService,
    private loadingScreenService: LoadingScreenService,
    private utils: Utils,
    private _changeDetectionRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.route.data.pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: any) => {
      this.isEditing = res.breadcrumb !== 'Add Certificate Amendment';
      if (this.isEditing) {
        if (res && res.record && res.record[0] && res.record[0].data) {
          this.currentRecord = res.record[0].data;
          this.populateTextFields();
        } else {
          alert('Error: could not load edit certificate amendment.');
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
        case 'CertificateAmendmentLNG':
          this.lngFlavour = flavour;
          this.lngFlavour.read.includes('public') &&
            (this.lngPublishSubtext = `Published on ${this.utils.convertJSDateToString(
              new Date(this.lngFlavour.datePublished)
            )}`);
          break;
        case 'CertificateAmendmentBCMI':
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

  private updateLegislationDescription() {
    const legislation = new Legislation({
      act: this.myForm.get('legislation.act').value,
      regulation: this.myForm.get('legislation.regulation').value,
      section: this.myForm.get('legislation.section').value,
      subSection: this.myForm.get('legislation.subSection').value,
      paragraph: this.myForm.get('legislation.paragraph').value
    });

    this.myForm.get('legislationDescription').setValue(Picklists.getLegislationDescription('Certificate', legislation));
    this.myForm.get('legislationDescription').markAsDirty();
  }

  private buildForm() {
    this.myForm = new FormGroup({
      // Master
      recordName: new FormControl({
        value: (this.currentRecord && this.currentRecord.recordName) || '',
        disabled: (this.currentRecord && this.currentRecord.sourceSystemRef !== 'nrpti') &&
          (!this.factoryService.userInLngRole() || !this.factoryService.userInBcmiRole())
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
        value: (this.currentRecord && this.currentRecord.issuingAgency) || '',
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
      issuedTo: new FormGroup({
        type: new FormControl({
          value: (this.currentRecord && this.currentRecord.issuedTo && this.currentRecord.issuedTo.type) || '',
          disabled: (this.currentRecord && this.currentRecord.sourceSystemRef !== 'nrpti')
        }),
        companyName: new FormControl({
          value: (this.currentRecord && this.currentRecord.issuedTo && this.currentRecord.issuedTo.companyName) || '',
          disabled: (this.currentRecord && this.currentRecord.sourceSystemRef !== 'nrpti')
        }),
        firstName: new FormControl({
          value: (this.currentRecord && this.currentRecord.issuedTo && this.currentRecord.issuedTo.firstName) || '',
          disabled: (this.currentRecord && this.currentRecord.sourceSystemRef !== 'nrpti')
        }),
        middleName: new FormControl({
          value: (this.currentRecord && this.currentRecord.issuedTo && this.currentRecord.issuedTo.middleName) || '',
          disabled: (this.currentRecord && this.currentRecord.sourceSystemRef !== 'nrpti')
        }),
        lastName: new FormControl({
          value: (this.currentRecord && this.currentRecord.issuedTo && this.currentRecord.issuedTo.lastName) || '',
          disabled: (this.currentRecord && this.currentRecord.sourceSystemRef !== 'nrpti')
        }),
        fullName: new FormControl({
          value: (this.currentRecord && this.currentRecord.issuedTo && this.currentRecord.issuedTo.fullName) || '',
          disabled: (this.currentRecord && this.currentRecord.sourceSystemRef !== 'nrpti')
        }),
        dateOfBirth: new FormControl({
          value: (this.currentRecord &&
            this.currentRecord.issuedTo &&
            this.currentRecord.issuedTo.dateOfBirth &&
            this.utils.convertJSDateToNGBDate(new Date(this.currentRecord.issuedTo.dateOfBirth))) ||
            '',
          disabled: (this.currentRecord && this.currentRecord.sourceSystemRef !== 'nrpti')
        }),
        anonymous: new FormControl({
          value: (this.currentRecord && this.currentRecord.issuedTo && this.currentRecord.issuedTo.anonymous) || '',
          disabled: (this.currentRecord && this.currentRecord.sourceSystemRef !== 'nrpti')
        })
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
      lngDescription: new FormControl(
        // default to using the master description if the flavour record does not exist
        (this.currentRecord &&
          ((this.lngFlavour && this.lngFlavour.description) || (!this.lngFlavour && this.currentRecord.description))) ||
        ''
      ),
      publishLng: new FormControl({
        value: (this.currentRecord && this.lngFlavour && this.lngFlavour.read.includes('public')) || false,
        disabled: !this.factoryService.userInLngRole()
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
          value: this.currentRecord && this.currentRecord._epicProjectId || null,
          disabled: this.currentRecord && this.currentRecord.sourceSystemRef !== 'nrpti'
        }),
        mineGuid: new FormControl({
          value: this.currentRecord && this.currentRecord.mineGuid || null,
          disabled: this.currentRecord && this.currentRecord.sourceSystemRef !== 'nrpti'
        })
      })
    });
  }

  navigateToDetails() {
    this.router.navigate(['records', 'certificate-amendments', this.currentRecord._id, 'detail']);
  }

  togglePublish(event, flavour) {
    switch (flavour) {
      case 'lng':
        this.myForm.controls.publishLng.setValue(event.checked);
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

    const certificateAmendment = {};
    this.myForm.controls.recordName.dirty &&
      (certificateAmendment['recordName'] = this.myForm.controls.recordName.value);
    this.myForm.controls.recordSubtype.dirty &&
      (certificateAmendment['recordSubtype'] = this.myForm.controls.recordSubtype.value);
    this.myForm.controls.dateIssued.dirty &&
      (certificateAmendment['dateIssued'] =
        this.utils.convertFormGroupNGBDateToJSDate(this.myForm.get('dateIssued').value));
    this.myForm.controls.issuingAgency.dirty &&
      (certificateAmendment['issuingAgency'] = this.myForm.controls.issuingAgency.value);

    if (
      this.myForm.get('legislation.act').dirty ||
      this.myForm.get('legislation.regulation').dirty ||
      this.myForm.get('legislation.section').dirty ||
      this.myForm.get('legislation.subSection').dirty ||
      this.myForm.get('legislation.paragraph').dirty
    ) {
      certificateAmendment['legislation'] = {
        act: this.myForm.get('legislation.act').value,
        regulation: this.myForm.get('legislation.regulation').value,
        section: this.myForm.get('legislation.section').value,
        subSection: this.myForm.get('legislation.subSection').value,
        paragraph: this.myForm.get('legislation.paragraph').value
      };
    }

    this.myForm.controls.legislationDescription.dirty &&
      (certificateAmendment['legislationDescription'] = this.myForm.controls.legislationDescription.value);

    if (
      this.myForm.get('issuedTo.type').dirty ||
      this.myForm.get('issuedTo.companyName').dirty ||
      this.myForm.get('issuedTo.firstName').dirty ||
      this.myForm.get('issuedTo.middleName').dirty ||
      this.myForm.get('issuedTo.lastName').dirty ||
      this.myForm.get('issuedTo.fullName').dirty ||
      this.myForm.get('issuedTo.dateOfBirth').dirty
    ) {
      certificateAmendment['issuedTo'] = {
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
      certificateAmendment['projectName'] = this.myForm.controls.projectName.value;
      if (certificateAmendment['projectName'] === 'LNG Canada') {
        certificateAmendment['_epicProjectId'] = EpicProjectIds.lngCanadaId;
      } else if (certificateAmendment['projectName'] === 'Coastal Gaslink') {
        certificateAmendment['_epicProjectId'] = EpicProjectIds.coastalGaslinkId;
      } else {
        certificateAmendment['_epicProjectId'] = null;
      }
    }

    this.myForm.controls.location.dirty && (certificateAmendment['location'] = this.myForm.controls.location.value);
    (this.myForm.controls.latitude.dirty || this.myForm.controls.longitude.dirty) &&
      (certificateAmendment['centroid'] = [this.myForm.controls.longitude.value, this.myForm.controls.latitude.value]);

    // LNG flavour
    if (this.myForm.controls.lngDescription.dirty || this.myForm.controls.publishLng.dirty) {
      certificateAmendment['CertificateAmendmentLNG'] = {};
    }
    this.myForm.controls.lngDescription.dirty &&
      (certificateAmendment['CertificateAmendmentLNG']['description'] = this.myForm.controls.lngDescription.value);
    if (this.myForm.controls.publishLng.dirty && this.myForm.controls.publishLng.value) {
      certificateAmendment['CertificateAmendmentLNG']['addRole'] = 'public';
    } else if (this.myForm.controls.publishLng.dirty && !this.myForm.controls.publishLng.value) {
      certificateAmendment['CertificateAmendmentLNG']['removeRole'] = 'public';
    }

    // BCMI flavour
    if (this.myForm.controls.bcmiDescription.dirty || this.myForm.controls.publishBcmi.dirty) {
      certificateAmendment['CertificateAmendmentBCMI'] = {};
    }
    this.myForm.controls.bcmiDescription.dirty &&
      (certificateAmendment['CertificateAmendmentBCMI']['description'] = this.myForm.controls.bcmiDescription.value);
    if (this.myForm.controls.publishBcmi.dirty && this.myForm.controls.publishBcmi.value) {
      certificateAmendment['CertificateAmendmentBCMI']['addRole'] = 'public';
    } else if (this.myForm.controls.publishBcmi.dirty && !this.myForm.controls.publishBcmi.value) {
      certificateAmendment['CertificateAmendmentBCMI']['removeRole'] = 'public';
    }

    if (this.myForm.get('association._epicProjectId').dirty) {
      certificateAmendment['_epicProjectId'] = this.myForm.get('association._epicProjectId').value;
    }

    if (this.myForm.get('association.mineGuid').dirty) {
      certificateAmendment['mineGuid'] = this.myForm.get('association.mineGuid').value;
    }

    // Set the friendly name of projectName
    const epicProjectList = this.storeService.getItem('epicProjects');
    const filterResult = epicProjectList.filter(item => {
      return item._id === certificateAmendment['_epicProjectId'];
    });
    if (filterResult && filterResult[0] && filterResult[0].name) {
      certificateAmendment['projectName'] = filterResult[0].name;
    }

    if (!this.isEditing) {
      const res = await this.factoryService.writeRecord(certificateAmendment, 'certificateAmendments', true);
      this.recordUtils.parseResForErrors(res);
      let _id = null;
      if (Array.isArray(res[0][0].object)) {
        _id = res[0][0].object.find(r => r._schemaName === 'CertificateAmendment')._id;
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
      certificateAmendment['_id'] = this.currentRecord._id;

      if (this.lngFlavour) {
        if (!CommonUtils.isObject(certificateAmendment['CertificateAmendmentLNG'])) {
          certificateAmendment['CertificateAmendmentLNG'] = {};
        }

        // always update if flavour exists, regardless of flavour field changes, as fields in master might have changed
        certificateAmendment['CertificateAmendmentLNG']['_id'] = this.lngFlavour._id;
      }

      if (this.bcmiFlavour) {
        if (!CommonUtils.isObject(certificateAmendment['CertificateAmendmentBCMI'])) {
          certificateAmendment['CertificateAmendmentBCMI'] = {};
        }

        // always update if flavour exists, regardless of flavour field changes, as fields in master might have changed
        certificateAmendment['CertificateAmendmentBCMI']['_id'] = this.bcmiFlavour._id;
      }

      const res = await this.factoryService.writeRecord(certificateAmendment, 'certificateAmendments', false);
      this.recordUtils.parseResForErrors(res);
      await this.recordUtils.handleDocumentChanges(
        this.links,
        this.documents,
        this.documentsToDelete,
        this.currentRecord._id,
        this.factoryService
      );

      this.loadingScreenService.setLoadingState(false, 'main');
      this.router.navigate(['records', 'certificate-amendments', this.currentRecord._id, 'detail']);
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
        this.router.navigate(['records', 'certificate-amendments', this.currentRecord._id, 'detail']);
      }
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
