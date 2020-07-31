import { Legislation } from '../master/common-models/legislation';
import { Entity } from '../master/common-models/entity';
import { RecordModel } from '../record-model-abstract';

/**
 * Annual Report data model.
 *
 * @export
 * @class AnnualReportBCMI
 */
export class AnnualReportBCMI extends RecordModel {
  issuedTo: Entity;
  dateIssued: Date;
  issuingAgency: string;
  legislation: Legislation;
  legislationDescription: string;
  documents: object[];
  description: string;
  datePublished: Date;
  publishedBy: string;
  isBcmiPublished: boolean;

  constructor(obj?: any) {
    super(obj);

    this._schemaName = 'AnnualReport';

    this.dateIssued = (obj && obj.dateIssued) || null;
    this.issuingAgency = (obj && obj.issuingAgency) || '';
    this.issuedTo = (obj && obj.issuedTo) || '';
    this.legislation = (obj && obj.legislation && new Legislation(obj.legislation)) || null;
    this.legislationDescription = (obj && obj.legislationDescription) || '';
    this.documents = (obj && obj.documents) || [];

    this.description = (obj && obj.description) || null;

    this.datePublished = (obj && obj.datePublished) || null;
    this.publishedBy = (obj && obj.publishedBy) || '';

    this.isBcmiPublished = (obj && obj.isBcmiPublished) || false;
  }
}
