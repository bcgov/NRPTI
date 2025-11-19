import { Component, OnInit, ChangeDetectorRef, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup } from '@angular/forms';
import { Picklists, Constants } from '../../../../../../common/src/app/utils/record-constants';
import { IMutliSelectOption } from '../../../../../../common/src/app/autocomplete-multi-select/autocomplete-multi-select.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FactoryService } from '../../../services/factory.service';
/**
 * List page component.
 *
 * @export
 * @class RecordsListComponent
 * @implements {OnInit}
 * @implements {OnDestroy}
 */
@Component({
  standalone: false,
  selector: 'app-search-filters',
  templateUrl: './search-filters.component.html',
  styleUrls: ['./search-filters.component.scss']
})
export class SearchFiltersComponent implements OnInit, OnDestroy {
  @Input() formGroup: FormGroup;
  @Input() reset: EventEmitter<any>;

  @Output() closeButton: EventEmitter<void> = new EventEmitter<void>();
  @Output() clearKeywordSearch: EventEmitter<void> = new EventEmitter<void>();

  private ngUnsubscribe: Subject<void> = new Subject<void>();

  public loading = true;
  public resetControls: EventEmitter<void> = new EventEmitter<void>();
  public activityTypeOptions: IMutliSelectOption[] = Object.values(Picklists.activityTypePicklistNRCED).map(item => {
    return { value: item._schemaName, displayValue: item.displayName, selected: false, display: true };
  });
  public allActs: any[]
  public allActsProcessed: any[]
  public actOptions: IMutliSelectOption[]
  public regulationOptions: IMutliSelectOption[]

  public agencyCount = 0;
  public activityTypeCount = 0;
  public actCount = 0;
  public regulationCount = 0;

  public datepickerMinDate = Constants.DatepickerMinDate;

  constructor(
    public router: Router,
    public route: ActivatedRoute,
    private _changeDetectionRef: ChangeDetectorRef,
    private factoryService: FactoryService
  ) {
    this.allActs = Picklists.getAllActs(this.factoryService);
    this.allActsProcessed = Object.keys(this.allActs).sort((a, b) => a.localeCompare(b));
    this.actOptions = this.allActsProcessed.map(value => {
    return { value: value, displayValue: value, selected: false, display: true };
  });
    this.regulationOptions = Picklists.getAllRegulations(this.factoryService).map(value => {
    return { value: value, displayValue: value, selected: false, display: true };
  });
  }

  ngOnInit(): void {
    this.loading = false;

    if (this.reset) {
      (this.reset as any).pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => this.clearSearchFilters());
    }

    this._changeDetectionRef.detectChanges();
  }

  clearSearchFilters() {
    this.resetControls.emit();
    this.clearKeywordSearch.emit();
    this.formGroup.reset();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
