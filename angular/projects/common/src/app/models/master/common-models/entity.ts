/**
 * Enum of the supported entity types.
 *
 * Note: 'NotSet' is not really a supported entity type, and is used instead to indicate that an entity-type has not
 * been set.
 *
 * @export
 * @enum {number}
 */
export enum ENTITY_TYPE {
  Company = 'Company',
  Individual = 'Individual',
  IndividualCombined = 'IndividualCombined',
  NotSet = 'NotSet' // Not a supported type, used to indicate that an entity type has yet to be set.
}

/**
 * Entity data model.
 *
 * @export
 * @class Entity
 */
export class Entity {
  write: string[];
  read: string[];

  type: ENTITY_TYPE.Company | ENTITY_TYPE.Individual | ENTITY_TYPE.IndividualCombined;
  companyName: string;
  firstName: string;
  middleName: string;
  lastName: string;
  fullName: string;
  dateOfBirth: Date;

  constructor(obj?: any) {
    this.read = (obj && obj.read) || null;
    this.write = (obj && obj.write) || null;

    this.type = (obj && obj.type) || null;
    this.companyName = (obj && obj.companyName) || null;
    this.firstName = (obj && obj.firstName) || null;
    this.middleName = (obj && obj.middleName) || null;
    this.lastName = (obj && obj.lastName) || null;
    this.fullName = (obj && obj.fullName) || null;
    this.dateOfBirth = (obj && obj.dateOfBirth) || null;
  }

  /**
   * Builds a formatted entity name string.
   *
   * @returns {string} formatted entity string, or empty string if no entity values are set.
   * @memberof Entity
   */
  public getEntityNameString(): string {
    if (this.type === ENTITY_TYPE.Company) {
      return this.companyName;
    }

    if (this.type === ENTITY_TYPE.IndividualCombined) {
      return this.fullName;
    }

    if (!this.firstName && !this.middleName && !this.lastName) {
      return '';
    }

    if (this.type === ENTITY_TYPE.Individual) {
      let entityString = '';

      const entityNameParts = [];
      if (this.lastName) {
        entityNameParts.push(this.lastName);
      }

      if (this.firstName) {
        entityNameParts.push(this.firstName);
      }

      entityString = entityNameParts.join(', ');

      if (this.middleName) {
        entityString += ` ${this.middleName}`;
      }

      return entityString;
    }
  }
}
