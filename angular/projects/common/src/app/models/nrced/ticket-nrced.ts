import { Legislation } from '../master/common-models/legislation';
import { Entity } from '../master/common-models/entity';
import { Penalty } from '../master/common-models/penalty';

/**
 * Ticket NRCED data model.
 *
 * @export
 * @class TicketNRCED
 */
export class TicketNRCED {
  _id: string;
  _schemaName: string;

  _epicProjectId: string;
  _sourceRefId: string;
  _epicMilestoneId: string;

  read: string[];
  write: string[];

  recordType: string;
  dateIssued: Date;
  issuingAgency: string;
  author: string;
  legislation: Legislation;
  offence: string;
  issuedTo: Entity;
  projectName: string;
  location: string;
  centroid: number[];
  penalties: Penalty;
  documents: object[];

  summary: string;

  dateAdded: Date;
  dateUpdated: Date;
  datePublished: Date;

  addedBy: string;
  updatedBy: string;
  publishedBy: string;

  sourceDateAdded: Date;
  sourceDateUpdated: Date;
  sourceSystemRef: string;

  constructor(obj?: any) {
    this._id = (obj && obj._id) || null;
    this._schemaName = (obj && obj._schemaName) || 'TicketNRCED';

    this._epicProjectId = (obj && obj._epicProjectId) || '';
    this._sourceRefId = (obj && obj._sourceRefId) || '';
    this._epicMilestoneId = (obj && obj._epicMilestoneId) || '';

    this.read = (obj && obj.read) || null;
    this.write = (obj && obj.write) || null;

    this.recordType = (obj && obj.recordType) || '';
    this.dateIssued = (obj && obj.dateIssued) || null;
    this.issuingAgency = (obj && obj.issuingAgency) || '';
    this.author = (obj && obj.author) || '';
    this.legislation = (obj && obj.legislation && new Legislation(obj.legislation)) || null;
    this.offence = (obj && obj.offence) || '';
    this.issuedTo = (obj && obj.issuedTo && new Entity(obj.issuedTo)) || null;
    this.projectName = (obj && obj.projectName) || '';
    this.location = (obj && obj.location) || '';
    this.centroid = (obj && obj.centroid) || [];
    this.penalties =
      (obj && obj.penalties && obj.penalties.length && obj.penalties.map(penalty => new Penalty(penalty))) || null;
    this.documents = (obj && obj.documents) || [];

    this.summary = (obj && obj.summary) || null;

    this.dateAdded = (obj && obj.dateAdded) || null;
    this.dateUpdated = (obj && obj.dateUpdated) || null;
    this.datePublished = (obj && obj.datePublished) || null;

    this.addedBy = (obj && obj.addedBy) || '';
    this.updatedBy = (obj && obj.updatedBy) || '';
    this.publishedBy = (obj && obj.publishedBy) || '';

    this.sourceDateAdded = (obj && obj.sourceDateAdded) || null;
    this.sourceDateUpdated = (obj && obj.sourceDateUpdated) || null;
    this.sourceSystemRef = (obj && obj.sourceSystemRef) || '';
  }
}
