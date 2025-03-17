import { Legislation } from './../../models/master/common-models/legislation';
import { Component, Input, OnInit, ChangeDetectorRef, SimpleChanges, OnChanges } from '@angular/core';
import { Utils as CommonUtils } from './../../utils/utils';
import { FactoryService } from '../../../../../../projects/admin-nrpti/src/app/services/factory.service';

@Component({
  standalone: false,
  selector: 'app-legislation-list-detail-admin',
  templateUrl: './legislation-list-detail.component.html',
  styleUrls: ['./legislation-list-detail.component.scss']
})
export class LegislationListDetailComponent implements OnInit, OnChanges {
  @Input() data: Legislation[];
  @Input() firstSectionLabel: string;
  @Input() subsequentSectionLabels: string;
  @Input() firstDescriptionLabel: string;
  @Input() subsequentDescriptionLabel: string;

  public preparedData = [];

  constructor(public _changeDetectionRef: ChangeDetectorRef, private factoryService: FactoryService) {}

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

  populateTextField(legislation: Legislation) {
    return CommonUtils.buildLegislationString(legislation, this.factoryService);
  }
}
