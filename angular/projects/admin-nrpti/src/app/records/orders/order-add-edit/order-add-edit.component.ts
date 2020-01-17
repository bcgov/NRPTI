import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { FormGroup, FormControl } from '@angular/forms';
import { Picklists } from '../../../utils/constants/record-constants';
import { Order } from '../../../models/order';
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
  public currentOrder = null;
  public myForm: FormGroup;
  public lngPublishStatus = 'Unpublish';
  public nrcedPublishStatus = 'Unpublish';
  public lngPublishSubtext = 'Not published';
  public nrcedPublishSubtext = 'Not published';

  public orderSubtypesPicklist = Picklists.orderSubtypesPicklist;
  public agenciesPicklist = Picklists.agenciesPicklist;
  public authorsPicklist = Picklists.authorPicklist;
  public outcomeStatusPicklist = Picklists.outcomeStatusPicklist;

  public dateIssued = null;

  constructor(public route: ActivatedRoute, public router: Router, private factoryService: FactoryService, private utils: Utils, private _changeDetectionRef: ChangeDetectorRef) { }

  ngOnInit() {
    this.route.data.pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: any) => {
      !(res.breadcrumb === 'Add Order') && (this.isEditing = true);
      if (this.isEditing) {
        if (res) {
          this.currentOrder = res.order.data;
        } else {
          alert("Error: could not load edit order.");
          this.router.navigate(['/']);
        }
      }
      this.buildForm();
      this.loading = false;
      this._changeDetectionRef.detectChanges();
    });
  }

  private buildForm() {
    this.myForm = new FormGroup({
      // Master
      recordName: new FormControl((this.currentOrder && this.currentOrder.recordName) || ''),
      recordSubtype: new FormControl((this.currentOrder && this.currentOrder.recordSubtype) || ''),
      dateIssued: new FormControl((this.currentOrder && this.currentOrder.dateIssued) || ''),
      issuingAgency: new FormControl((this.currentOrder && this.currentOrder.issuingAgency) || ''),
      author: new FormControl((this.currentOrder && this.currentOrder.author) || ''),
      legislation: new FormControl((this.currentOrder && this.currentOrder.legislation) || ''),
      issuedTo: new FormControl((this.currentOrder && this.currentOrder.issuedTo) || ''),
      projectName: new FormControl((this.currentOrder && this.currentOrder.projectName) || ''),
      location: new FormControl((this.currentOrder && this.currentOrder.location) || ''),
      latitude: new FormControl((this.currentOrder && this.currentOrder.centroid[0]) || ''),
      longitude: new FormControl((this.currentOrder && this.currentOrder.centroid[1]) || ''),
      outcomeStatus: new FormControl((this.currentOrder && this.currentOrder.outcomeStatus) || ''),
      outcomeDescription: new FormControl((this.currentOrder && this.currentOrder.outcomeDescription) || ''),

      // NRCED
      // TODO for edit
      nrcedSummary: new FormControl((this.currentOrder && this.currentOrder.nrcedSummary) || ''),

      // LNG
      // TODO for edit
      lngDescription: new FormControl((this.currentOrder && this.currentOrder.lngDescription) || ''),
    });
  }

  navigateToDetails() {
    this.router.navigate(['records', 'orders', this.currentOrder._id, 'detail']);
  }

  togglePublish(flavour) {
    switch (flavour) {
      case 'lng':
        if (this.lngPublishStatus === 'Unpublish') {
          this.lngPublishStatus = 'Publish';
        } else {
          this.lngPublishStatus = 'Unpublish'
        }
        break;
      case 'nrced':
        if (this.lngPublishStatus === 'Unpublish') {
          this.nrcedPublishStatus = 'Publish';
        } else {
          this.nrcedPublishStatus = 'Unpublish';
        }
        break;
      default:
        break;
    }
  }

  submit() {
    // TODO
    // _epicProjectId
    // _sourceRefId
    // _epicMilestoneId
    // legislation
    // projectName
    // documentURL

    let order = new Order({
      recordName: this.myForm.controls.recordName.value,
      recordSubtype: this.myForm.controls.recordSubtype.value,
      dateIssued: this.utils.convertFormGroupNGBDateToJSDate(this.myForm.get('dateIssued').value),
      issuingAgency: this.myForm.controls.issuingAgency.value,
      author: this.myForm.controls.author.value,
      issuedTo: this.myForm.controls.issuedTo.value,
      location: this.myForm.controls.location.value,
      centroid: [this.myForm.controls.latitude.value, this.myForm.controls.longitude.value],
      outcomeStatus: this.myForm.controls.outcomeStatus.value,
      outcomeDescription: this.myForm.controls.outcomeDescription.value,
    });

    order.OrderNRCED = {
      description: this.myForm.controls.nrcedSummary.value
    }
    this.nrcedPublishStatus === 'Publish' && (order.OrderNRCED['addRole'] = 'public');


    order.OrderLNG = {
      description: this.myForm.controls.lngDescription.value
    }
    this.lngPublishStatus === 'Publish' && (order.OrderLNG['addRole'] = 'public');

    if (!this.isEditing) {
      this.factoryService.createOrder(order)
        .subscribe(res => {
          console.log(res);
          this.router.navigate(['records']);
        });
    }

  }

  cancel() {
    let shouldCancel = confirm("Leaving this page will discard unsaved changes. Are you sure you would like to continue?");
    if (shouldCancel) {
      if (!this.isEditing) {
        this.router.navigate(['records']);
      }
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
