import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Picklists } from '../utils/record-constants';
import { Utils } from 'nrpti-angular-components';

@Component({
  selector: 'app-legislation-add-edit',
  templateUrl: './legislation-add-edit.component.html',
  styleUrls: ['./legislation-add-edit.component.scss']
})
export class LegislationAddEditComponent implements OnInit {
  @Input() formGroup: FormGroup;

  @Input() hideSection = false;
  @Input() hideSubSection = false;
  @Input() hideParagraph = false;
  @Input() renderColumns = false;

  // cache acts
  public readonly actsMappedToRegulations: { [key: string]: string[] } = Picklists.legislationActsMappedToRegulations;
  public readonly allActs = Object.keys(this.actsMappedToRegulations).sort();

  // cache regulations
  public readonly regulationsMappedToActs: {
    [key: string]: string[];
  } = Picklists.getLegislationRegulationsMappedToActs();
  public readonly allRegulations = Object.keys(this.regulationsMappedToActs).sort();

  public filteredActs: string[] = [];
  public filteredRegulations: string[] = [];

  public debouncedFilterActsPicklist = this.utils.debounced(200, args => this.filterActsPicklist(args));
  public debouncedFilterRegulationsPicklist = this.utils.debounced(200, args => this.filterRegulationsPicklist(args));

  constructor(public utils: Utils) {}

  ngOnInit(): void {
    this.filteredActs = this.getActsFromKeywords(this.formGroup.controls.act.value);
    this.filteredRegulations = this.getRegulationsFromKeywords(this.formGroup.controls.regulation.value);
  }

  /**
   * When typing in the acts input field, filter acts picklist options.
   *
   * @param {*} event
   * @returns
   * @memberof LegislationAddEditComponent
   */
  filterActsPicklist(event) {
    if (!event.target.value) {
      this.onEmptyAct();
      return;
    }

    if (event.keyCode === 13) {
      // ENTER key pressed to select option, treat this the same as clicking an option
      this.onSelectAct(event.target.value);
      return;
    }

    if (!this.isValidFilterKeyCode(event.keyCode)) {
      // Prevent key presses that aren't characters or backspace or delete from triggering the filtering
      return;
    }

    this.filteredActs = this.getActsFromKeywords(event.target.value);

    if (!this.filteredActs || !this.filteredActs.length) {
      this.onEmptyAct();
    }
  }

  /**
   * When selecting an act value, update the acts/regulations picklists accordingly.
   *
   * @param {string} act
   * @returns
   * @memberof LegislationAddEditComponent
   */
  onSelectAct(act: string = null) {
    if (!act) {
      this.onEmptyAct();
      return;
    }

    // An act was selected, limit the regulations picklist
    this.filteredRegulations = this.getRegulationsForAct(act);

    // Limit the acts picklist to the act as it is an exact match
    this.filteredActs = [act];
  }

  /**
   * Clears the act control if the value is not a known (allowed) act.
   *
   * @memberof LegislationAddEditComponent
   */
  verifyKnownActValue(event) {
    if (event && event.relatedTarget && event.relatedTarget.localName === 'mat-option') {
      // When a user clicks an item from the overlay select drop-down box, the blur event triggers before the control
      // is updated, which runs this function too early.  So, ignore blur events that are triggered by selecting a
      // mat-option element.
      return;
    }

    if (!event) {
      this.formGroup.controls.act.reset();
    }

    if (!this.allActs.includes(event.target.value)) {
      this.formGroup.controls.act.reset();
      // Treat this as if the user chose to clear the value
      this.onSelectAct(null);
    }
  }

  /**
   * When typing in the regulations input field, filter regulation picklist options.
   *
   * @param {*} event
   * @returns
   * @memberof LegislationAddEditComponent
   */
  filterRegulationsPicklist(event) {
    if (!event.target.value) {
      // Field is empty, reset to full list (or partial list if regulation is set)
      if (this.formGroup.controls.act.value) {
        this.filteredRegulations = this.getRegulationsForAct(this.formGroup.controls.act.value);
      } else {
        this.filteredRegulations = this.allRegulations;
      }
      return;
    }

    if (event.keyCode === 13) {
      // ENTER key pressed to select option, treat this the same as clicking an option
      this.onSelectRegulation(event.target.value);
      return;
    }

    if (!this.isValidFilterKeyCode(event.keyCode)) {
      // Prevent key presses that aren't characters or backspace or delete from triggering the filtering
      return;
    }

    this.filteredRegulations = this.getRegulationsFromKeywords(event.target.value);
  }

  /**
   * When selecting a regulation value, update the acts/regulations picklists accordingly.
   *
   * @param {string} regulation
   * @returns
   * @memberof LegislationAddEditComponent
   */
  onSelectRegulation(regulation: string = null) {
    if (!regulation) {
      this.onEmptyRegulation();
      return;
    }

    // A regulation was selected, limit the acts picklist
    this.filteredActs = this.getActsForRegulation(regulation);

    if (this.filteredActs && this.filteredActs.length === 1) {
      // Special case: regulations should always have 1 parent act, so auto-select the parent act.
      this.formGroup.controls.act.setValue(this.filteredActs[0]);
      this.onSelectAct(this.filteredActs[0]);
    }

    // Limit the regulations picklist to the regulation as it is an exact match
    this.filteredRegulations = [regulation];
  }

