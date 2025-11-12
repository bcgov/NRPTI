import { Component } from '@angular/core';
import { Subject } from 'rxjs';
import { BsModalRef } from 'ngx-bootstrap/modal';

export interface ConfirmData {
  title: string;
  message: string;
  okOnly: boolean;
}

@Component({
  standalone: false,
  templateUrl: './confirm.component.html',
  styleUrls: ['./confirm.component.scss']
})
export class ConfirmComponent implements ConfirmData {
  title = 'Confirm';
  message = 'Are you sure?';
  okOnly = false;

  public onClose: Subject<boolean> = new Subject<boolean>();

  constructor(public bsModalRef: BsModalRef) {}

  confirm() {
    // we set dialog result as true on click of confirm button, then we can get dialog result from caller code
    this.onClose.next(true);
    this.bsModalRef.hide();
  }

  cancel() {
    this.onClose.next(false);
    this.bsModalRef.hide();
  }
}
