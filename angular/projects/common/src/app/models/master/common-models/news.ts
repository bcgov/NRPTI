export class News {
  write: string[];
  read: string[];

  _id: string;
  _schemaName: string;
  _epicProjectId: string;
  type: string;
  title: string;
  url: string;
  description: string;
  projectName: string;
  date: Date;
  system: string;

  constructor(obj?: any) {
    this.read   = (obj && obj.read)   || null;
    this.write  = (obj && obj.write)  || null;

    this._id            = (obj && obj._id)            || null;
    this._schemaName    = (obj && obj._schemaName)    || null;
    this._epicProjectId = (obj && obj._epicProjectId) || null;
    this.type           = (obj && obj.type)           || null;
    this.title          = (obj && obj.title)          || null;
    this.url            = (obj && obj.url)            || null;
    this.description    = (obj && obj.description)    || null;
    this.projectName    = (obj && obj.projectName)    || null;
    this.date           = (obj && obj.date && new Date(obj.date)) || null;

    switch (this._schemaName) {
      case 'ActivityLNG': {
        this.system = 'lng';
      } break;
      case 'ActivityNRCED': {
        this.system = 'nrced';
      } break;
      default: {
        this.system = '';
      }
    }
  }
}
