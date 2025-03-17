import { Component, OnInit, ChangeDetectorRef, Input, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { Penalty } from '../../models/master/common-models/penalty';

@Component({
  standalone: false,
  selector: 'app-penalty-detail-public',
  templateUrl: './penalty-detail.component.html',
  styleUrls: ['./penalty-detail.component.scss']
})
export class PenaltyDetailComponent implements OnInit, OnDestroy, OnChanges {
  @Input() data: Penalty[];

  private ngUnsubscribe: Subject<void> = new Subject<void>();

  public activeTab = 'detail';

  constructor(public route: ActivatedRoute, public router: Router, public _changeDetectionRef: ChangeDetectorRef) {}

  ngOnInit(): void {
    this._changeDetectionRef.detectChanges();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes && changes.firstChange) {
      return;
    }

    if (changes && changes.data && changes.data.currentValue) {
      this._changeDetectionRef.detectChanges();
    }
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
