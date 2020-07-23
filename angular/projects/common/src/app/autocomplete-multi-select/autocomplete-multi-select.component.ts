import {
  Component,
  Input,
  ViewChild,
  ElementRef,
  OnInit,
  ChangeDetectorRef,
  OnChanges,
  SimpleChanges,
  Output,
  EventEmitter,
  OnDestroy
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export interface IMutliSelectOption {
  /**
   * Value set on the control when an option is selected.
   *
   * @type {string}
   * @memberof IMutliSelectOption
   */
  value: string;
  /**
   * The value displayed in the UI.
   *
   * @type {string}
   * @memberof IMutliSelectOption
   */
  displayValue: string;
  /**
   * True if the value is selected, false otherwise.
   *
   * @type {boolean}
   * @memberof IMutliSelectOption
   */
  selected: boolean;
  /**
   * Whether or not to show this item in the list (re: filtering).
   *
   * @type {boolean}
   * @memberof IMutliSelectOption
   */
  display: boolean;
}

@Component({
  selector: 'app-autocomplete-multi-select',
  templateUrl: './autocomplete-multi-select.component.html',
  styleUrls: ['./autocomplete-multi-select.component.scss']
})
export class AutoCompleteMultiSelectComponent implements OnInit, OnChanges, OnDestroy {
  @Input() control: FormControl;
  @Input() options: IMutliSelectOption[];
  @Input() reset: EventEmitter<any>;
  @Input() placeholderText = 'Begin typing to filter...';
  @Input() useChips = false;

  @Output() numSelected: EventEmitter<number> = new EventEmitter<number>();

  // reference to the <input> element
  @ViewChild('multiAutocompleteFilter', { read: ElementRef }) multiAutocompleteFilter: ElementRef<HTMLInputElement>;

  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  public updatedPaceholderText = '';

  constructor(public _changeDetectionRef: ChangeDetectorRef) { }

  ngOnInit() {
    this.updatedPaceholderText = this.placeholderText;
    this.initializeFormControlValue();

    if (this.reset) {
      this.reset.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => this.resetComponent());
    }

    this.updatePlaceholderTextValue();

    this._changeDetectionRef.detectChanges();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.firstChange) {
      return;
    }

    if (changes.control && changes.control.currentValue) {
      this.control = changes.control.currentValue;

      this.initializeFormControlValue();
    }

    this._changeDetectionRef.detectChanges();
  }

  public initializeFormControlValue() {
    if (!this.control.value) {
      // no initial state to set
      this.options = this.options.map(agency => {
        agency.selected = false;
        return agency;
      });
      return;
    }

    // Populate options initial selected state
    const valuesToSelect = this.control.value.split(',');
    this.options = this.options.map(option => {
      if (valuesToSelect.includes(option.value)) {
        option.selected = true;
      }
      return option;
    });

    // emit number of selected filters
    this.numSelected.emit(this.getSelectedValues().length);
  }

  /**
   * When typing in the input field, filter picklist options.
   *
   * @param {*} event
   * @returns
   * @memberof AutoCompleteMultiSelectComponent
   */
  public filterPicklist(event) {
    if (event.keyCode === 13) {
      // ENTER key handled on keyup
      return;
    }

    this.options = this.getOptionsFromKeywords(event.target.value);
  }

  /**
   * Handle the case where the user has selected an option using the keyboard and enter key.
   *
   * Why? Some unique considerations that aren't an issue when using the mouse to select options.
   *
   * @param {*} event
   * @memberof AutoCompleteMultiSelectComponent
   */
  public handleEnter(event) {
    if (event.keyCode === 13) {
      // Default behaviour is to click the first button in the form, which is not applicable as we don't have a 'submit'
      // button to target.  Searches happen automatically as filters are selected.
      event.preventDefault();

      // Can't seem to assign the IMultiSelectOption object as the mat-option value, so reconstruct it here to pass on.
      // This is only a problem when selecting an option using the keyboard (enter).

      // Select the top option as the closest match
      // But only handle if it isn't selected, otherwise it will be toggled off?
      // ignore the process if the user hits enter without actually typing anything
      if (event.target.value.length > 0) {
        const topOption = this.getOptionsFromKeywords(event.target.value).find(op => op.display && !op.selected);

        const option: IMutliSelectOption = {
          value: topOption.value,
          displayValue: null,
          selected: false,
          display: true
        };

        this.toggleSelection(option);

        // clear the input field, as selected options shouldn't be displayed there
        this.multiAutocompleteFilter.nativeElement.value = '';
        // reset the selected options list
        this.options = this.getOptionsFromKeywords('');
      }
    }
  }

  /**
   * Toggles the 'selected' param of an option
   *
   * @param {IMutliSelectOption} option
   * @memberof AutoCompleteMultiSelectComponent
   */
  public toggleSelection(option: IMutliSelectOption) {
    this.options = this.options.map(agency => {
      if (agency.value === option.value) {
        agency.selected = !agency.selected;
      }
      return agency;
    });

    this.setFormControlValue();

    this.updatePlaceholderTextValue();

    this._changeDetectionRef.detectChanges();
  }

  public updatePlaceholderTextValue() {
    // update the placeholder text
    if (!this.useChips && this.options.filter(op => op.selected).length > 0) {
      this.updatedPaceholderText = '';
      for (const displayedOption of this.options.filter(op => op.selected)) {
        this.updatedPaceholderText += displayedOption.displayValue + ', ';
      }
      this.updatedPaceholderText = this.updatedPaceholderText.slice(0, -2);
    } else {
      this.updatedPaceholderText = this.placeholderText;
    }
  }
  /**
   * Un-selects all options.
   *
   * @memberof AutoCompleteMultiSelectComponent
   */
  public selectNone() {
    this.options = this.options.map(agency => {
      agency.selected = false;
      return agency;
    });

    this.setFormControlValue();

    this.updatePlaceholderTextValue();

    this._changeDetectionRef.detectChanges();
  }

  /**
   * Given a space delimited string of keywords, return all options that contain one or more of the keywords.
   *
   * Note: case insensitive.
   *
   * @param {string} keywordString space delimited string of keywords
   * @returns {string[]} array of agencies
   * @memberof AutoCompleteMultiSelectComponent
   */
  public getOptionsFromKeywords(keywordString: string): IMutliSelectOption[] {
    if (!keywordString) {
      // if no keyword filters, return all options
      return this.options.map(option => {
        option.display = true;
        return option;
      });
    }

    // tokenize keyword string (spaces, commas, semi-colons) and remove any empty tokens
    const keywords = keywordString
      .split(/[\s,;]+/)
      .filter(keyword => keyword)
      .map(keyword => keyword.toLowerCase());

    // filter the list of options against the list of keywords
    return this.options.map(option => {
      option.display = keywords.every(keyword => option.value.toLowerCase().includes(keyword));
      return option;
    });
  }

  public getSelectedValues(): string[] {
    return this.options.filter(option => option.selected).map(option => option.value);
  }

  /**
   * Parses the selected options into an array of strings and assigns it to the form control value.
   *
   * @memberof AutoCompleteMultiSelectComponent
   */
  public setFormControlValue() {
    const selectedOptionValues: string[] = this.getSelectedValues();

    // emit number of selected filters
    this.numSelected.emit(selectedOptionValues.length);

    if (!selectedOptionValues || !selectedOptionValues.length) {
      this.control.reset();
      return;
    }

    this.control.setValue(selectedOptionValues);
  }

  /**
   * Resets this component to its default unset state.
   *
   * @memberof AutoCompleteMultiSelectComponent
   */
  public resetComponent() {
    this.control.reset();

    this.options = this.options.map(option => {
      option.selected = false;
      return option;
    });

    this.numSelected.emit(0);
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  removeChip(option) {
    option.selected = false;
    this.setFormControlValue();
  }

  // for callback pipe filter
  filterOptions(option) {
   return option.selected;
  }
}
