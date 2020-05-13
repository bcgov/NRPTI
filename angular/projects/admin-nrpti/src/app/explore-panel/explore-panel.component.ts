import { Component, OnInit, EventEmitter, Input, ChangeDetectorRef, OnDestroy } from '@angular/core';

import { FilterSection } from '../../../../common/src/app/models/document-filter';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IMutliSelectOption } from '../../../../common/src/app/autocomplete-multi-select/autocomplete-multi-select.component';
import { Picklists } from '../../../../common/src/app/utils/record-constants';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-explore-panel',
  templateUrl: './explore-panel.component.html',
  styleUrls: ['./explore-panel.component.scss']
})
export class ExplorePanelComponent implements OnInit, OnDestroy {
  @Input() filterSections: FilterSection[] = []; // document filter sections // used in template
  @Input() formGroup: FormGroup;
  public resetControls: EventEmitter<void> = new EventEmitter<void>();

  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  readonly minDate = new Date('01-01-1900'); // first app created
  readonly maxDate = new Date(); // today

  public textFilterKeys: any[];

  public agencyOptions: IMutliSelectOption[] = Picklists.agencyPicklist.map(value => {
    return { value: value, displayValue: value, selected: false, display: true };
  });
  public activityTypeOptions: IMutliSelectOption[] = Object.values(Picklists.activityTypePicklist).map(item => {
    return { value: item._schemaName, displayValue: item.displayName, selected: false, display: true };
  });
  public actOptions: IMutliSelectOption[] = Picklists.getAllActs().map(value => {
    return { value: value, displayValue: value, selected: false, display: true };
  });
  public regulationOptions: IMutliSelectOption[] = Picklists.getAllRegulations().map(value => {
    return { value: value, displayValue: value, selected: false, display: true };
  });

  public agencyCount = 0;
  public activityTypeCount = 0;
  public actCount = 0;
  public regulationCount = 0;

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
      this._changeDetectionRef.detectChanges();
    });
  }

  clearSearchFilters() {
    this.resetControls.emit();
    this.formGroup.reset();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