  /**
   * Clears the regulation control if the value is not a known (allowed) regulation.
   *
   * @memberof LegislationAddEditComponent
   */
  verifyKnownRegulationValue(event) {
    if (event && event.relatedTarget && event.relatedTarget.localName === 'mat-option') {
      // When a user clicks an item from the overlay select drop-down box, the blur event triggers before the control
      // is updated, which runs this function too early.  So, ignore blur events that are triggered by selecting a
      // mat-option element.
      return;
    }

    if (!event) {
      this.formGroup.controls.regulation.reset();
    }

    if (!this.allRegulations.includes(event.target.value)) {
      this.formGroup.controls.regulation.reset();
      // Treat this as if the user chose to clear the value
      this.onSelectRegulation(null);
    }
  }

  /**
   * Given a space delimited string of keywords, return all acts that contain one or more of the keywords.
   *
   * Note: case insensitive.
   *
   * @memberof LegislationAddEditComponent
   * @param {string} keywordString space delimited string of keywords
   * @param {string} acts array of acts to filter. (optional)
   * @returns {string[]} array of acts
   */
  public getActsFromKeywords(keywordString: string): string[] {
    if (!keywordString) {
      // if no keyword filters, return all acts
      return this.filteredActs;
    }

    // by default, search all acts
    let actsToFilter = this.allActs;
    if (this.filteredActs.length && this.formGroup.controls.regulation.value) {
      // if a regulation has already been selected and it has at least 1 parent act, then restrict act keyword filtering
      // to the parent acts.
      actsToFilter = this.filteredActs;
    }

    // tokenize keyword string (spaces, commas, semi-colons) and remove any empty tokens
    const keywords = keywordString
      .split(/[\s,;]+/)
      .filter(keyword => keyword)
      .map(keyword => keyword.toLowerCase());

    // filter the list of acts against the list of keywords
    return actsToFilter.filter(act => keywords.every(keyword => act.toLowerCase().includes(keyword)));
  }

  /**
   * Given a regulation string, return an array of acts that the regulation is under.
   *
   * @memberof LegislationAddEditComponent
   * @param {string} regulation title text of the regulation
   * @returns {string[]} array of acts or empty array
   */
  public getActsForRegulation(regulation: string): string[] {
    if (!regulation) {
      return [];
    }

    return this.regulationsMappedToActs[regulation] || [];
  }

  /**
   * Given a space delimited string of keywords, return all regulations that contain one or more of the keywords.
   *
   * Note: case insensitive.
   *
   * @memberof LegislationAddEditComponent
   * @param {string} keywordString space delimited string of keywords
   * @param {string} regulations array of regulations to filter. (optional)
   * @returns {string[]} array of regulations
   */
  public getRegulationsFromKeywords(keywordString: string): string[] {
    if (!keywordString) {
      // if no keyword filters, return all regulations
      return this.filteredRegulations;
    }

    // by default, search all regulations
    let regulationsToFilter = this.allRegulations;
    if (this.filteredRegulations.length && this.formGroup.controls.act.value) {
      // if an act has already been selected and it has at least 1 child regulation, then restrict regulation keyword
      // filtering to the child regulations.
      regulationsToFilter = this.filteredRegulations;
    }

    // tokenize keyword string (split on spaces, commas, semi-colons) and remove any empty tokens
    const keywords = keywordString
      .split(/[\s,;]+/)
      .filter(keyword => keyword)
      .map(keyword => keyword.toLowerCase());

    // filter the list of acts against the list of keywords
    return regulationsToFilter.filter(regulation =>
      keywords.every(keyword => regulation.toLowerCase().includes(keyword))
    );
  }

  /**
   * Given an act string, return an array of regulations that are under that act.
   *
   * @memberof LegislationAddEditComponent
   * @param {string} act title text of the act
   * @returns {string[]} array of regulations or empty array
   */
  public getRegulationsForAct(act: string): string[] {
    if (!act) {
      return [];
    }

    return this.actsMappedToRegulations[act] || [];
  }

  /**
   * Business logic to run when the act control goes from not empty to empty.
   *
   * @memberof LegislationAddEditComponent
   */
  public onEmptyAct() {
    this.filteredActs = this.allActs;
    // The acts control is empty, so reset the regulations picklist to show all values
    this.filteredRegulations = this.allRegulations;
    // Business Logic: if the act control is cleared, also clear the regulation control
    this.formGroup.controls.regulation.reset();
  }

  /**
   * Business logic to run when the regulation control goes from not empty to empty.
   *
   * @memberof LegislationAddEditComponent
   */
  public onEmptyRegulation() {
    if (this.formGroup.controls.act.value) {
      // if an act has already been selected, then when the regulation is cleared, restrict its select options to child
      // regulations of the act.
      this.filteredRegulations = this.getRegulationsForAct(this.formGroup.controls.act.value);
      return;
    }

    this.filteredRegulations = this.allRegulations;
  }

  /**
   * Returns True if the keyCode should trigger filtering, false otherwise.
   *
   * @param {number} keyCode
   * @returns
   * @memberof LegislationAddEditComponent
   */
  public isValidFilterKeyCode(keyCode: number) {
    if (keyCode !== 8 && keyCode !== 46 && (keyCode < 65 || keyCode > 90)) {
      // Prevent key presses that aren't characters or backspace or delete from triggering the filtering
      return false;
    }

    return true;
  }
}
