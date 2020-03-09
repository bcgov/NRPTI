import { Component, Input, OnInit, ChangeDetectorRef, SimpleChanges, OnChanges } from '@angular/core';
import { Penalty } from '../../models/master/common-models/penalty';

@Component({
  selector: 'app-penalty-detail-admin',
  templateUrl: './penalty-detail.component.html',
  styleUrls: ['./penalty-detail.component.scss']
})
export class PenaltyDetailComponent implements OnInit, OnChanges {
  @Input() data: Penalty[];

  public preparedData = [];

  constructor(public _changeDetectionRef: ChangeDetectorRef) {}

  ngOnInit(): void {
    // this.prepData();

    this._changeDetectionRef.detectChanges();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes && changes.firstChange) {
      return;
    }

    if (changes && changes.data && changes.data.currentValue) {
      this.data = changes.data.currentValue;
    }

    // this.prepData();

    this._changeDetectionRef.detectChanges();
  }

  // /**
  //  * Converts the penalty data array into an array of objects supported by the HTML.
  //  *
  //  * @memberof PenaltyDetailComponent
  //  */
  // prepData() {
  //   this.preparedData =
  //     (this.data &&
  //       this.data.map((penalty: Penalty) => {
  //         return {
  //           penaltyString: penalty.buildPenaltyValueString(),
  //           type: penalty.type,
  //           description: penalty.description
  //         };
  //       })) ||
  //     [];
  // }
}
