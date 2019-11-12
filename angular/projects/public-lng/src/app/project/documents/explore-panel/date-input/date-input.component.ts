import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-date-input',
  templateUrl: './date-input.component.html',
  styleUrls: ['./date-input.component.scss']
})
export class DateInputComponent implements OnChanges {
  @Input() date: Date = null;
  @Input() isValidate = false; // whether to validate (FUTURE)
  @Input() minDate: Date = null;
  @Input() maxDate: Date = null;
  @Output() dateChange = new EventEmitter<Date>();

  public ngbDate: NgbDateStruct = null;
  public minNgbDate: NgbDateStruct = null;
  public maxNgbDate: NgbDateStruct = null;

  constructor() {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.date) {
      this.ngbDate = this.dateToNgbDate(this.date);
    }
    if (changes.minDate) {
      this.minNgbDate = this.dateToNgbDate(this.minDate);
    }
    if (changes.maxDate) {
      this.maxNgbDate = this.dateToNgbDate(this.maxDate);
    }
  }

  onDateChg(ngbDate: NgbDateStruct) {
    this.dateChange.emit(ngbDate ? this.ngbDateToDate(this.ngbDate) : null);
  }

  // clear the date
  clearDate() {
    this.ngbDate = null;
    this.onDateChg(this.ngbDate);
  }

  // used in template
  public isValidDate(date: NgbDateStruct): boolean {
    return date && !isNaN(date.year) && !isNaN(date.month) && !isNaN(date.day);
  }

  private dateToNgbDate(date: Date): NgbDateStruct {
    return date ? { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() } : null;
  }

  private ngbDateToDate(date: NgbDateStruct): Date {
    return date ? new Date(date.year, date.month - 1, date.day) : null;
  }
}
