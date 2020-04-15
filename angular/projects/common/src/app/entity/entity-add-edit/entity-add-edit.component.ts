import { Component, Input, OnInit, ChangeDetectorRef, SimpleChanges, OnChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import moment from 'moment';
import { Picklists } from '../../../../../admin-nrpti/src/app/utils/constants/record-constants';
import { ENTITY_TYPE } from '../../models/master/common-models/entity';

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

  public anonymousText = '';
  public previousAnonymousValue = null;

  constructor(public _changeDetectionRef: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.updateUI();
  }

  updateUI() {
    this.updateUIType();
    this.resetHiddenFormFields();
    this.updateAnonymity();

    this._changeDetectionRef.detectChanges();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes && changes.firstChange) {
      return;
    }

    if (changes && changes.formGroup && changes.formGroup.currentValue) {
      this.previousAnonymousValue = this.formGroup.get('forceAnonymous').value;
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
      this.formGroup.get('forceAnonymous').reset();
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
      this.formGroup.get('forceAnonymous').reset();
      return;
    }
  }

  /**
   * Updates all values associated with anonymity.
   *
   * @memberof EntityAddEditComponent
   */
  updateAnonymity(manualAnonymousValue: boolean = null): void {
    if (this.formGroup.get('type').value === ENTITY_TYPE.Company) {
      // If type is company, no need to update anonymity
      return;
    }

    const anonymousControl = this.formGroup.get('forceAnonymous');

    // enforce anonymous
    if (this.isAnonymous()) {
      anonymousControl.disable();

      this.updateAnonymousText(true);

      if (!anonymousControl.value) {
        // don't update if the value was already set to true
        anonymousControl.setValue(true);
      }

      return;
    }

    // manually toggle anonymous
    if (manualAnonymousValue !== null) {
      anonymousControl.enable();

      this.updateAnonymousText(manualAnonymousValue);

      anonymousControl.setValue(manualAnonymousValue);

      this.previousAnonymousValue = manualAnonymousValue;
      return;
    }

    // return anonymous value to previous value
    anonymousControl.enable();

    this.updateAnonymousText(this.previousAnonymousValue);

    if (anonymousControl.value !== this.previousAnonymousValue) {
      // don't update if the values already match
      anonymousControl.setValue(this.previousAnonymousValue);
    }
  }

  /**
   * Updates the anonymous text.
   *
   * @param {boolean} isAnonymous True if the record is anonymous, false otherwise.
   * @memberof EntityAddEditComponent
   */
  updateAnonymousText(isAnonymous: boolean): void {
    if (isAnonymous) {
      this.anonymousText = 'Name and documents will not be published';
    } else {
      this.anonymousText = 'Name and documents will be published';
    }
  }

  /**
   * Check if the entity must be anonymous.
   *
   * @returns {boolean} true if the entity must be anonymous, false otherwise.
   * @memberof EntityAddEditComponent
   */
  isAnonymous(): boolean {
    if (this.UIType === ENTITY_TYPE.Company) {
      // companies are not anonymous
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
