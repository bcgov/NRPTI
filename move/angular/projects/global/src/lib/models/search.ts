import { Params } from '@angular/router';

import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

export class SearchResults {
  _schemaName: string;
  data: any;

  constructor(search?: any, hostname?: any) {
    this._schemaName = (search && search._schemaName) || 0;
    this.data = (search && search.data) || 0;
  }
}

export class SearchResult {
  data: any;
  totalSearchCount: number;

  constructor(search?: any, hostname?: any) {
    this.data = (search && search.data) || 0;
    this.totalSearchCount = (search && search.totalSearchCount) || 0;
  }
}

export class SearchTerms {
  keywords: string; // comma- or space-delimited list
  dateStart: NgbDateStruct;
  dateEnd: NgbDateStruct;
  dataset: string;
  currentPage: number;
  sortBy: string;
  sortDirection: number;

  constructor(obj?: any) {
    this.keywords = (obj && obj.keywords) || null;
    this.dateStart = (obj && obj.dateStart) || null;
    this.dateEnd = (obj && obj.dateEnd) || null;
    this.dataset = (obj && obj.dataset) || null;
    this.currentPage = (obj && obj.currentPage) || null;
    this.sortBy = (obj && obj.sortBy) || null;
    this.sortDirection = (obj && obj.sortDirection) || null;
  }

  getParams(): Params {
    const params = {};

    if (this.keywords) {
      params['keywords'] = this.keywords;
    }
    if (this.dateStart) {
      params['datestart'] = this.getDateParam(this.dateStart);
    }
    if (this.dateEnd) {
      params['dateend'] = this.getDateParam(this.dateEnd);
    }
    if (this.currentPage) {
      params['currentPage'] = this.currentPage;
    }
    if (this.sortBy) {
      params['sortBy'] = this.sortBy;
    }
    if (this.sortDirection) {
      params['sortDirection'] = this.sortDirection;
    }

    return params;
  }

  private getDateParam(date: NgbDateStruct): string {
    let dateParam = date.year + '-';

    if (date.month < 10) {
      dateParam += '0';
    }
    dateParam += date.month + '-';

    if (date.day < 10) {
      dateParam += '0';
    }
    dateParam += date.day;

    return dateParam;
  }
}
