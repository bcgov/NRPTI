/**
 * Document data model.
 *
 * @export
 * @class Document
 */
export class Document {
  _id: string;
  _addedBy: string;
  fileName: string;
  key: string;
  url: string;
  upfile: File;

  constructor(obj?: any) {
    this._id = (obj && obj._id) || null;
    this._addedBy = (obj && obj._addedBy) || null;
    this.fileName = (obj && obj.fileName) || null;
    this.url = (obj && obj.url) || null;
    this.key = (obj && obj.key) || null;
  }
}
