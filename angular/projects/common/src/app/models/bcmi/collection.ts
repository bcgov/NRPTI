/**
 * BCMI Collection data model.
 *
 * @export
 * @class Collection
 */
export class Collection {
  // refs, permissions
  _id:                  string;
  _schemaName:          string;
  read:                 string[];
  write:                string[];
  // attributes
  name:                 string;
  date:                 Date;
  project:              string;
  type:                 string;
  agency:               string;
  records:              string[];
  // metadata boilerplate
  dateAdded:            Date;
  dateUpdated:          Date;
  datePublished:        Date;
  addedBy:              string;
  updatedBy:            string;
  publishedBy:          string;

  constructor(obj?: any) {
    this._id                  = (obj && obj._id)                  || null;
    this._schemaName          = (obj && obj._schemaName)          || 'CollectionBCMI';
    this.read                 = (obj && obj.read)                 || null;
    this.write                = (obj && obj.write)                || null;
    // attributes
    this.name                 = (obj && obj.name)                 || '';
    this.date                 = (obj && obj.date)                 || null;
    this.project              = (obj && obj.project)              || '';
    this.type                 = (obj && obj.type)                 || '';
    this.agency               = (obj && obj.agency)               || '';
    this.records              = (obj && obj.records && obj.records.length && obj.records) || [];
    // metadata boilerplate
    this.dateAdded            = (obj && obj.dateAdded)            || null;
    this.dateUpdated          = (obj && obj.dateUpdated)          || null;
    this.datePublished        = (obj && obj.datePublished)        || null;
    this.addedBy              = (obj && obj.addedBy)              || '';
    this.updatedBy            = (obj && obj.updatedBy)            || '';
    this.publishedBy          = (obj && obj.publishedBy)          || '';
  }
}
