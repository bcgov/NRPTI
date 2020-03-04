import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { FormGroup, FormControl } from '@angular/forms';
import { Picklists } from '../../../utils/constants/record-constants';
import { AdministrativePenalty } from '../../../../../../common/src/app/models/master';
import { EpicProjectIds } from '../../../utils/constants/record-constants';
import { FactoryService } from '../../../services/factory.service';
import { Utils } from 'nrpti-angular-components';

@Component({
  selector: 'app-administrative-penalty-add-edit',
  templateUrl: './administrative-penalty-add-edit.component.html',
  styleUrls: ['./administrative-penalty-add-edit.component.scss']
})
export class AdministrativePenaltyAddEditComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  public loading = true;
  public isEditing = false;
  public currentRecord = null;
  public myForm: FormGroup;
  public lastEditedSubText = null;

  // Flavour data
  public nrcedFlavour = null;
  public lngFlavour = null;
  public lngPublishStatus = 'Unpublished';
  public nrcedPublishStatus = 'Unpublished';
  public lngPublishSubtext = 'Not published';
  public nrcedPublishSubtext = 'Not published';

  // Pick lists
  public agencies = Picklists.agencyPicklist;
  public authors = Picklists.authorPicklist;
  public outcomeStatuses = Picklists.outcomeStatusPicklist;

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    private factoryService: FactoryService,
    private utils: Utils,
    private _changeDetectionRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.route.data.pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: any) => {
      this.isEditing = res.breadcrumb !== 'Add Administrative Penalty';
      if (this.isEditing) {
        if (res && res.record && res.record[0] && res.record[0].data) {
          this.currentRecord = res.record[0].data;
          this.populateTextFields();
        } else {
          alert('Error: could not load edit administrative penalty.');
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
        case 'AdministrativePenaltyLNG':
          this.lngFlavour = flavour;
          this.lngFlavour.read.includes('public') && (this.lngPublishStatus = 'Published');
          this.lngFlavour.read.includes('public') &&
            (this.lngPublishSubtext = `Published on ${this.utils.convertJSDateToString(
              new Date(this.lngFlavour.datePublished)
            )}`);
          break;
        case 'AdministrativePenaltyNRCED':
          this.nrcedFlavour = flavour;
          this.nrcedFlavour.read.includes('public') && (this.nrcedPublishStatus = 'Published');
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
      penalty: new FormControl((this.currentRecord && this.currentRecord.penalty) || ''),

      // NRCED
      nrcedSummary: new FormControl((this.currentRecord && this.nrcedFlavour && this.nrcedFlavour.summary) || ''),

      // LNG
      lngDescription: new FormControl((this.currentRecord && this.lngFlavour && this.lngFlavour.description) || '')
    });
  }

  navigateToDetails() {
    this.router.navigate(['records', 'administrative-penalties', this.currentRecord._id, 'detail']);
  }

  togglePublish(flavour) {
    switch (flavour) {
      case 'lng':
        this.lngPublishStatus = this.lngPublishStatus === 'Unpublished' ? 'Published' : 'Unpublished';
        break;
      case 'nrced':
        this.nrcedPublishStatus = this.nrcedPublishStatus === 'Unpublished' ? 'Published' : 'Unpublished';
        break;
      default:
        break;
    }
    this._changeDetectionRef.detectChanges();
  }

  submit() {
    // TODO
    // _epicProjectId
    // _sourceRefId
    // _epicMilestoneId
    // legislation
    // projectName
    // documents

    // TODO: For editing we should create an object with only the changed fields.
    const administrativePenalty = new AdministrativePenalty({
      recordName: this.myForm.controls.recordName.value,
      recordType: 'AdministrativePenalty',
      dateIssued: this.utils.convertFormGroupNGBDateToJSDate(this.myForm.get('dateIssued').value),
      issuingAgency: this.myForm.controls.issuingAgency.value,
      author: this.myForm.controls.author.value,
      legislation: {
        act: this.myForm.controls.act.value,
        regulation: this.myForm.controls.regulation.value,
        section: this.myForm.controls.section.value,
        subSection: this.myForm.controls.subSection.value,
        paragraph: this.myForm.controls.paragraph.value
      },
      issuedTo: this.myForm.controls.issuedTo.value,
      projectName: this.myForm.controls.projectName.value,
      location: this.myForm.controls.location.value,
      centroid: [this.myForm.controls.latitude.value, this.myForm.controls.longitude.value],
      outcomeStatus: this.myForm.controls.outcomeStatus.value,
      outcomeDescription: this.myForm.controls.outcomeDescription.value,
      penalty: this.myForm.controls.penalty.value
    });

    // Project name logic
    // If LNG Canada or Coastal Gaslink are selected we need to put it their corresponding OIDs
    if (administrativePenalty.projectName === 'LNG Canada') {
      administrativePenalty._epicProjectId = EpicProjectIds.lngCanadaId;
    } else if (administrativePenalty.projectName === 'Coastal Gaslink') {
      administrativePenalty._epicProjectId = EpicProjectIds.coastalGaslinkId;
    }

    // Publishing logic
    administrativePenalty.AdministrativePenaltyNRCED = {
      summary: this.myForm.controls.nrcedSummary.value
    };
    if (this.nrcedPublishStatus === 'Published') {
      administrativePenalty.AdministrativePenaltyNRCED['addRole'] = 'public';
    } else if (this.isEditing && this.nrcedPublishStatus === 'Unpublished') {
      administrativePenalty.AdministrativePenaltyNRCED['removeRole'] = 'public';
    }

    administrativePenalty.AdministrativePenaltyLNG = {
      description: this.myForm.controls.lngDescription.value
    };
    if (this.lngPublishStatus === 'Published') {
      administrativePenalty.AdministrativePenaltyLNG['addRole'] = 'public';
    } else if (this.isEditing && this.lngPublishStatus === 'Unpublished') {
      administrativePenalty.AdministrativePenaltyLNG['removeRole'] = 'public';
    }

    if (!this.isEditing) {
      this.factoryService.createAdministrativePenalty(administrativePenalty).subscribe(res => {
        this.parseResForErrors(res);
        this.router.navigate(['records']);
      });
    } else {
      administrativePenalty._id = this.currentRecord._id;

      this.nrcedFlavour && (administrativePenalty.AdministrativePenaltyNRCED['_id'] = this.nrcedFlavour._id);
      this.lngFlavour && (administrativePenalty.AdministrativePenaltyLNG['_id'] = this.lngFlavour._id);

      this.factoryService.editAdministrativePenalty(administrativePenalty).subscribe(res => {
        this.parseResForErrors(res);
        this.router.navigate(['records', 'administrative-penalties', this.currentRecord._id, 'detail']);
      });
    }
  }

  private parseResForErrors(res) {
    if (!res || !res.length || !res[0] || !res[0].length || !res[0][0]) {
      alert('Failed to save record.');
    }

    if (res[0][0].status === 'failure') {
      alert('Failed to save master record.');
    }

    if (res[0][0].flavours) {
      let flavourFailure = false;
      res[0][0].flavours.forEach(flavour => {
        if (flavour.status === 'failure') {
          flavourFailure = true;
        }
      });
      if (flavourFailure) {
        alert('Failed to save one or more flavour records');
      }
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
        this.router.navigate(['records', 'administrative-penalties', this.currentRecord._id, 'detail']);
      }
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
