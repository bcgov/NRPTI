import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { PageTypes } from '../../utils/page-types.enum';
import { DataService } from '../../services/data.service';
import { ActivatedRoute } from '@angular/router';
import { SearchService } from 'nrpti-angular-components';
import { ApiService } from '../../services/api';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class OverviewComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  public pageType: PageTypes = PageTypes.OVERVIEW;

  public id: string;
  public text: string[];
  public details: object;
  public images: object;
  public activities: object[];

  constructor(
    private dataService: DataService,
    private _changeDetectionRef: ChangeDetectorRef,
    private route: ActivatedRoute,
    private _searchService: SearchService,
    private _apiService: ApiService
  ) {
    this.route.parent.params.subscribe(params => {
      this.id = params.id;

      this.text = this.dataService.getText(this.id, this.pageType);
      this.details = this.dataService.getDetails(this.id, this.pageType);
      this.images = this.dataService.getImages(this.id, this.pageType);
    });
  }

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
          {
            // Select either LNG Canada or Coastal Gaslink based on route.
            _epicProjectId: this.id === '1' ? '588511d0aaecd9001b826192' : '588511c4aaecd9001b825604'
          },
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

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
