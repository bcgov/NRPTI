import { Legislation } from '../master/common-models/legislation';
import { Entity } from '../master/common-models/entity';
import { RecordModel } from '../record-model-abstract';

/**
 * Dam Safety inspection data model.
 *
 * @export
 * @class DamSafetyInspection
 */
export class DamSafetyInspection extends RecordModel {
  issuedTo: Entity;
  dateIssued: Date;
  issuingAgency: string;
  legislation: Legislation[];
  documents: object[];
  description: string;
  datePublished: Date;
  publishedBy: string;
  isNrcedPublished: boolean;
  isBcmiPublished: boolean;

  constructor(obj?: any) {
    super(obj);

    this._schemaName = 'DamSafetyInspection';

    this.dateIssued = (obj && obj.dateIssued) || null;
    this.issuingAgency = (obj && obj.issuingAgency) || '';
    this.issuedTo = (obj && obj.issuedTo) || '';
    this.legislation =
      (obj &&
        obj.legislation &&
        obj.legislation.length &&
        obj.legislation.map(legislation => new Legislation(legislation))) ||
      null;
    this.documents = (obj && obj.documents) || [];

    this.description = (obj && obj.description) || null;

    this.datePublished = (obj && obj.datePublished) || null;
    this.publishedBy = (obj && obj.publishedBy) || '';

    this.isNrcedPublished = (obj && obj.isNrcedPublished) || false;
    this.isBcmiPublished = (obj && obj.isBcmiPublished) || false;
  }
}
