import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { FormGroup, FormControl } from '@angular/forms';
import { Picklists } from '../../../utils/constants/record-constants';
import { Order } from '../../../../../../common/src/app/models/master';
import { Document } from '../../../../../../common/src/app/models/document';
import { EpicProjectIds } from '../../../utils/constants/record-constants';
import { FactoryService } from '../../../services/factory.service';
import { Utils } from 'nrpti-angular-components';

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
  public lngPublishStatus = 'Unpublished';
  public nrcedPublishStatus = 'Unpublished';
  public lngPublishSubtext = 'Not published';
  public nrcedPublishSubtext = 'Not published';

  // Pick lists
  public orderSubtypesPicklist = Picklists.orderSubtypesPicklist;
  public agenciesPicklist = Picklists.agenciesPicklist;
  public authorsPicklist = Picklists.authorPicklist;
  public outcomeStatusPicklist = Picklists.outcomeStatusPicklist;

  // Documents
  public recordFiles: File[] = [];
  public documents: Document[] = [];

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    private factoryService: FactoryService,
    private utils: Utils,
    private _changeDetectionRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.route.data.pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: any) => {
      this.isEditing = res.breadcrumb !== 'Add Order';
      if (this.isEditing) {
        if (res && res.record && res.record[0] && res.record[0].data) {
          this.currentRecord = res.record[0].data;
          console.log(this.currentRecord);
          this.populateTextFields();
        } else {
          alert('Error: could not load edit order.');
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

      this.lastEditedSubText = `Last Edited on ${this.utils.convertJSDateToString(new Date(this.currentRecord.dateUpdated))}`;
    } else {
      this.lastEditedSubText = `Added on ${this.utils.convertJSDateToString(new Date(this.currentRecord.dateAdded))}`;
    }
    for (const flavour of this.currentRecord.flavours) {
      switch (flavour._schemaName) {
        case ('OrderLNG'):
          this.lngFlavour = flavour;
          this.lngFlavour.read.includes('public') && (this.lngPublishStatus = 'Published');
          this.lngFlavour.read.includes('public') && (this.lngPublishSubtext = `Published on ${this.utils.convertJSDateToString(new Date(this.lngFlavour.datePublished))}`);
          break;
        case ('OrderNRCED'):
          this.nrcedFlavour = flavour;
          this.nrcedFlavour.read.includes('public') && (this.nrcedPublishStatus = 'Published');
          this.nrcedFlavour.read.includes('public') && (this.nrcedPublishSubtext = `Published on ${this.utils.convertJSDateToString(new Date(this.nrcedFlavour.datePublished))}`);
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
        (
          this.currentRecord &&
          this.currentRecord.dateIssued &&
          this.utils.convertJSDateToNGBDate(new Date(this.currentRecord.dateIssued))
        ) ||
        ''
      ),
      issuingAgency: new FormControl((this.currentRecord && this.currentRecord.issuingAgency) || ''),
      author: new FormControl((this.currentRecord && this.currentRecord.author) || ''),
      legislation: new FormControl((this.currentRecord && this.currentRecord.legislation) || ''),
      issuedTo: new FormControl((this.currentRecord && this.currentRecord.issuedTo) || ''),
      projectName: new FormControl((this.currentRecord && this.currentRecord.projectName) || ''),
      location: new FormControl((this.currentRecord && this.currentRecord.location) || ''),
      latitude: new FormControl(
        (
          this.currentRecord &&
          this.currentRecord.centroid &&
          this.currentRecord.centroid[0]
        ) || ''
      ),
      longitude: new FormControl(
        (
          this.currentRecord &&
          this.currentRecord.centroid &&
          this.currentRecord.centroid[1]
        ) || ''
      ),
      outcomeStatus: new FormControl((this.currentRecord && this.currentRecord.outcomeStatus) || ''),
      outcomeDescription: new FormControl((this.currentRecord && this.currentRecord.outcomeDescription) || ''),

      // NRCED
      nrcedSummary: new FormControl((this.currentRecord && this.nrcedFlavour && this.nrcedFlavour.summary) || ''),

      // LNG
      lngDescription: new FormControl((this.currentRecord && this.lngFlavour && this.lngFlavour.description) || '')
    });
  }

  navigateToDetails() {
    this.router.navigate(['records', 'orders', this.currentRecord._id, 'detail']);
  }

  togglePublish(flavour) {
    switch (flavour) {
      case 'lng':
        if (this.lngPublishStatus === 'Unpublished') {
          this.lngPublishStatus = 'Published';
        } else {
          this.lngPublishStatus = 'Unpublished';
        }
        break;
      case 'nrced':
        if (this.nrcedPublishStatus === 'Unpublished') {
          this.nrcedPublishStatus = 'Published';
        } else {
          this.nrcedPublishStatus = 'Unpublished';
        }
        break;
      default:
        break;
    }
    this._changeDetectionRef.detectChanges();
  }

  submit() {
    // Documents
    for (const document of this.documents) {
      const copiedDocument = { ...document };
      delete copiedDocument.upfile;
      console.log('WTF');
      this.factoryService.createDocument(copiedDocument).subscribe(res => {
        console.log('HERES THE RES', res);
        console.log(res.headers);
        this.factoryService.uploadFileToS3(document.upfile, res.presignedData).then(whatever => {
          console.log('THIS IS COMING FROM S3', whatever);
        });
      });
    }

    // TODO
    // _epicProjectId
    // _sourceRefId
    // _epicMilestoneId
    // legislation
    // projectName
    // attachments

    // TODO: For editing we should create an object with only the changed fields.
    const order = new Order({
      recordName: this.myForm.controls.recordName.value,
      recordType: 'Order',
      recordSubtype: this.myForm.controls.recordSubtype.value,
      dateIssued: this.utils.convertFormGroupNGBDateToJSDate(this.myForm.get('dateIssued').value),
      issuingAgency: this.myForm.controls.issuingAgency.value,
      author: this.myForm.controls.author.value,
      issuedTo: this.myForm.controls.issuedTo.value,
      projectName: this.myForm.controls.projectName.value,
      location: this.myForm.controls.location.value,
      centroid: [this.myForm.controls.latitude.value, this.myForm.controls.longitude.value],
      outcomeStatus: this.myForm.controls.outcomeStatus.value,
      outcomeDescription: this.myForm.controls.outcomeDescription.value,
      attachments: this.currentRecord && this.currentRecord.attachments
    });

    // Project name logic
    // If LNG Canada or Coastal Gaslink are selected we need to put it their corresponding OIDs
    if (order.projectName === 'LNG Canada') {
      order._epicProjectId = EpicProjectIds.lngCanadaId;
    } else if (order.projectName === 'Coastal Gaslink') {
      order._epicProjectId = EpicProjectIds.coastalGaslinkId;
    }

    // Publishing logic
    order.OrderNRCED = {
      summary: this.myForm.controls.nrcedSummary.value
    };
    if (this.nrcedPublishStatus === 'Published') {
      order.OrderNRCED['addRole'] = 'public';

    } else if (this.isEditing && this.nrcedPublishStatus === 'Unpublished') {
      order.OrderNRCED['removeRole'] = 'public';
    }

    order.OrderLNG = {
      description: this.myForm.controls.lngDescription.value
    };
    if (this.lngPublishStatus === 'Published') {
      order.OrderLNG['addRole'] = 'public';
    } else if (this.isEditing && (this.lngPublishStatus === 'Unpublished')) {
      order.OrderLNG['removeRole'] = 'public';
    }


    if (!this.isEditing) {
      this.factoryService.createOrder(order).subscribe(res => {
        console.log(res[0][0]);
        this.parResForErrors(res);
        this.router.navigate(['records']);
      });
    } else {
      order._id = this.currentRecord._id;

      this.nrcedFlavour && (order.OrderNRCED['_id'] = this.nrcedFlavour._id);
      this.lngFlavour && (order.OrderLNG['_id'] = this.lngFlavour._id);

      this.factoryService.editOrder(order).subscribe(res => {
        console.log(res[0][0]);
        this.parResForErrors(res);
        this.router.navigate(['records', 'orders', this.currentRecord._id, 'detail']);
      });
    }
  }

  private parResForErrors(res) {
    if (res[0][0].status === 'failure') {
      alert('Master record failed to save.');
    }

    if (res[0][0].flavours) {
      let flavourFailure = false;
      res[0][0].flavours.forEach(flavour => {
        if (flavour.status === 'failure') {
          flavourFailure = true;
        }
      });
      if (flavourFailure) {
        alert('One or more of your flavours have failed to save.');
      }
    }
  }

  public addDocuments(files) {
    if (files) { // safety check
      for (const file of files) {
        if (file) {
          // ensure file is not already in the list

          if (this.documents.find(x => x.fileName === file.name)) {
            // this.snackBarRef = this.snackBar.open('Can\'t add duplicate file', null, { duration: 2000 });
            continue;
          }

          this.recordFiles.push(file);

          const document = new Document();
          document.upfile = file;
          document.fileName = file.name;

          // save document for upload to db when project is added or saved
          this.documents.push(document);
        }
      }
    }
    this._changeDetectionRef.detectChanges();
  }

  public deleteDocument(doc: Document) {
    if (doc && this.documents) { // safety check
      // remove doc from current list
      this.recordFiles = this.recordFiles.filter(item => (item.name !== doc.fileName));
      this.documents = this.documents.filter(item => (item.fileName !== doc.fileName));
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
        this.router.navigate(['records', 'orders', this.currentRecord._id, 'detail']);
      }
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
