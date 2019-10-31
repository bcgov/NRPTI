import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import * as _ from 'lodash';
import moment from 'moment';

import { UrlService } from 'app/services/url.service';
import { IDocumentFilters } from '../documents.component';
import { FilterSection, TextFilter } from 'app/models/documentFilter';

@Component({
  selector: 'app-explore-panel',
  templateUrl: './explore-panel.component.html',
  styleUrls: ['./explore-panel.component.scss']
})
export class ExplorePanelComponent implements OnInit {
  @Input() filterSections: FilterSection[] = []; // document filter sections // used in template

  @Output() updateFilters = new EventEmitter(); // to applications component
  @Output() hideSidePanel = new EventEmitter(); // to applications component // used in template

  readonly minDate = moment('1900-01-01').toDate(); // first app created
  readonly maxDate = moment('2100-12-31').toDate(); // today

  public dateRangeFromFilter: Date = null; // applied filters
  public _dateRangeFromFilter: Date = null; // temporary filters for Cancel feature

  public dateRangeToFilter: Date = null; // applied filters
  public _dateRangeToFilter: Date = null; // temporary filters for Cancel feature

  public textFilterKeys: string[] = []; // all supported filters
  public textFilters: object = {}; // applied filters
  public _textFilters: object = {}; // temporary filters for Cancel feature

  constructor(private urlService: UrlService) {}

  public ngOnInit() {
    for (const section of this.filterSections) {
      for (const textFilter of section.textFilters) {
        // set allowed filters
        this.textFilterKeys.push(textFilter.fieldName);

        // set temporary filters
        this._textFilters[textFilter.fieldName] = false;
      }
    }

    // get url filter parameters, if any
    const hasChanges = this.getParameters();

    // notify parent component that we have new filters
    if (hasChanges) {
      this.updateFilters.emit(this.getFilters());
    }
  }

  /**
   * Parses the url for filter values, and updates the applied nd temporary filters accordingly.
   *
   * @private
   * @returns {boolean} true if the url filters differ from the current filters, false otherwise.
   * @memberof ExplorePanelComponent
   */
  private getParameters(): boolean {
    this.dateRangeFromFilter = this.urlService.query('dateRangeFrom')
      ? moment(this.urlService.query('dateRangeFrom')).toDate()
      : null;

    this.dateRangeToFilter = this.urlService.query('dateRangeTo')
      ? moment(this.urlService.query('dateRangeTo')).toDate()
      : null;

    const filterText = (this.urlService.query('filterText') || '').split('|');
    for (const key of this.textFilterKeys) {
      // set applied filters
      this.textFilters[key] = filterText.includes(key);
    }

    // true, if the applied filters, pulled from the url, differ from the temporary filters
    const hasChanges =
      !_.isEqual(this._dateRangeFromFilter, this.dateRangeFromFilter) ||
      !_.isEqual(this._dateRangeToFilter, this.dateRangeToFilter) ||
      !_.isEqual(this._textFilters, this.textFilters);

    // copy all data from applied filters to temporary filters
    this._dateRangeFromFilter = this.dateRangeFromFilter;
    this._dateRangeToFilter = this.dateRangeToFilter;
    this._textFilters = this.textFilters;

    return hasChanges;
  }

  /**
   * Parses the applied filters and returns them as an IDocumentFilters object
   *
   * @returns {IDocumentFilters}
   * @memberof ExplorePanelComponent
   */
  public getFilters(): IDocumentFilters {
    const documentFilters: IDocumentFilters = { dateRangeFrom: null, dateRangeTo: null, textFilters: [] };

    documentFilters.dateRangeFrom = this.dateRangeFromFilter
      ? moment(this.dateRangeFromFilter)
          .startOf('day')
          .toDate()
      : null;

    documentFilters.dateRangeTo = this.dateRangeToFilter
      ? moment(this.dateRangeToFilter)
          .endOf('day')
          .toDate()
      : null;

    _.keys(this.textFilters).forEach(key => {
      if (this.textFilters[key]) {
        documentFilters.textFilters.push(new TextFilter({ fieldName: key }));
      }
    });

    return documentFilters;
  }

  /**
   * Updates the applied filters based on the temporary filters.
   *
   * @param {boolean} [doNotify=true] if True the updateFilters event will be emitted.
   * @memberof ExplorePanelComponent
   */
  public applyAllFilters(doNotify: boolean = true) {
    // apply all temporary filters
    this.dateRangeFromFilter = this._dateRangeFromFilter;
    this.dateRangeToFilter = this._dateRangeToFilter;
    this.textFilters = { ...this._textFilters };

    // save parameters
    this._saveParameters();

    // notify applications component that we have new filters
    if (doNotify) {
      this.updateFilters.emit(this.getFilters());
    }
  }

  /**
   * Saves the current filters as URL parameters
   *
   * @private
   * @memberof ExplorePanelComponent
   */
  private _saveParameters() {
    this.urlService.save(
      'dateRangeFrom',
      this.dateRangeFromFilter && moment(this.dateRangeFromFilter).format('YYYY-MM-DD'),
      false
    );

    this.urlService.save(
      'dateRangeTo',
      this.dateRangeToFilter && moment(this.dateRangeToFilter).format('YYYY-MM-DD'),
      false
    );

    let filterText: string = null;
    this.textFilterKeys.forEach(key => {
      if (this.textFilters[key]) {
        if (!filterText) {
          filterText = key;
        } else {
          filterText += '|' + key;
        }
      }
    });

    this.urlService.save('filterText', filterText, false);
  }

  /**
   * Clear all temporary filters.
   *
   * @param {boolean} [doNotify=true] if True the updateFilters event will be emitted.
   * @memberof ExplorePanelComponent
   */
  public clearAllFilters(doNotify: boolean = true) {
    if (this.arefiltersApplied()) {
      this._dateRangeFromFilter = null;
      this._dateRangeToFilter = null;
      this.textFilterKeys.forEach(key => {
        this._textFilters[key] = false;
      });

      this.applyAllFilters(doNotify);
    }
  }

  /**
   * Return true if at least 1 filter is in use, false otherwise.
   *
   * @returns {boolean}
   * @memberof ExplorePanelComponent
   */
  public arefiltersApplied(): boolean {
    return (
      this.dateRangeFromFilter !== null ||
      this.dateRangeToFilter !== null ||
      this.textFilterKeys.filter(key => this.textFilters[key]).length > 0
    );
  }
}
