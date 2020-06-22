import { Component, OnInit, EventEmitter, Input, ChangeDetectorRef, OnDestroy, Output } from '@angular/core';

import { FilterSection } from '../../../../common/src/app/models/document-filter';
import { Subject } from 'rxjs';
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

  @Output() filtersReset: EventEmitter<void> = new EventEmitter<void>();

  public resetControls: EventEmitter<void> = new EventEmitter<void>();

  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  readonly minDate = new Date('01-01-1900'); // first app created
  readonly maxDate = new Date(); // today

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

  public systemRefControl = null;
  public systemRefOptions = Picklists.sourceSystemRefPicklist;

  constructor(private _changeDetectionRef: ChangeDetectorRef) {}

  public ngOnInit() {
    this.systemRefControl = this.formGroup.get(['sourceSystemRef']);
    this._changeDetectionRef.detectChanges();
  }

  clearSearchFilters() {
    this.resetControls.emit();
    this.filtersReset.emit();
    this.formGroup.reset();
  }

  resetFilter(filterName) {
    this.formGroup.get([filterName]).setValue(null);
    this._changeDetectionRef.detectChanges();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
