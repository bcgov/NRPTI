import { Legislation } from './common-models/legislation';
import { Entity } from './common-models/entity';
import { RecordModel } from '../record-model-abstract';

/**
 * Warning data model.
 *
 * @export
 * @class Warning
 */
export class Warning extends RecordModel {
  _epicProjectId: string;
  _epicMilestoneId: string;

  dateIssued: Date;
  issuingAgency: string;
  author: string;
  legislation: Legislation[];
  issuedTo: Entity;

  outcomeStatus: string; // epic value?
  outcomeDescription: string; // out of scope?
  documents: object[];

  WarningNRCED: object;
  WarningLNG: object;
  isLngPublished: boolean;
  isNrcedPublished: boolean;

  constructor(obj?: any) {
    super(obj);

    this._schemaName = 'Warning';
    this._epicProjectId = (obj && obj._epicProjectId) || null;
    this._epicMilestoneId = (obj && obj._epicMilestoneId) || null;

    this.dateIssued = (obj && obj.dateIssued) || null;
    this.issuingAgency = (obj && obj.issuingAgency) || null;
    this.author = (obj && obj.author) || null;
    this.legislation = (obj && obj.legislation && obj.legislation.length &&
      obj.legislation.map(legislation => new Legislation(legislation))) || null;
    this.issuedTo = (obj && obj.issuedTo && new Entity(obj.issuedTo)) || null;
    this.outcomeStatus = (obj && obj.outcomeStatus) || null;
    this.outcomeDescription = (obj && obj.outcomeDescription) || null;
    this.documents = (obj && obj.documents) || null;
    this.isLngPublished = (obj && obj.isLngPublished) || false;
    this.isNrcedPublished = (obj && obj.isNrcedPublished) || false;
  }
}
