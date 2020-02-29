/**
 * Entity data model.
 *
 * @export
 * @class Entity
 */
export class Entity {
  write: string[];
  read: string[];

  type: string;
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
}
