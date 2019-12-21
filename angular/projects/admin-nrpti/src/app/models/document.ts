/**
 * Document data model.
 *
 * @export
 * @class Document
 */
export class Document {
  _id: string;
  _record: string;
  _addedBy: string;
  documentFileName: string;
  displayName: string;
  internalURL: string;
  isDeleted: boolean;
  internalMime: string;

  constructor(obj?: any) {
    this._id = (obj && obj._id) || null;
    this._record = (obj && obj._record) || null;
    this._addedBy = (obj && obj._addedBy) || null;
    this.documentFileName = (obj && obj.documentFileName) || null;
    this.displayName = (obj && obj.displayName) || null;
    this.internalURL = (obj && obj.internalURL) || null;
    this.isDeleted = (obj && obj.isDeleted) || null;
    this.internalMime = (obj && obj.internalMime) || null;
  }
}
