import { Component, OnInit } from '@angular/core';
// import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DialogComponent, DialogService } from 'ng2-bootstrap-modal';
import { Subject } from 'rxjs';
import { BsModalRef } from 'ngx-bootstrap/modal';
export interface ConfirmData {
  title: string;
  message: string;
  okOnly: boolean;
}
export interface IDataModel {
  title: string;
  message: string;
  okOnly: boolean;
}

@Component({
  standalone: false,
  templateUrl: './confirm.component.html',
  styleUrls: ['./confirm.component.scss']
})
export class ConfirmComponent extends DialogComponent<IDataModel, boolean> implements IDataModel {
  title = 'Confirm';
  message = 'Are you sure?';
  okOnly = false;

  constructor(public dialogService: DialogService) {
    super(dialogService);
  }

  confirm() {
    // we set dialog result as true on click of confirm button, then we can get dialog result from caller code
    this.result = true;
    this.close();
  }
}

@Component({
  standalone: false,
  templateUrl: './confirm.component.html',
  styleUrls: ['./confirm.component.scss']
})
export class ConfirmComponentNew implements ConfirmData, OnInit {
  title = 'Confirm';
  message = 'Are you sure?';
  okOnly = false;

  public onClose: Subject<boolean> = new Subject<boolean>();

  constructor(public bsModalRef: BsModalRef) {}

  ngOnInit() {
    console.log('ConfirmComponentNew okOnly =', this.okOnly);
  }

  confirm() {
    this.onClose.next(true);
    this.bsModalRef.hide();
  }

  cancel() {
    this.onClose.next(false);
    this.bsModalRef.hide();
  }
}
