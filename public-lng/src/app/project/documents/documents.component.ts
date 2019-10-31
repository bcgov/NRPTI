import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import * as _ from 'lodash';
import moment from 'moment';

import { ExplorePanelComponent } from './explore-panel/explore-panel.component';
import { Document } from 'app/models/document';
import { DocumentHeader } from 'app/models/documentHeader';
import { FilterSection, TextFilter } from 'app/models/documentFilter';
import { PageTypes } from 'app/utils/page-types.enum';
import { DataService } from 'app/services/data.service';

export interface IDocumentFilters {
  dateRangeFrom: Date;
  dateRangeTo: Date;
  textFilters: TextFilter[];
}

/**
 * Documents component.
 * Displays a list of documents, including filter side panel.
 *
 * @export
 * @class DocumentsComponent
 * @implements {OnInit}
 */
@Component({
  selector: 'app-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.scss']
})
export class DocumentsComponent implements OnInit {
  @Input() pageType: PageTypes;
  @ViewChild('explorePanel') explorePanel: ExplorePanelComponent;

  public id: number;

  public headers: DocumentHeader[] = [];
  public filters: IDocumentFilters = { dateRangeFrom: null, dateRangeTo: null, textFilters: [] };
  public filterSections: FilterSection[] = [];
  public documents: Document[] = [];
  public allDocumentsCount = 0;

  public sortColumn = 'date';
  public sortDirection = -1;

  public documentCountMessage = 'Total Results: ';

  public isFilterPanelVisible = false;

  constructor(private dataService: DataService, public route: ActivatedRoute) {}

  ngOnInit() {
    this.route.parent.params.subscribe(params => {
      this.id = params.id;

      const filtersJSON = this.dataService.getDocumentFilters(this.id, this.pageType);

      for (const sectionJSON of filtersJSON) {
        this.filterSections.push(new FilterSection(sectionJSON));
      }

      this.filterDocuments();
    });
  }

  /**
   * Updates the total results message.  THis string can be displayed as is.
   *
   * @memberof DocumentsComponent
   */
  public updateDocumentCountMessage() {
    this.documentCountMessage = `Displaying ${this.documents.length} of ${this.allDocumentsCount} documents.`;
  }

  /**
   * Updates the document filters:
   * - Updates the filters object.
   * - Updates the documents array, which dictates which documents to show on the page.
   * - Updates the total results message.
   *
   * @param {IDocumentFilters} documentFilters
   * @memberof DocumentsComponent
   */
  public updateDocumentFilters(documentFilters: IDocumentFilters) {
    this.filters = { dateRangeFrom: null, dateRangeTo: null, textFilters: [] };

    this.filters.dateRangeFrom = documentFilters.dateRangeFrom;

    this.filters.dateRangeTo = documentFilters.dateRangeTo;

    // TODO this could be removed if the explore-panel component returned TextFilter objects to begin with.
    if (documentFilters.textFilters && documentFilters.textFilters.length) {
      this.filterSections.forEach((filterSection: FilterSection) => {
        filterSection.textFilters.forEach((textFilter: TextFilter) => {
          documentFilters.textFilters.forEach(documentTextFilter => {
            if (textFilter.fieldName === documentTextFilter.fieldName) {
              this.filters.textFilters.push(textFilter);
            }
          });
        });
      });
    }

    this.filterDocuments();
  }

  /**
   * Uses the document filters to filter the list of all documents.
   *
   * @memberof DocumentsComponent
   */
  public filterDocuments() {
    setTimeout(() => {
      const documentHeadersJSON = this.dataService.getDocumentHeaders(this.id, this.pageType);

      this.headers = [];
      for (const header of documentHeadersJSON) {
        this.headers.push(new DocumentHeader(header));
      }

      const documentsJSON = this.dataService.getDocuments(this.id, this.pageType);

      this.documents = [];
      const allDocumentKeys = Object.keys(documentsJSON);

      this.allDocumentsCount = allDocumentKeys.length;

      allDocumentKeys.forEach(key => {
        const doc: Document = new Document(documentsJSON[key]);
        if (this.isFiltered(doc) && this.hasUrl(doc)) {
          this.documents.push(doc);
        }
      });

      this.updateDocumentCountMessage();
    });
  }

  /**
   * Checks to see if there is some form of a link in the url parameter.
   * @param document {Document} The document object
   * @returns {boolean}
   * @memberof DocumentsComponent
   */
  public hasUrl(document: Document): boolean {
    if (document.url && typeof document.url === 'string' && document.url.match(/http/)) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Applies all filters, and returns true if the document is included in the filters, false otherwise.
   *
   * @param {Document} document
   * @returns {boolean}
   * @memberof DocumentsComponent
   */
  public isFiltered(document: Document): boolean {
    const x = this.isDateRangeFiltered(document.date);
    const y = this.isTextFiltered(document);
    return x && y;
  }

  /**
   * Applies date filters and returns true if the date is included in the filters, false otherwise.
   *
   * @param {Date} date
   * @returns {boolean}
   * @memberof DocumentsComponent
   */
  public isDateRangeFiltered(date: Date): boolean {
    if (!this.filters.dateRangeFrom && !this.filters.dateRangeTo) {
      return true;
    }

    if (this.filters.dateRangeFrom && !this.filters.dateRangeTo) {
      return moment(date).isSameOrAfter(moment(this.filters.dateRangeFrom));
    }

    if (!this.filters.dateRangeFrom && this.filters.dateRangeTo) {
      return moment(date).isSameOrBefore(moment(this.filters.dateRangeTo));
    }

    return (
      moment(date).isSameOrAfter(moment(this.filters.dateRangeFrom)) &&
      moment(date).isSameOrBefore(moment(this.filters.dateRangeTo))
    );
  }

  /**
   * Applies a text filter and returns true if the document is included in the filters, false otherwise.
   *
   * @param {string} agency
   * @returns {boolean}
   * @memberof DocumentsComponent
   */
  public isTextFiltered(document: Document): boolean {
    if (!this.filters || !this.filters.textFilters || !this.filters.textFilters.length) {
      return true;
    }

    return (
      this.filters.textFilters.filter((textFilter: TextFilter) => {
        if (!document[textFilter.documentFieldName]) {
          // document doesn't have this field
          // return false to remove it from the filtered results, or true to include it in the filtered results.
          return false;
        }

        return textFilter.documentFieldValues
          .map(x => x.toLowerCase())
          .includes(document[textFilter.documentFieldName].toLowerCase());
      }).length > 0
    );
  }

  /**
   * Toggle Explore side panel open or clos.
   *
   * @memberof DocumentsComponent
   */
  public toggleFilterPanel() {
    this.isFilterPanelVisible = !this.isFilterPanelVisible;

    // this.urlService.setFragment(this.isSidePanelVisible ? 'explore' : null);
  }

  /**
   * Close the Explore Side panel.
   *
   * @memberof DocumentsComponent
   */
  public closeSidePanel() {
    this.isFilterPanelVisible = false;
    // this.urlService.setFragment(null);
  }

  /**
   * Sets the sort properties (column, direction) used by the OrderBy pipe.
   *
   * @param {string} sortBy
   * @memberof DocumentsComponent
   */
  public sort(sortBy: string) {
    this.sortColumn = sortBy;
    this.sortDirection = this.sortDirection > 0 ? -1 : 1;
  }

  /**
   * Opens a document url.
   *
   * @param {Document} document
   * @memberof DocumentsComponent
   */
  public downloadFile(document: Document) {
    if (document.url) {
      window.open(document.url);
    } else {
      // handle real file downloads when documents are hosted
    }
  }
}
