import { Legislation } from './common-models/legislation';
import { Entity } from './common-models/entity';
import { RecordModel } from '../record-model-abstract';

/**
 * Annual Report data model.
 *
 * @export
 * @class AnnualReport
 */
export class AnnualReport extends RecordModel {
  issuedTo: Entity;
  dateIssued: Date;
  issuingAgency: string;
  legislation: Legislation[];
  documents: object[];
  description: string;
  dateAdded: Date;
  dateUpdated: Date;
  datePublished: Date;
  publishedBy: string;
  isBcmiPublished: boolean;

  constructor(obj?: any) {
    super(obj);

    this._schemaName = 'AnnualReport';
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

    this.isBcmiPublished = (obj && obj.isBcmiPublished) || false;
  }
}
