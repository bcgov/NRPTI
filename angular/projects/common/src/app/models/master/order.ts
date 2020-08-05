import { Legislation } from './common-models/legislation';
import { Entity } from './common-models/entity';
import { RecordModel } from '../record-model-abstract';

/**
 * Order data model.
 *
 * @export
 * @class Order
 */
export class Order extends RecordModel {
  _epicProjectId: string;
  _epicMilestoneId: string;

  recordSubtype: string;
  dateIssued: Date;
  issuingAgency: string;
  author: string;
  description: string;
  legislation: Legislation;
  legislationDescription: string;
  issuedTo: Entity;
  outcomeStatus: string; // epic value?
  outcomeDescription: string; // out of scope?
  documents: object[];

  // Fields for saving flavour in API.
  OrderLNG: object;
  OrderNRCED: object;

  constructor(obj?: any) {
    super(obj);

    this._schemaName = 'Order';
    this._epicProjectId = (obj && obj._epicProjectId) || null;
    this._epicMilestoneId = (obj && obj._epicMilestoneId) || null;

    this.recordSubtype = (obj && obj.recordSubtype) || null;
    this.dateIssued = (obj && obj.dateIssued) || null;
    this.issuingAgency = (obj && obj.issuingAgency) || null;
    this.author = (obj && obj.author) || null;
    this.description = (obj && obj.description) || null;
    this.legislation = (obj && obj.legislation && new Legislation(obj.legislation)) || null;
    this.legislationDescription = (obj && obj.legislationDescription) || '';
    this.issuedTo = (obj && obj.issuedTo && new Entity(obj.issuedTo)) || null;
    this.outcomeStatus = (obj && obj.outcomeStatus) || null;
    this.outcomeDescription = (obj && obj.outcomeDescription) || null;
    this.documents = (obj && obj.documents) || null;
  }
}
