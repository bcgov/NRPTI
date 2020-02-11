import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { Utils } from 'nrpti-angular-components';

@Component({
  selector: 'app-date-input',
  templateUrl: './date-input.component.html',
  styleUrls: ['./date-input.component.scss']
})
export class DateInputComponent implements OnChanges {
  @Input() date: Date     = null;
  @Input() isValidate     = false;
  @Input() minDate: Date  = null;
  @Input() maxDate: Date  = null;
  @Output() dateChange    = new EventEmitter<any>();

  public ngbDate: NgbDateStruct     = null;
  public minNgbDate: NgbDateStruct  = null;
  public maxNgbDate: NgbDateStruct  = null;

  constructor(
    private _changeDetectionRef: ChangeDetectorRef,
    private utils: Utils,
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.date && changes.date.currentValue) {
      this.ngbDate = this.utils.convertJSDateToNGBDate(new Date(changes.date.currentValue));
    }
    if (changes.minDate && changes.minDate.currentValue) {
      this.minNgbDate =  this.utils.convertJSDateToNGBDate(new Date(changes.minDate.currentValue));
    }
    if (changes.maxDate && changes.maxDate.currentValue) {
      this.maxNgbDate =  this.utils.convertJSDateToNGBDate(new Date(changes.maxDate.currentValue));
    }
    this._changeDetectionRef.detectChanges();
  }

  onDateChg(ngbDate: NgbDateStruct) {
    this.dateChange.emit(ngbDate ? this.utils.convertFormGroupNGBDateToJSDate(this.ngbDate).toISOString() : null);
  }

  clearDate() {
    this.ngbDate = null;
    this.onDateChg(this.ngbDate);
  }

  public isValidDate(date: NgbDateStruct): boolean {
    return date && !isNaN(date.year) && !isNaN(date.month) && !isNaN(date.day);
  }
}
