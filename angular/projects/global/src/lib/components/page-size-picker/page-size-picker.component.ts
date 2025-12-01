import { Component, Input, EventEmitter, Output } from '@angular/core';

/**
 * Defines a single page size option.
 *
 * @export
 * @interface pageSizePickerOption
 */
export interface IPageSizePickerOption {
  /**
   * Text to display in the UI.
   *
   * @type {string}
   * @memberof pageSizePickerOption
   */
  displayText?: string;
  /**
   * Page size.
   *
   * @type {number}
   * @memberof pageSizePickerOption
   */
  value: number;
}

/* eslint-disable @angular-eslint/prefer-standalone */
@Component({
  standalone: false,
  selector: 'lib-page-size-picker',
  templateUrl: './page-size-picker.component.html',
  styleUrls: ['./page-size-picker.component.scss']
})
/* eslint-enable @angular-eslint/prefer-standalone */
export class PageSizePickerComponent {
  @Input() isDisabled = false;
  @Input() isHidden = false;
  @Input() sizeOptions: IPageSizePickerOption[] = [];
  @Input() currentPageSize;

  @Output() pageSizeChosen: EventEmitter<IPageSizePickerOption> = new EventEmitter();

  constructor() {}

  getTitle(sizeOption: IPageSizePickerOption) {
    return `Show ${sizeOption.value} records per page`;
  }

  sizeOptionChosen(sizeOption: IPageSizePickerOption) {
    this.pageSizeChosen.emit(sizeOption);
  }

  isSizeOptionActive(sizeOption): boolean {
    return sizeOption.value === this.currentPageSize;
  }
}
