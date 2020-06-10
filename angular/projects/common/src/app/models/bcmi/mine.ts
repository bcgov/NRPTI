/**
 * BCMI Mine data model.
 *
 * @export
 * @class Mine
 */
export class Mine {
  // refs, permissions
  _id:                  string;
  _schemaName:          string;
  _sourceRefId:         string;
  read:                 string[];
  write:                string[];
  // attributes
  name:                 string;
  permitNumbers:        string[];
  status:               string;
  type:                 string;
  commodities:          string[];
  tailingsImpoundments: number;
  region:               string;
  location:             object;
  permittee:            string;
  summary:              string;
  description:          string;
  links:                string[];
  // metadata boilerplate
  dateAdded:            Date;
  dateUpdated:          Date;
  datePublished:        Date;
  addedBy:              string;
  updatedBy:            string;
  publishedBy:          string;
  sourceDateAdded:      Date;
  sourceDateUpdated:    Date;
  sourceSystemRef:      string;

  constructor(obj?: any) {
    this._id                  = (obj && obj._id)                  || null;
    this._schemaName          = (obj && obj._schemaName)          || 'Mine';
    this._sourceRefId         = (obj && obj._sourceRefId)         || '';
    this.read                 = (obj && obj.read)                 || null;
    this.write                = (obj && obj.write)                || null;
    // attributes
    this.name                 = (obj && obj.name)                 || '';
    this.permitNumbers        = (obj && obj.permitNumbers)        || [];
    this.status               = (obj && obj.status)               || '';
    this.type                 = (obj && obj.type)                 || '';
    this.commodities          = (obj && obj.commodities)          || [];
    this.tailingsImpoundments = (obj && obj.tailingsImpoundments) || null;
    this.region               = (obj && obj.region)               || '';
    this.location             = (obj && obj.location)             || null;
    this.permittee            = (obj && obj.permittee)            || '';
    this.summary              = (obj && obj.summary)              || '';
    this.description          = (obj && obj.description)          || '';
    this.links                = (obj && obj.links)                || [];
    // metadata boilerplate
    this.dateAdded            = (obj && obj.dateAdded)            || null;
    this.dateUpdated          = (obj && obj.dateUpdated)          || null;
    this.datePublished        = (obj && obj.datePublished)        || null;
    this.addedBy              = (obj && obj.addedBy)              || '';
    this.updatedBy            = (obj && obj.updatedBy)            || '';
    this.publishedBy          = (obj && obj.publishedBy)          || '';
    this.sourceDateAdded      = (obj && obj.sourceDateAdded)      || null;
    this.sourceDateUpdated    = (obj && obj.sourceDateUpdated)    || null;
    this.sourceSystemRef      = (obj && obj.sourceSystemRef)      || '';
  }
}
