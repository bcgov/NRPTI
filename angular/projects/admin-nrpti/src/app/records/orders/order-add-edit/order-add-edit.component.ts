import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { FormGroup, FormControl } from '@angular/forms';

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

  constructor(public route: ActivatedRoute, public router: Router, private _changeDetectionRef: ChangeDetectorRef) {}

  ngOnInit() {
    this.route.data.pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: any) => {
      this.isEditing = Object.keys(res).length === 0 && res.constructor === Object ? false : true;
      if (this.isEditing) {
        console.log(res);
        if (res) {
          this.currentOrder = res.order.data;
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
      name: new FormControl((this.currentOrder && this.currentOrder.name) || '')
    });
  }

  navigateToDetails() {
    this.router.navigate(['records', 'orders', this.currentOrder._id, 'detail']);
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
