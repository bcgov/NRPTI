import { Legislation } from './common-models/legislation';
import { Entity } from './common-models/entity';
import { Penalty } from './common-models/penalty';
import { RecordModel } from '../record-model-abstract';

/**
 * Ticket data model.
 *
 * @export
 * @class Ticket
 */
export class Ticket extends RecordModel {
  _epicProjectId: string;
  _epicMilestoneId: string;

  dateIssued: Date;
  issuingAgency: string;
  author: string;
  legislation: Legislation[];
  issuedTo: Entity;
  penalties: Penalty[];
  documents: object[];

  TicketNRCED: object;
  TicketLNG: object;
  isLngPublished: boolean;
  isNrcedPublished: boolean;

  constructor(obj?: any) {
    super(obj);

    this._schemaName = 'Ticket';
    this._epicProjectId = (obj && obj._epicProjectId) || null;
    this._epicMilestoneId = (obj && obj._epicMilestoneId) || null;

    this.dateIssued = (obj && obj.dateIssued) || null;
    this.issuingAgency = (obj && obj.issuingAgency) || null;
    this.author = (obj && obj.author) || null;
    this.legislation = (obj && obj.legislation && obj.legislation.length &&
      obj.legislation.map(legislation => new Legislation(legislation))) || null;
    this.issuedTo = (obj && obj.issuedTo && new Entity(obj.issuedTo)) || null;
    this.penalties =
      (obj && obj.penalties && obj.penalties.length && obj.penalties.map(penalty => new Penalty(penalty))) || null;
    this.documents = (obj && obj.documents) || null;
    this.isLngPublished = (obj && obj.isLngPublished) || false;
    this.isNrcedPublished = (obj && obj.isNrcedPublished) || false;
  }
}
