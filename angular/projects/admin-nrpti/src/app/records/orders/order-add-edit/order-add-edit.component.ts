import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { FormGroup, FormControl } from '@angular/forms';
import { Order } from '../../../models/order';

@Component({
  selector: 'app-order-add-edit',
  templateUrl: './order-add-edit.component.html',
  styleUrls: ['./order-add-edit.component.scss']
})
export class OrderAddEditComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  public loading = true;
  public isEditing = false;
  public currentItem = null;
  public myForm: FormGroup;

  constructor(public route: ActivatedRoute, public router: Router, private _changeDetectionRef: ChangeDetectorRef) {}

  ngOnInit() {
    this.route.data.pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: any) => {
      this.isEditing = Object.keys(res).length === 0 && res.constructor === Object ? false : true;
      if (this.isEditing) {
        if (res) {
          this.currentItem = res.records[0] && new Order(res.records[0].data);
          console.log(this.currentItem);
          this.loading = false;
          this._changeDetectionRef.detectChanges();
        } else {
          alert("Uh-oh, couldn't load edit order");
          this.router.navigate(['/']);
        }
        this.buildForm();
      }
    });
  }

  private buildForm() {
    this.myForm = new FormGroup({
      recordName: new FormControl((this.isEditing && this.currentItem && this.currentItem.recordName) || ''),
      issuingAgency: new FormControl((this.isEditing && this.currentItem && this.currentItem.issuingAgency) || ''),
      author: new FormControl((this.isEditing && this.currentItem && this.currentItem.author) || ''),
      type: new FormControl((this.isEditing && this.currentItem && this.currentItem.type) || ''),
      dateIssued: new FormControl((this.isEditing && this.currentItem && this.currentItem.dateIssued) || ''),
      entityType: new FormControl((this.isEditing && this.currentItem && this.currentItem.entityType) || ''),
      issuedTo: new FormControl((this.isEditing && this.currentItem && this.currentItem.issuedTo) || ''),
      birthDate: new FormControl((this.isEditing && this.currentItem && this.currentItem.birthDate) || ''),
      description: new FormControl((this.isEditing && this.currentItem && this.currentItem.description) || ''),
      centroid: new FormControl((this.isEditing && this.currentItem && this.currentItem.centroid) || ''),
      location: new FormControl((this.isEditing && this.currentItem && this.currentItem.location) || ''),
      nationName: new FormControl((this.isEditing && this.currentItem && this.currentItem.nationName) || ''),
      documentAttachments: new FormControl(
        (this.isEditing && this.currentItem && this.currentItem.documentAttachments) || ''
      ),
      sourceSystemRef: new FormControl((this.isEditing && this.currentItem && this.currentItem.sourceSystemRef) || ''),
      legislation: new FormControl((this.isEditing && this.currentItem && this.currentItem.legislation) || ''),
      status: new FormControl((this.isEditing && this.currentItem && this.currentItem.status) || ''),
      project: new FormControl((this.isEditing && this.currentItem && this.currentItem.project) || ''),
      projectSector: new FormControl((this.isEditing && this.currentItem && this.currentItem.projectSector) || ''),
      projectType: new FormControl((this.isEditing && this.currentItem && this.currentItem.projectType) || ''),
      penalty: new FormControl((this.isEditing && this.currentItem && this.currentItem.penalty) || ''),
      courtConvictionOutcome: new FormControl(
        (this.isEditing && this.currentItem && this.currentItem.courtConvictionOutcome) || ''
      ),
      tabSelection: new FormControl((this.isEditing && this.currentItem && this.currentItem.tabSelection) || ''),
      documentId: new FormControl((this.isEditing && this.currentItem && this.currentItem.documentId) || ''),
      documentType: new FormControl((this.isEditing && this.currentItem && this.currentItem.documentType) || ''),
      documentFileName: new FormControl(
        (this.isEditing && this.currentItem && this.currentItem.documentFileName) || ''
      ),
      documentDate: new FormControl((this.isEditing && this.currentItem && this.currentItem.documentDate) || ''),
      dateAdded: new FormControl((this.isEditing && this.currentItem && this.currentItem.dateAdded) || ''),
      dateUpdated: new FormControl((this.isEditing && this.currentItem && this.currentItem.dateUpdated) || ''),
      sourceDateAdded: new FormControl((this.isEditing && this.currentItem && this.currentItem.sourceDateAdded) || ''),
      sourceDateUpdated: new FormControl(
        (this.isEditing && this.currentItem && this.currentItem.sourceDateUpdated) || ''
      )
    });
  }

  subtypeSelected(subtype) {
    console.log(subtype);
  }

  navigateToDetails() {
    this.router.navigate(['records', 'orders', this.currentItem._id, 'detail']);
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
