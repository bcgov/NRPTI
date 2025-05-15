import { Component, Input, OnInit, ChangeDetectorRef, SimpleChanges, OnChanges } from '@angular/core';
import { Entity, ENTITY_TYPE } from '../../models/master/common-models/entity';

@Component({
  standalone: false,
  selector: 'app-entity-detail',
  templateUrl: './entity-detail.component.html',
  styleUrls: ['./entity-detail.component.scss']
})
export class EntityDetailComponent implements OnInit, OnChanges {
  @Input() data: Entity;

  public ENTITY_TYPE = ENTITY_TYPE; // make available in template
  public UIType: ENTITY_TYPE = null;

  constructor(public _changeDetectionRef: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.updateUI();
  }

  updateUI() {
    this.updateUIType();

    this._changeDetectionRef.detectChanges();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes && changes.firstChange) {
      return;
    }

    if (changes && changes.data && changes.data.currentValue) {
      this.updateUI();
    }
  }

  /**
   * Determine which UI should be rendered.
   *
   * @returns {void}
   * @memberof EntityDetailComponent
   */
  updateUIType(): void {
    const currentType = this.data && this.data.type;

    if (currentType === ENTITY_TYPE.Company) {
      this.UIType = ENTITY_TYPE.Company;
      return;
    }

    if (currentType === ENTITY_TYPE.IndividualCombined) {
      // Special case: this will only ever be set if imported this way from a datasource that doesn't support
      // separate fields for first name, middle name, and last name.
      this.UIType = ENTITY_TYPE.IndividualCombined;
      return;
    }

    if (currentType === ENTITY_TYPE.Individual) {
      this.UIType = ENTITY_TYPE.Individual;
      return;
    }

    this.UIType = ENTITY_TYPE.NotSet;
  }
}
