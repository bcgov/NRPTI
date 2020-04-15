import { Component, Input, OnInit, ChangeDetectorRef, SimpleChanges, OnChanges } from '@angular/core';
import { Entity, ENTITY_TYPE } from '../../models/master/common-models/entity';
import moment from 'moment';

@Component({
  selector: 'app-entity-detail',
  templateUrl: './entity-detail.component.html',
  styleUrls: ['./entity-detail.component.scss']
})
export class EntityDetailComponent implements OnInit, OnChanges {
  @Input() data: Entity;

  public ENTITY_TYPE = ENTITY_TYPE; // make available in template
  public UIType: ENTITY_TYPE = null;

  public markRecordAsAnonymous = false;

  constructor(public _changeDetectionRef: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.updateUI();
  }

  updateUI() {
    this.updateUIType();
    this.markRecordAsAnonymous = this.isRecordConsideredAnonymous();

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
   * Check if the entity information marks the record as anonymous.
   *
   * @returns {boolean} true if the record is marked as anonymous, false otherwise.
   * @memberof EntityDetailComponent
   */
  isRecordConsideredAnonymous(): boolean {
    if (!this.data) {
      return false;
    }

    if (this.data.type !== ENTITY_TYPE.Individual && this.data.type !== ENTITY_TYPE.IndividualCombined) {
      // only individuals are compared against anonymous business logic
      return false;
    }

    if (!this.data.dateOfBirth) {
      // if no date of birth set, must be anonymous
      return true;
    }

    if (moment().diff(moment(this.data.dateOfBirth), 'years') < 19) {
      // if date of birth indicates a minor, must be anonymous
      return true;
    }

    return false;
  }
}
