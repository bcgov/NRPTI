import { Component, OnInit, ChangeDetectorRef, Input, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { CourtConvictionNRCED, Document } from '../../../../../../common/src/app/models';
import { FactoryService } from '../../../services/factory.service';
import { Utils as CommonUtils } from '../../../../../../common/src/app/utils/utils';
import { Utils as GlobalUtils } from 'nrpti-angular-components';

@Component({
  selector: 'app-court-conviction-detail',
  templateUrl: './court-conviction-detail.component.html',
  styleUrls: ['./court-conviction-detail.component.scss']
})
export class CourtConvictionDetailComponent implements OnInit, OnDestroy {
  @Input() data: any;

  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  public loading = true;
  public activeTab = 'detail';
  public siteName = '-';

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    public factoryService: FactoryService,
    public _changeDetectionRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    if (this.data) {
      this.data = new CourtConvictionNRCED(this.data);

      // populate documents
      this.getDocuments();
      this.setProjectName();

      this.loading = false;
      this._changeDetectionRef.detectChanges();
      return;
    }

    this.route.data.pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: any) => {
      if (!res || !res.records) {
        alert("Uh-oh, couldn't load court conviction");
        this.router.navigate(['/']);
        return;
      }

      // If data was passed in directly, take it over anything in the route resolver.
      this.data = (res.records[0] && res.records[0].data && new CourtConvictionNRCED(res.records[0].data)) || null;

      // populate documents
      this.getDocuments();

      this.loading = false;
      this._changeDetectionRef.detectChanges();
    });
  }

  getDocuments() {
    if (
      !this.data ||
      !this.data.documents ||
      !this.data.documents.length ||
      CommonUtils.isObject(this.data.documents[0])
    ) {
      return;
    }

    this.factoryService
      .getDocuments(this.data.documents)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((res: any) => {
        if (!res || !res.length) {
          return;
        }

        const documents = (res[0] && res[0].data && res[0].data.searchResults) || [];

        this.data.documents = documents.map(document => {
          return new Document(document);
        });
      });
  }

  setProjectName() {
    if (this.data) {
      if (this.data.projectName) {
        this.siteName = this.data.projectName;
      } else if (this.data.unlistedMine) {
        this.siteName = this.data.unlistedMine;
      } else {
        this.siteName = '-';
      }
    }
  }


  activateTab(tabLabel: string): void {
    this.activeTab = tabLabel;
  }

  isTabActive(tabLabel: string): boolean {
    return this.activeTab === tabLabel;
  }

  displayName(agency) {
    return GlobalUtils.displayNameFull(agency);
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  convertAcronyms(acronym) {
    return GlobalUtils.convertAcronyms(acronym);
  }
}
