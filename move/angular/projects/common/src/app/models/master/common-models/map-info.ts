export class MapInfo {
  _id: string;
  _schemaName: string;
  segment: string;
  location: string;
  length: string;
  description: string;
  dateAdded: Date;
  dateUpdated: Date;
  write: string[];
  read: string[];

  constructor(obj?: any) {
    this._id = (obj && obj._id) || null;
    this._schemaName = (obj && obj._schemaName) || null;
    this.segment = (obj && obj.segment) || null;
    this.location = (obj && obj.location) || null;
    this.length = (obj && obj.length) || null;
    this.description = (obj && obj.description) || null;
    this.dateAdded = (obj && obj.dateAdded) || null;
    this.dateUpdated = (obj && obj.dateUpdated) || null;

    this.read = (obj && obj.read) || null;
    this.write = (obj && obj.write) || null;
  }
}
