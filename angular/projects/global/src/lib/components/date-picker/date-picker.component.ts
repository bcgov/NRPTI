import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
  OnInit,
  EventEmitter,
  OnDestroy
} from '@angular/core';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { FormControl } from '@angular/forms';
import { Utils } from '../../utils/utils';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'lib-date-picker',
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.scss']
})
export class DatePickerComponent implements OnInit, OnChanges, OnDestroy {
  @Input() control: FormControl;
  @Input() isValidate = false;
  @Input() isDisabled = false;
  @Input() minDate: Date = null;
  @Input() maxDate: Date = null;
  @Input() reset: EventEmitter<any>;
  @Input() required = false;

  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  public ngbDate: NgbDateStruct = null;
  public minNgbDate: NgbDateStruct = null;
  public maxNgbDate: NgbDateStruct = null;

  public loading = true;

  constructor(private _changeDetectionRef: ChangeDetectorRef, private utils: Utils) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.minDate && changes.minDate.currentValue) {
      this.minNgbDate = this.utils.convertJSDateToNGBDate(new Date(changes.minDate.currentValue));
    }
    if (changes.maxDate && changes.maxDate.currentValue) {
      this.maxNgbDate = this.utils.convertJSDateToNGBDate(new Date(changes.maxDate.currentValue));
    }

    this.loading = false;
    this._changeDetectionRef.detectChanges();
  }

  ngOnInit() {
    this.ngbDate = this.control.value || null;
    if (this.reset) {
      this.reset.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => this.clearDate());
    }
  }

  onDateChange(ngbDate: NgbDateStruct) {
    this.control.setValue(ngbDate);
    this.control.markAsDirty();
  }

  clearDate() {
    this.ngbDate = null;
    this.control.setValue(null);
    this.control.markAsDirty();
  }

  public isValidDate(date: NgbDateStruct): boolean {
    if (date === null && !this.required) {
      return true;
    } else {
      return date && !isNaN(date.year) && !isNaN(date.month) && !isNaN(date.day);
    }
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
