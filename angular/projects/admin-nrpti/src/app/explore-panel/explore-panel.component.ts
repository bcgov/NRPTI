import { Component, OnInit, Output, EventEmitter, Input, ChangeDetectorRef, OnDestroy } from '@angular/core';

import { FilterSection } from '../../../../common/src/app/models/document-filter';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-explore-panel',
  templateUrl: './explore-panel.component.html',
  styleUrls: ['./explore-panel.component.scss']
})
export class ExplorePanelComponent implements OnInit, OnDestroy {
  @Input() filterSections: FilterSection[] = []; // document filter sections // used in template

  @Output() updateFilters = new EventEmitter();
  @Output() hideSidePanel = new EventEmitter();

  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  readonly minDate = new Date('01-01-1900'); // first app created
  readonly maxDate = new Date(); // today

  public _dateRangeFromFilter: Date = null;
  public _dateRangeToFilter: Date = null;

  public textFilterKeys: any[];
  public filter = [];

  constructor(private _changeDetectionRef: ChangeDetectorRef, private route: ActivatedRoute) {
    this.textFilterKeys = [];
  }

  public ngOnInit() {
    // For each filter coming in, make the filter bucket array
    this.route.params.pipe(takeUntil(this.ngUnsubscribe)).subscribe(params => {
      const keys = Object.keys(params);
      this.filterSections.forEach(object => {
        // e.g.:
        // object.displayName: Header
        // object.textFilters: Array of elements in the collection
        object.textFilters.forEach(filter => {
          // e.g.:
          // filter.displayName: "EAO/BCOGC"
          // filter.fieldName: "_master.issuingAgency"
          if (keys.includes(filter.fieldName)) {
            this.textFilterKeys[filter.fieldName] = params[filter.fieldName].split(',');
          } else {
            // Not in the param list, make empty array.
            this.textFilterKeys[filter.fieldName] = [];
          }
        });
      });
      if (keys.includes('dateRangeToFilter')) {
        this._dateRangeToFilter = params['dateRangeToFilter'];
      }
      if (keys.includes('dateRangeFromFilter')) {
        this._dateRangeFromFilter = params['dateRangeFromFilter'];
      }
      this._changeDetectionRef.detectChanges();
    });
  }

  isEnabled(name, value) {
    return this.textFilterKeys[name].includes(value);
  }

  dataChanged(enabled, fieldName, fieldValue) {
    if (enabled) {
      this.textFilterKeys[fieldName].push(fieldValue);
    } else {
      // Pop it
      this.textFilterKeys[fieldName] = this.textFilterKeys[fieldName].filter(item => {
        return item !== fieldValue;
      });
    }
    this.applyAllFilters();
  }

  togglePanel() {
    this.hideSidePanel.emit();
  }

  public applyAllFilters() {
    // Only add dateRange* conditionally.
    // tslint:disable-next-line: prefer-const
    let filterQuery = this.textFilterKeys;
    delete filterQuery['dateRangeFromFilter'];
    delete filterQuery['dateRangeToFilter'];

    filterQuery['dateRangeFromFilter'] = this._dateRangeFromFilter ? this._dateRangeFromFilter : undefined;
    filterQuery['dateRangeToFilter'] = this._dateRangeToFilter ? this._dateRangeToFilter : undefined;

    this.updateFilters.emit(filterQuery);
  }

  public clearAllFilters() {
    this._dateRangeFromFilter = undefined;
    this._dateRangeToFilter = undefined;

    Object.keys(this.textFilterKeys).forEach(key => {
      this.textFilterKeys[key] = [];
    });
    this.applyAllFilters();
    this.togglePanel();
    this._changeDetectionRef.detectChanges();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
