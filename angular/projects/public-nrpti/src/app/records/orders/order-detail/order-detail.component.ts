import { Component, OnInit, ChangeDetectorRef, Input, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { OrderNRCED, Document } from '../../../../../../common/src/app/models';
import { FactoryService } from '../../../services/factory.service';
import { Utils as CommonUtils } from '../../../../../../common/src/app/utils/utils';

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss']
})
export class OrderDetailComponent implements OnInit, OnDestroy {
  @Input() data: any;

  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  public loading = true;
  public activeTab = 'detail';

  public bookmarkURLString = '';

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    public factoryService: FactoryService,
    public _changeDetectionRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (this.data) {
      this.data = new OrderNRCED(this.data);

      // populate documents
      this.getDocuments();

      this.bookmarkURLString = this.getBookmarkURLString();

      this.loading = false;
      this._changeDetectionRef.detectChanges();
      return;
    }

    this.route.data.pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: any) => {
      if (!res || !res.records) {
        alert("Uh-oh, couldn't load order");
        this.router.navigate(['/']);
        return;
      }

      // If data was passed in directly, take it over anything in the route resolver.
      this.data = (res.records[0] && res.records[0].data && new OrderNRCED(res.records[0].data)) || null;

      // populate documents
      this.getDocuments();

      this.bookmarkURLString = this.getBookmarkURLString();

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

  getBookmarkURLString() {
    return `${window.location.href}/orders/${this.data._id}`;
  }

  activateTab(tabLabel: string): void {
    this.activeTab = tabLabel;
  }

  isTabActive(tabLabel: string): boolean {
    return this.activeTab === tabLabel;
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
