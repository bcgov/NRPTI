import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { DatePickerComponent, LoadingScreenService, Utils } from 'nrpti-angular-components';
import { Picklists } from '../../../../../common/src/app/utils/record-constants';
import { FactoryService } from '../../services/factory.service';
import { RecordUtils } from '../../records/utils/record-utils';
import { Constants } from '../../utils/constants/misc';
import { AgencyDataService } from '../../../../../../projects/global/src/lib/utils/agency-data-service';

@Component({
  selector: 'app-mines-record-add',
  templateUrl: './mines-record-add.component.html',
  styleUrls: ['./mines-record-add.component.scss']
})
export class MinesRecordAddComponent implements OnInit, OnDestroy {
  @Input() mine = null;
  @Input() collectionId = null;
  @Input() returnObjInsteadOfSubmit = false;
  @Output() addedRecord: EventEmitter<object> = new EventEmitter<object>();
  @ViewChild(DatePickerComponent) DatePicker: DatePickerComponent;

  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  // flags
  public loading = true;
  public resetDocStaging = false;

  // form
  public myForm = new FormGroup({
    recordName: new FormControl(''),
    recordAgency: new FormControl(''),
    dateIssued: new FormControl(''),
    recordType: new FormControl(''),
    typeCode: new FormControl(''),
    documents: new FormControl('')
  });

  // Pick lists
  public recordAgencies = Picklists.collectionAgencyCodePicklist;
  public recordTypeNamesBCMI = Object.values(Picklists.bcmiRecordTypePicklist)
    .map(item => {
      return item.displayName;
    })
    .sort();
  public permitTypes = ['ALG', 'OGP', 'AMD'];

  // Documents
  public documents = [];
  public links = [];

  public datepickerMinDate = Constants.DatepickerMinDate;

  constructor(
    private loadingScreenService: LoadingScreenService,
    private factoryService: FactoryService,
    private recordUtils: RecordUtils,
    private utils: Utils,
    private _changeDetectionRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loading = false;
  }

  async submit() {
    if (
      !this.myForm.get('recordName').value ||
      !this.myForm.get('recordAgency').value ||
      !this.myForm.get('recordType').value
    ) {
      alert('Please fill all mandatory fields related to record.');
      return;
    }

    if (this.myForm.get('recordType').value === 'Permit' && !this.myForm.get('typeCode').value) {
      alert('You must select a permit type.');
      return;
    }

    if (!this.links.length && !this.documents.length) {
      alert('A document or link must be added.');
      return;
    }

    this.loadingScreenService.setLoadingState(true, 'main');
    const record = {};

    record['recordName'] = this.myForm.get('recordName').value;
    this.myForm.controls.dateIssued.dirty &&
      (record['dateIssued'] = this.utils.convertFormGroupNGBDateToJSDate(this.myForm.get('dateIssued').value));
    if (
      this.myForm.get('recordType').value === 'ManagementPlan' ||
      this.myForm.get('recordType').value === 'ConstructionPlan'
    ) {
      record['agency'] = this.myForm.get('recordAgency').value;
    } else {
      record['issuingAgency'] = this.myForm.get('recordAgency').value;
    }

    record['recordType'] = this.myForm.get('recordType').value;
    if (record['recordType'] === 'Permit') {
      record['typeCode'] = this.myForm.get('typeCode').value;
    }

    // Fields that are auto populated
    record['_master'] = this.mine._id;
    record['projectName'] = this.mine.name;
    record['mineGuid'] = this.mine._sourceRefId;
    record['issuedTo'] = {
      companyName: this.mine.permittee,
      firstName: null,
      middleName: null,
      lastName: null,
      fullName: null,
      dateOfBirth: null,
      type: 'Company'
    };
    record['sourceSystemRef'] = 'nrpti';
    record['centroid'] = this.mine.location
      ? [this.mine.location.coordinates[0], this.mine.location.coordinates[1]]
      : [0, 0];

    // lookup appropriate schemaName from type value
    const recordSchema = Object.values(Picklists.bcmiRecordTypePicklist).filter(item => {
      return item.displayName === record['recordType'];
    });

    const schemaString = recordSchema[0]._schemaName;

    // BCMI flavour
    record[schemaString] = {};
    if (record['recordType'] === 'Permit') {
      record[schemaString]['typeCode'] = this.myForm.get('typeCode').value;
    }
    // add public if created in collection so isPublished flag is set on master
    if (this.collectionId) {
      record[schemaString]['addRole'] = 'public';
    }
    if (this.returnObjInsteadOfSubmit) {
      record['savePending'] = true;
      this.addedRecord.emit({ record: record, documents: this.documents, links: this.links });
    } else {
      const res = await this.factoryService.createMineRecord(record);
      this.recordUtils.parseResForErrors(res);

      // API responds with the master and BCMI flavour records that were created. First record is the BCMI flavour and second is the master.
      const createdRecord = res && res[0] && res[0].length && res[0][0] && res[0][0].object;
      await this.recordUtils.handleDocumentChanges(
        this.links,
        this.documents,
        [],
        createdRecord[1]._id,
        this.factoryService
      );

      this.resetDocStaging = true;
      this._changeDetectionRef.detectChanges();

      this.addedRecord.emit(res[0][0].object[0]);
    }
    this.myForm.reset();
    this.DatePicker.clearDate();

    this.documents = [];
    this.links = [];
    this.resetDocStaging = false;
    this._changeDetectionRef.detectChanges();

    this.loadingScreenService.setLoadingState(false, 'main');
  }

  convertAcronyms(acronym) {
    return Utils.convertAcronyms(acronym);
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
