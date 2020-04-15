import { Component, Input, OnInit, ChangeDetectorRef, SimpleChanges, OnChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Picklists } from '../../../../../admin-nrpti/src/app/utils/constants/record-constants';
import { ENTITY_TYPE } from '../../models/master/common-models/entity';
import moment from 'moment';

@Component({
  selector: 'app-entity-add-edit',
  templateUrl: './entity-add-edit.component.html',
  styleUrls: ['./entity-add-edit.component.scss']
})
export class EntityAddEditComponent implements OnInit, OnChanges {
  @Input() formGroup: FormGroup;

  public loading = true;

  public entityTypes = Picklists.entityTypePicklist;

  public ENTITY_TYPE = ENTITY_TYPE; // make available in template
  public UIType: ENTITY_TYPE = null;

  public markedAnonymousHeader = 'Not Anonymous';
  public markedAnonymousText = 'Name and documents will be published';

  constructor(public _changeDetectionRef: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.updateUI();
  }

  updateUI() {
    this.updateUIType();
    this.resetHiddenFormFields();
    this.updateMarkRecordAsAnonymous();

    this._changeDetectionRef.detectChanges();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes && changes.firstChange) {
      return;
    }

    if (changes && changes.formGroup && changes.formGroup.currentValue) {
      this.updateUI();
    }
  }

  /**
   * Determine which UI should be rendered.
   *
   * @returns {void}
   * @memberof EntityAddEditComponent
   */
  updateUIType(): void {
    const currentType = this.formGroup && this.formGroup.get('type').value;

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
   * Reset the form controls for any fields that are hidden in the UI.
   *
   * @returns {void}
   * @memberof EntityAddEditComponent
   */
  resetHiddenFormFields(): void {
    if (this.UIType === ENTITY_TYPE.Company) {
      this.formGroup.get('firstName').reset();
      this.formGroup.get('middleName').reset();
      this.formGroup.get('lastName').reset();
      this.formGroup.get('fullName').reset();
      this.formGroup.get('dateOfBirth').reset();
      this.formGroup.get('markRecordAsAnonymous').reset();
      return;
    }

    if (this.UIType === ENTITY_TYPE.IndividualCombined) {
      this.formGroup.get('companyName').reset();
      this.formGroup.get('firstName').reset();
      this.formGroup.get('middleName').reset();
      this.formGroup.get('lastName').reset();
      return;
    }

    if (this.UIType === ENTITY_TYPE.Individual) {
      this.formGroup.get('companyName').reset();
      this.formGroup.get('fullName').reset();
      return;
    }

    if (this.UIType === ENTITY_TYPE.NotSet) {
      this.formGroup.get('companyName').reset();
      this.formGroup.get('firstName').reset();
      this.formGroup.get('middleName').reset();
      this.formGroup.get('lastName').reset();
      this.formGroup.get('fullName').reset();
      this.formGroup.get('dateOfBirth').reset();
      this.formGroup.get('markRecordAsAnonymous').reset();
      return;
    }
  }

  /**
   * Update the `markRecordAsAnonymous` control.
   *
   * @memberof EntityAddEditComponent
   */
  updateMarkRecordAsAnonymous() {
    this.formGroup.get('markRecordAsAnonymous').setValue(this.isRecordConsideredAnonymous());
  }

  /**
   * Check if the entity information marks the record as anonymous.
   *
   * @returns {boolean} true if the record is marked as anonymous, false otherwise.
   * @memberof EntityAddEditComponent
   */
  isRecordConsideredAnonymous(): boolean {
    if (this.UIType !== ENTITY_TYPE.Individual && this.UIType !== ENTITY_TYPE.IndividualCombined) {
      // only individuals are compared against anonymous business logic
      return false;
    }

    const dateOfBirthControl = this.formGroup.get('dateOfBirth');

    if (!dateOfBirthControl.value) {
      // if no date of birth set, must be anonymous
      return true;
    }

    if (moment().diff(moment(dateOfBirthControl.value), 'years') < 19) {
      // if date of birth indicates a minor, must be anonymous
      return true;
    }

    return false;
  }
}
