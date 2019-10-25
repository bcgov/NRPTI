/**
 * Record data model.
 *
 * @export
 * @class Record
 */
export class Record {
  _id: string;
  isDeleted: boolean;

  constructor(obj?: any) {
    this._id = (obj && obj._id) || null;
    this.isDeleted = (obj && obj.isDeleted) || null;
  }

  /**
   * Return an array of model fields.
   *
   * @static
   * @returns {string[]}
   * @memberof Record
   */
  static getFields(): string[] {
    return ['isDeleted'];
  }
}
