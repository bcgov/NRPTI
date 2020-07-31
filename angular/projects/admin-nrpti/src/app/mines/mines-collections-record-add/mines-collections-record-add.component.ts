import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Picklists, SchemaLists } from '../../../../../common/src/app/utils/record-constants';
import { LoadingScreenService, Utils } from 'nrpti-angular-components';
import { FactoryService } from '../../services/factory.service';
import { RecordUtils } from '../../records/utils/record-utils';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-mines-collections-record-add',
  templateUrl: './mines-collections-record-add.component.html',
  styleUrls: ['./mines-collections-record-add.component.scss']
})
export class MinesCollectionsRecordAddComponent implements OnInit, OnDestroy {
  @Input() mine = null;
  @Input() collectionId = null;
  @Output() addedRecord: EventEmitter<object> = new EventEmitter<object>();

  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  // flags
  public loading = true;
  public resetDocStaging = false;

  // form
  public myForm = new FormGroup(
    {
      recordName: new FormControl(''),
      recordAgency: new FormControl(''),
      dateIssued: new FormControl(''),
      recordType: new FormControl(''),
      documents: new FormControl(''),
      publishBcmi: new FormControl(false)
    }
  );

  // Pick lists
  public recordAgencies = Picklists.agencyPicklist;
  public basicRecordTypeBcmiSubset = SchemaLists.basicRecordTypeBcmiSubset;

  // Documents
  public documents = [];
  public links = [];

  constructor(
    private loadingScreenService: LoadingScreenService,
    private factoryService: FactoryService,
    private recordUtils: RecordUtils,
    private utils: Utils,
    private _changeDetectionRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.loading = false;
  }

  togglePublish(event) {
    this.myForm.get('publishBcmi').setValue(event.checked);
    this._changeDetectionRef.detectChanges();
  }

  submit() {
    this.loadingScreenService.setLoadingState(true, 'main');

    if (
      !this.myForm.get('recordName').value ||
      !this.myForm.get('recordAgency').value ||
      !this.myForm.get('recordType').value
    ) {
      alert('Please fill all manditory fields related to record.');
    }

    const record = {};
    record['recordName'] = this.myForm.get('recordName').value;
    this.myForm.controls.dateIssued.dirty &&
      (record['dateIssued'] = this.utils.convertFormGroupNGBDateToJSDate(this.myForm.get('dateIssued').value));
    record['recordAgency'] = this.myForm.get('recordAgency').value;

    if (this.myForm.get('recordType').value === 'PermitAmendment') {
      record['recordType'] = 'Permit';
      record['typeCode'] = 'AMD';
    } else {
      record['recordType'] = this.myForm.get('recordType').value;
    }

    // Fields that are auto populated
    record['issuedTo'] = {
      type: 'Company',
      companyName: this.mine.permittee
    };
    record['centroid'] = [this.mine.location.coordinates[0], this.mine.location.coordinates[1]];
    record['sourceSystemRef'] = 'nrpti';
    record['projectName'] = this.mine.name;

    // If we are editing a collection, we add right away.
    if (this.collectionId) {
      record['collectionId'] = this.collectionId;
    }

    // BCMI flavour
    if (this.myForm.get('publishBcmi').value) {
      let flavourSchemaName = '';
      if (this.myForm.get('recordType').value === 'PermitAmendment') {
        flavourSchemaName = 'PermitBCMI';
      } else {
        flavourSchemaName = this.myForm.get('recordType').value + 'BCMI';
      }
      record[flavourSchemaName] = { addRole: 'public' };
    }

    let containerName = record['recordType'].charAt(0).toLowerCase() + record['recordType'].slice(1);
    containerName += 's';

    this.factoryService.writeRecord(record, containerName, true).subscribe(async res => {
      this.recordUtils.parseResForErrors(res);
      await this.recordUtils.handleDocumentChanges(
        this.links,
        this.documents,
        [],
        res[0][0].object[0]._id,
        this.factoryService
      );

      this.resetDocStaging = true;
      this._changeDetectionRef.detectChanges();

      this.addedRecord.emit(res[0][0].object[0]);
      this.myForm.reset();

      this.documents = [];
      this.links = [];
      this.resetDocStaging = false;
      this._changeDetectionRef.detectChanges();

      this.loadingScreenService.setLoadingState(false, 'main');
    });
  }


  ngOnDestroy(): void {

    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
