import { Legislation } from '../master/common-models/legislation';
import { Entity } from '../master/common-models/entity';
import { RecordModel } from '../record-model-abstract';

/**
 * Certificate Amendment BCMI data model.
 *
 * @export
 * @class CertificateAmendmentBCMI
 */
export class CertificateAmendmentBCMI extends RecordModel {
  _epicProjectId: string;
  _epicMilestoneId: string;
  recordSubtype: string;
  issuedTo: Entity;
  dateIssued: Date;
  issuingAgency: string;
  legislation: Legislation;
  legislationDescription: string;
  documents: object[];
  description: string;
  datePublished: Date;
  publishedBy: string;
  isLngPublished: boolean;
  isBcmiPublished: boolean;

  constructor(obj?: any) {
    super(obj);

    this._schemaName = 'CertificateAmendmentBCMI';

    this._epicProjectId = (obj && obj._epicProjectId) || '';
    this._epicMilestoneId = (obj && obj._epicMilestoneId) || '';

    this.recordSubtype = (obj && obj.recordSubtype) || '';
    this.dateIssued = (obj && obj.dateIssued) || null;
    this.issuingAgency = (obj && obj.issuingAgency) || '';
    this.issuedTo = (obj && obj.issuedTo) || '';
    this.legislation = (obj && obj.legislation && new Legislation(obj.legislation)) || null;
    this.legislationDescription = (obj && obj.legislationDescription) || '';
    this.documents = (obj && obj.documents) || [];

    this.description = (obj && obj.description) || null;

    this.datePublished = (obj && obj.datePublished) || null;
    this.publishedBy = (obj && obj.publishedBy) || '';

    this.isLngPublished = (obj && obj.isLngPublished) || false;
    this.isBcmiPublished = (obj && obj.isBcmiPublished) || false;
  }
}
