/**
 * BCMI collection data model.
 *
 * @export
 * @class CollectionBCMI
 */
export class CollectionBCMI {
  _id: string;
  _schemaName: string;
  _master: string;

  read: string[];
  write: string[];

  name: string;
  date: Date;
  project: string;
  type: string;
  agency: string;
  records: string[];

  dateAdded: Date;
  dateUpdated: Date;
  datePublished: Date;

  addedBy: string;
  updatedBy: string;
  publishedBy: string;

  constructor(obj?: any) {
    this._id = (obj && obj._id) || null;
    this._schemaName = (obj && obj._schemaName) || 'CollectionBCMI';
    this._master = (obj && obj._master) || null;

    this.read = (obj && obj.read) || null;
    this.write = (obj && obj.write) || null;

    this.name = (obj && obj.name) || '';
    this.date = (obj && obj.date) || null;
    this.project = (obj && obj.project) || null;
    this.type = (obj && obj.type) || '';
    this.agency = (obj && obj.agency) || '';
    this.records = (obj && obj.records) || [];

    this.dateAdded = (obj && obj.dateAdded) || null;
    this.dateUpdated = (obj && obj.dateUpdated) || null;
    this.datePublished = (obj && obj.datePublished) || null;

    this.addedBy = (obj && obj.addedBy) || '';
    this.updatedBy = (obj && obj.updatedBy) || '';
    this.publishedBy = (obj && obj.publishedBy) || '';
  }
}
