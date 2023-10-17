import { Legislation } from './../../models/master/common-models/legislation';
import { Component, OnInit, ChangeDetectorRef, Input, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { Utils as CommonUtils } from './../../utils/utils';

@Component({
  selector: 'app-legislation-list-detail-public',
  templateUrl: './legislation-list-detail.component.html',
  styleUrls: ['./legislation-list-detail.component.scss']
})
export class LegislationListDetailComponent implements OnInit, OnDestroy, OnChanges {
  @Input() data: Legislation[];
  @Input() firstSectionLabel: string;
  @Input() subsequentSectionLabels: string;
  @Input() firstDescriptionLabel: string;
  @Input() subsequentDescriptionLabel: string;

  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

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

  populateTextField(legislation: Legislation) {
    return CommonUtils.buildLegislationString(legislation);
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
