import * as _ from 'lodash';

export class User {
  _id: string;
  username: string;
  displayName: string;
  firstName: string;
  lastName: string;
  password: string;
  roles: string[][] = [[]];

  constructor(obj?: any) {
    this._id = (obj && obj._id) || null;
    this.username = (obj && obj.username) || null;
    this.displayName = (obj && obj.displayName) || null;
    this.firstName = (obj && obj.firstName) || null;
    this.lastName = (obj && obj.lastName) || null;
    this.password = (obj && obj.password) || null;

    // copy roles
    if (obj && obj.roles) {
      this.roles = _.cloneDeep(obj.roles);
    }
  }
}
