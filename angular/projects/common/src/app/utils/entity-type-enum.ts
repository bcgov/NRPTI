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
