export class CommunicationsPackage {
  write: string[];
  read: string[];
  _id: string;
  _schemaName: string;
  application: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  additionalInfo: any;
  addedBy: string;
  dateAdded: Date;

  constructor(obj?: any) {
    this.read   = (obj && obj.read)   || null;
    this.write  = (obj && obj.write)  || null;

    this._id             = (obj && obj._id)            || null;
    this._schemaName     = (obj && obj._schemaName)    || null;
    this.application     = (obj && obj.application)    || null;
    this.title           = (obj && obj.title)          || null;
    this.description     = (obj && obj.description)    || null;
    this.startDate       = (obj && obj.startDate)      || null;
    this.endDate         = (obj && obj.endDate)        || null;
    this.additionalInfo  = (obj && obj.additionalInfo) || null;
    this.addedBy         = (obj && obj.addedBy)        || null;
    this.dateAdded       = (obj && obj.dateAdded)      || null;
  }
}
