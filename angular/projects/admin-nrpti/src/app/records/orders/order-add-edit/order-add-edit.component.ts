import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import { FormGroup, FormControl } from '@angular/forms';
import { Picklists, EpicProjectIds } from '../../../../../../common/src/app/utils/record-constants';
import { Legislation } from '../../../../../../common/src/app/models/master/common-models/legislation';
import { FactoryService } from '../../../services/factory.service';
import { Utils } from 'nrpti-angular-components';
import { Utils as CommonUtils } from '../../../../../../common/src/app/utils/utils';
import { RecordUtils } from '../../utils/record-utils';
import { LoadingScreenService, StoreService, LoggerService } from 'nrpti-angular-components';
import { Constants } from '../../../utils/constants/misc';

@Component({
  selector: 'app-order-add-edit',
  templateUrl: './order-add-edit.component.html',
  styleUrls: ['./order-add-edit.component.scss']
})
export class OrderAddEditComponent implements OnInit, OnDestroy {
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
  public orderSubtypePicklist = Picklists.orderSubtypePicklist;
  public agencies = Picklists.agencyPicklist;
  public authors = Picklists.authorPicklist;
  public outcomeStatuses = Picklists.outcomeStatusPicklist;
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
    private storeService: StoreService,
    private logger: LoggerService,
    private loadingScreenService: LoadingScreenService,
    private utils: Utils,
    private _changeDetectionRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.route.data.pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: any) => {
      this.isEditing = res.breadcrumb !== 'Add Order';
      if (this.isEditing) {
        if (res && res.record && res.record[0] && res.record[0].data) {
          this.currentRecord = res.record[0].data;
          this.populateTextFields();
        } else {
          alert('Error: could not load edit order.');
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
        case 'OrderLNG':
          this.lngFlavour = flavour;
          this.lngFlavour.read.includes('public') &&
            (this.lngPublishSubtext = `Published on ${this.utils.convertJSDateToString(
              new Date(this.lngFlavour.datePublished)
            )}`);
          break;
        case 'OrderNRCED':
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

    this.myForm.get('legislationDescription').setValue(Picklists.getLegislationDescription('Order', legislation));
    this.myForm.get('legislationDescription').markAsDirty();
  }

  private buildForm() {
    const flavourEditRequiredRoles = Constants.FlavourEditRequiredRoles.ORDER;

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
          !this.factoryService.userInLngRole()
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
      author: new FormControl({
        value: (this.currentRecord && this.currentRecord.author) || '',
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
      outcomeStatus: new FormControl({
        value: (this.currentRecord && this.currentRecord.outcomeStatus) || '',
        disabled: (this.currentRecord && this.currentRecord.sourceSystemRef !== 'nrpti')
      }),
      outcomeDescription: new FormControl({
        value: (this.currentRecord && this.currentRecord.outcomeDescription) || '',
        disabled: (this.currentRecord && this.currentRecord.sourceSystemRef !== 'nrpti')
      }),

      // NRCED
      nrcedSummary: new FormControl({
        // default to using the master description if the flavour record does not exist
        value: (this.currentRecord &&
          ((this.nrcedFlavour && this.nrcedFlavour.summary) ||
            (!this.nrcedFlavour && this.currentRecord.description))) ||
          '',
          disabled: !this.factoryService.isFlavourEditEnabled(flavourEditRequiredRoles.NRCED)
      }),
      publishNrced: new FormControl({
        value: (this.currentRecord && this.nrcedFlavour && this.nrcedFlavour.read.includes('public')) || false,
        disabled: !this.factoryService.isFlavourEditEnabled(flavourEditRequiredRoles.NRCED)
      }),

      // LNG
      lngDescription: new FormControl({
        // default to using the master description if the flavour record does not exist
        value: (this.currentRecord &&
          ((this.lngFlavour && this.lngFlavour.description) ||
            (!this.lngFlavour && this.currentRecord.description))) ||
          '',
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
      })
    });
  }

  navigateToDetails() {
    this.router.navigate(['records', 'orders', this.currentRecord._id, 'detail']);
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

    const order = {};
    this.myForm.controls.recordName.dirty && (order['recordName'] = this.myForm.controls.recordName.value);
    this.myForm.controls.recordSubtype.dirty && (order['recordSubtype'] = this.myForm.controls.recordSubtype.value);
    this.myForm.controls.dateIssued.dirty &&
      (order['dateIssued'] = this.utils.convertFormGroupNGBDateToJSDate(this.myForm.get('dateIssued').value));
    (this.myForm.controls.issuingAgency.dirty || this.defaultAgency) &&
      (order['issuingAgency'] = this.myForm.controls.issuingAgency.value);
    this.myForm.controls.author.dirty && (order['author'] = this.myForm.controls.author.value);

    if (
      this.myForm.get('legislation.act').dirty ||
      this.myForm.get('legislation.regulation').dirty ||
      this.myForm.get('legislation.section').dirty ||
      this.myForm.get('legislation.subSection').dirty ||
      this.myForm.get('legislation.paragraph').dirty
    ) {
      order['legislation'] = {
        act: this.myForm.get('legislation.act').value,
        regulation: this.myForm.get('legislation.regulation').value,
        section: this.myForm.get('legislation.section').value,
        subSection: this.myForm.get('legislation.subSection').value,
        paragraph: this.myForm.get('legislation.paragraph').value
      };
    }

    this.myForm.controls.legislationDescription.dirty &&
      (order['legislationDescription'] = this.myForm.controls.legislationDescription.value);

    if (
      this.myForm.get('issuedTo.type').dirty ||
      this.myForm.get('issuedTo.companyName').dirty ||
      this.myForm.get('issuedTo.firstName').dirty ||
      this.myForm.get('issuedTo.middleName').dirty ||
      this.myForm.get('issuedTo.lastName').dirty ||
      this.myForm.get('issuedTo.fullName').dirty ||
      this.myForm.get('issuedTo.dateOfBirth').dirty
    ) {
      order['issuedTo'] = {
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
      order['projectName'] = this.myForm.controls.projectName.value;
      if (order['projectName'] === 'LNG Canada') {
        order['_epicProjectId'] = EpicProjectIds.lngCanadaId;
      } else if (order['projectName'] === 'Coastal Gaslink') {
        order['_epicProjectId'] = EpicProjectIds.coastalGaslinkId;
      } else {
        order['_epicProjectId'] = null;
      }
    }

    this.myForm.controls.location.dirty && (order['location'] = this.myForm.controls.location.value);
    (this.myForm.controls.latitude.dirty || this.myForm.controls.longitude.dirty) &&
      (order['centroid'] = [this.myForm.controls.longitude.value, this.myForm.controls.latitude.value]);
    this.myForm.controls.outcomeStatus.dirty && (order['outcomeStatus'] = this.myForm.controls.outcomeStatus.value);
    this.myForm.controls.outcomeDescription.dirty &&
      (order['outcomeDescription'] = this.myForm.controls.outcomeDescription.value);

    // NRCED flavour
    if (this.myForm.controls.nrcedSummary.dirty || this.myForm.controls.publishNrced.dirty) {
      order['OrderNRCED'] = {};
    }
    this.myForm.controls.nrcedSummary.dirty &&
      (order['OrderNRCED']['summary'] = this.myForm.controls.nrcedSummary.value);
    if (this.myForm.controls.publishNrced.dirty && this.myForm.controls.publishNrced.value) {
      order['OrderNRCED']['addRole'] = 'public';
    } else if (this.myForm.controls.publishNrced.dirty && !this.myForm.controls.publishNrced.value) {
      order['OrderNRCED']['removeRole'] = 'public';
    }

    // LNG flavour
    if (this.myForm.controls.lngDescription.dirty || this.myForm.controls.publishLng.dirty) {
      order['OrderLNG'] = {};
    }
    this.myForm.controls.lngDescription.dirty &&
      (order['OrderLNG']['description'] = this.myForm.controls.lngDescription.value);
    if (this.myForm.controls.publishLng.dirty && this.myForm.controls.publishLng.value) {
      order['OrderLNG']['addRole'] = 'public';
    } else if (this.myForm.controls.publishLng.dirty && !this.myForm.controls.publishLng.value) {
      order['OrderLNG']['removeRole'] = 'public';
    }

    if (this.myForm.get('association._epicProjectId').dirty) {
      order['_epicProjectId'] = this.myForm.get('association._epicProjectId').value;
    }

    if (this.myForm.get('association.mineGuid').dirty) {
      order['mineGuid'] = this.myForm.get('association.mineGuid').value;
    }

    // Set the friendly name of projectName
    const epicProjectList = this.storeService.getItem('epicProjects');
    const filterResult = epicProjectList.filter(item => {
      return item._id === order['_epicProjectId'];
    });
    if (filterResult && filterResult[0] && filterResult[0].name) {
      order['projectName'] = filterResult[0].name;
    }

    if (!this.isEditing) {
      const res = await this.factoryService.writeRecord(order, 'orders', true);
      this.recordUtils.parseResForErrors(res);
      let _id = null;
      if (Array.isArray(res[0][0].object)) {
        _id = res[0][0].object.find(r => r._schemaName === 'Order')._id;
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
      order['_id'] = this.currentRecord._id;

      if (this.nrcedFlavour) {
        if (!CommonUtils.isObject(order['OrderNRCED'])) {
          order['OrderNRCED'] = {};
        }

        // always update if flavour exists, regardless of flavour field changes, as fields in master might have changed
        order['OrderNRCED']['_id'] = this.nrcedFlavour._id;
      }

      if (this.lngFlavour) {
        if (!CommonUtils.isObject(order['OrderLNG'])) {
          order['OrderLNG'] = {};
        }

        // always update if flavour exists, regardless of flavour field changes, as fields in master might have changed
        order['OrderLNG']['_id'] = this.lngFlavour._id;
      }

      const res = await this.factoryService.writeRecord(order, 'orders', false);
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
      this.router.navigate(['records', 'orders', this.currentRecord._id, 'detail']);
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
        this.router.navigate(['records', 'orders', this.currentRecord._id, 'detail']);
      }
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
