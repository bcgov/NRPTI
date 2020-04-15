import { Component, Input, OnInit, ChangeDetectorRef, SimpleChanges, OnChanges } from '@angular/core';
import { Entity, ENTITY_TYPE } from '../../models/master/common-models/entity';

@Component({
  selector: 'app-entity-detail',
  templateUrl: './entity-detail.component.html',
  styleUrls: ['./entity-detail.component.scss']
})
export class EntityDetailComponent implements OnInit, OnChanges {
  @Input() data: Entity;

  public ENTITY_TYPE = ENTITY_TYPE; // make available in template
  public UIType: ENTITY_TYPE = null;

  public isAnonymous = false;

  constructor(public _changeDetectionRef: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.updateUI();
    this.setIsAnonymous();
  }

  updateUI() {
    this.updateUIType();
    this.setIsAnonymous();

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

  /**
   * Sets the isAnonymous flag to true if the entity is not a company and is anonymous (read role array does not
   * contain 'public' role), false otherwise.
   *
   * @memberof EntityDetailComponent
   */
  setIsAnonymous(): void {
    this.isAnonymous = this.data && this.data.type !== ENTITY_TYPE.Company && !this.data.read.includes('public');
  }
}
