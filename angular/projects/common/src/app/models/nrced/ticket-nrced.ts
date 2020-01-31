/**
 * Ticket NRCED data model.
 *
 * @export
 * @class TicketNRCED
 */
export class TicketNRCED {
  _id: string;
  _schemaName: string;
  _master: string;

  read: string[];
  write: string[];

  summary: string;

  dateAdded: Date;
  dateUpdated: Date;
  datePublished: Date;

  constructor(obj?: any) {
    this._id = (obj && obj._id) || null;
    this._schemaName = (obj && obj._schemaName) || 'TicketNRCED';
    this._master = (obj && obj._master) || null;

    this.read = (obj && obj.read) || null;
    this.write = (obj && obj.write) || null;

    this.summary = (obj && obj.summary) || null;

    this.dateAdded = (obj && obj.dateAdded) || null;
    this.dateUpdated = (obj && obj.dateUpdated) || null;
    this.datePublished = (obj && obj.datePublished) || null;
  }
}
