import { Legislation } from '../master/common-models/legislation';
import { Entity } from '../master/common-models/entity';
import { RecordModel } from '../record-model-abstract';

/**
 * Order LNG data model.
 *
 * @export
 * @class OrderLNG
 */
export class OrderLNG extends RecordModel {
  _epicProjectId: string;
  _epicMilestoneId: string;

  recordSubtype: string;
  dateIssued: Date;
  issuingAgency: string;
  author: string;
  legislation: Legislation[];
  issuedTo: Entity;
  outcomeStatus: string;
  outcomeDescription: string;
  documents: object[];

  description: string;

  datePublished: Date;
  publishedBy: string;

  constructor(obj?: any) {
    super(obj);

    this._schemaName = 'OrderLNG';

    this._epicProjectId = (obj && obj._epicProjectId) || '';
    this._epicMilestoneId = (obj && obj._epicMilestoneId) || '';

    this.recordSubtype = (obj && obj.recordSubtype) || '';
    this.dateIssued = (obj && obj.dateIssued) || null;
    this.issuingAgency = (obj && obj.issuingAgency) || '';
    this.author = (obj && obj.author) || '';
    this.legislation = (obj && obj.legislation && obj.legislation.length &&
      obj.legislation.map(legislation => new Legislation(legislation))) || null;
    this.issuedTo = (obj && obj.issuedTo && new Entity(obj.issuedTo)) || null;
    this.outcomeStatus = (obj && obj.outcomeStatus) || '';
    this.outcomeDescription = (obj && obj.outcomeDescription) || '';
    this.documents = (obj && obj.documents) || [];

    this.description = (obj && obj.description) || null;

    this.datePublished = (obj && obj.datePublished) || null;
    this.publishedBy = (obj && obj.publishedBy) || '';
  }
}
