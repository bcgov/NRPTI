/**
 * Document data model.
 *
 * @export
 * @class Document
 */
export class Document {
  _id: string;

  write: string[];
  read: string[];

  fileName: string;
  key: string;
  url: string;
  upfile: File;

  addedBy: string;
  dateAdded: Date;

  updatedBy: string;
  dateUpdated: Date;

  constructor(obj?: any) {
    this._id = (obj && obj._id) || null;

    this.read = (obj && obj.read) || null;
    this.write = (obj && obj.write) || null;

    this.fileName = (obj && obj.fileName) || null;
    this.url = (obj && obj.url) || null;
    this.key = (obj && obj.key) || null;

    this.addedBy = (obj && obj.addedBy) || null;
    this.dateAdded = (obj && obj.dateAdded) || null;

    this.updatedBy = (obj && obj.updatedBy) || null;
    this.dateUpdated = (obj && obj.dateUpdated) || null;
  }
}
