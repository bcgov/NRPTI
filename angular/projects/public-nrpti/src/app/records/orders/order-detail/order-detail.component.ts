import { Component, OnInit, ChangeDetectorRef, Input, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { OrderNRCED } from '../../../../../../common/src/app/models';

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

  constructor(public route: ActivatedRoute, public router: Router, public _changeDetectionRef: ChangeDetectorRef) {}

  ngOnInit(): void {
    if (this.data) {
      this.data = new OrderNRCED(this.data);

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

      this.loading = false;
      this._changeDetectionRef.detectChanges();
    });
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
