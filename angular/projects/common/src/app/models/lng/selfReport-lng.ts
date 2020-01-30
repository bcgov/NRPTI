/**
 * SelfReport LNG data model.
 *
 * @export
 * @class SelfReportLNG
 */
export class SelfReportLNG {
  _id: string;
  _schemaName: string;
  _master: string;

  read: string[];
  write: string[];

  relatedPhase: string;
  description: string;

  dateAdded: Date;
  dateUpdated: Date;
  datePublished: Date;

  constructor(obj?: any) {
    this._id = (obj && obj._id) || null;
    this._schemaName = (obj && obj._schemaName) || 'SelfReportLNG';
    this._master = (obj && obj._master) || null;

    this.read = (obj && obj.read) || null;
    this.write = (obj && obj.write) || null;

    this.relatedPhase = (obj && obj.relatedPhase) || null;
    this.description = (obj && obj.description) || null;

    this.dateAdded = (obj && obj.dateAdded) || null;
    this.dateUpdated = (obj && obj.dateUpdated) || null;
    this.datePublished = (obj && obj.datePublished) || null;
  }
}
