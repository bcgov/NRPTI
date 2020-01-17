import { Component, OnInit } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { Order } from '../../../models/order';
import { Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { FactoryService } from '../../../services/factory.service';

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss']
})
export class OrderDetailComponent implements OnInit {
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  public isLoading = true;
  public isPublishing = false;
  public data: Order;
  public activeTab = 'detail';

  constructor(public route: ActivatedRoute, public router: Router, public factoryService: FactoryService) {}

  ngOnInit() {
    this.route.data.pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: any) => {
      if (!res || !res.order) {
        alert("Uh-oh, couldn't load Order");
        this.router.navigate(['/']);
        return;
      }

      this.data = res.order[0] && new Order(res.order[0].data);

      this.isLoading = false;
    });
  }

  toggleTab(tabLabel: string): void {
    this.activeTab = tabLabel;
  }

  isTabActive(tabLabel: string): boolean {
    return this.activeTab === tabLabel;
  }

  publishOrder(): void {}

  unPublishOrder(): void {}

  isPublished(): boolean {
    return this.data && this.data.read && this.data.read.includes('public');
  }
}
