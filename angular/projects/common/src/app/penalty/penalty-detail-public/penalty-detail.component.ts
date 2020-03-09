import { Component, OnInit, ChangeDetectorRef, Input, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
// import { Utils as CommonUtils } from '../../utils/utils';
import { Penalty } from '../../models/master/common-models/penalty';

@Component({
  selector: 'app-penalty-detail-public',
  templateUrl: './penalty-detail.component.html',
  styleUrls: ['./penalty-detail.component.scss']
})
export class PenaltyDetailComponent implements OnInit, OnDestroy, OnChanges {
  @Input() data: Penalty[];

  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  public activeTab = 'detail';

  // public preparedPenaltyStrings: string[] = [];

  constructor(public route: ActivatedRoute, public router: Router, public _changeDetectionRef: ChangeDetectorRef) {}

  ngOnInit(): void {
    // this.prepTextFields();

    this._changeDetectionRef.detectChanges();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes && changes.firstChange) {
      return;
    }

    if (changes && changes.data && changes.data.currentValue) {
      // this.prepTextFields();

      this._changeDetectionRef.detectChanges();
    }
  }

  // prepTextFields() {
  //   if (this.data && this.data.length) {
  //     this.preparedPenaltyStrings = [];

  //     this.data.forEach(penalty => {
  //       this.preparedPenaltyStrings.push(CommonUtils.buildPenaltyString(new Penalty(penalty)));
  //     });
  //   }
  // }

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
