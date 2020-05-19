import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { PageTypes } from '../utils/page-types.enum';
import { SearchService } from 'nrpti-angular-components';
import { ApiService } from '../services/api';

import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  public pageType: PageTypes = PageTypes.HOME;

  public activities: object[] = [];

  constructor(
    private _searchService: SearchService,
    private route: ActivatedRoute,
    private _changeDetectionRef: ChangeDetectorRef,
    private _apiService: ApiService) {}

  ngOnInit() {

    this.activities = [];

    // Subscribe to project changes
    this.route.parent.params.pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      () => {
        this._searchService
        .getSearchResults(
          this._apiService.apiPath,
          '',
          ['ActivityLNG'],
          [],
          1, // tableObject.currentPage,
          100000, // tableObject.pageSize,
          '-date', // tableObject.sortBy,
          {},
          false
        )
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((res: any) => {
          if (res && res[0] && res[0].data.meta.length > 0) {
            this.activities = res[0].data.searchResults;
            this._changeDetectionRef.detectChanges();
          }
        });
      });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
