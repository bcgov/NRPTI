/**
 * Enum of the supported penalty types.
 *
 * @export
 * @enum {number}
 */
export enum PENALTY_TYPE {
  Dollars = 'Dollars',
  Hours = 'Hours',
  Days = 'Days',
  Other = 'Other'
}

export class PenaltyMixedType {
  type: string;
  value: string | number;

  constructor(obj?: any) {
    this.type = (obj && obj.type) || null;
    this.value = (obj && obj.value) || null;
  }
}

/**
 * Penalty schema-field specification.
 *
 * Note: This is not itself a schema.  This is a field of existing schema(s).
 *
 * @class Penalty
 */
export class Penalty {
  penalty: PenaltyMixedType;
  type: string;
  description: string;

  constructor(obj?: any) {
    this.type = (obj && obj.type) || null;
    this.penalty = (obj && obj.penalty && new PenaltyMixedType(obj.penalty)) || null;
    this.description = (obj && obj.description) || null;
  }

  /**
   * Builds the penalty type and value fields into a formatted string.
   *
   * @returns {string} formatted penalty value string, or empty string if no penalty values are set.
   * @memberof Penalty
   */
  public buildPenaltyValueString(): string {
    if (!this.penalty.value) {
      return '';
    }

    switch (this.penalty.type) {
      case PENALTY_TYPE.Dollars:
        return `${this.penalty.value} Dollars`;
      case PENALTY_TYPE.Days:
        return `${this.penalty.value} Days`;
      case PENALTY_TYPE.Hours:
        return `${this.penalty.value} Hours`;
      default:
        return `${this.penalty.value}`;
    }
  }

  /**
   * Builds the Penalty object into a formatted string.
   *
   * @returns {string} formatted penalty string, or empty string if no penalty values are set.
   * @memberof Penalty
   */
  public buildPenaltyString(): string {
    let penaltyString = '';

    const penaltyValueString = this.buildPenaltyValueString();

    if (penaltyValueString) {
      penaltyString += penaltyValueString;
    }

    if (this.type) {
      penaltyString += ` - ${this.type}`;
    }

    if (this.description) {
      penaltyString += ` - ${this.description}`;
    }

    return penaltyString;
  }
}
