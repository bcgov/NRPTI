import { Component, Input, OnInit, ChangeDetectorRef, SimpleChanges, OnChanges } from '@angular/core';
import { Penalty } from '../../models/master/common-models/penalty';

@Component({
  standalone: false,
  selector: 'app-penalty-detail-admin',
  templateUrl: './penalty-detail.component.html',
  styleUrls: ['./penalty-detail.component.scss']
})
export class PenaltyDetailComponent implements OnInit, OnChanges {
  @Input() data: Penalty[];

  public preparedData = [];

  constructor(public _changeDetectionRef: ChangeDetectorRef) {}

  ngOnInit(): void {
    this._changeDetectionRef.detectChanges();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes && changes.firstChange) {
      return;
    }

    if (changes && changes.data && changes.data.currentValue) {
      this.data = changes.data.currentValue;
    }

    this._changeDetectionRef.detectChanges();
  }
}
