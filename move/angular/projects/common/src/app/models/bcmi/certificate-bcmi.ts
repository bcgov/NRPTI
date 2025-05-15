import { Legislation } from '../master/common-models/legislation';
import { Entity } from '../master/common-models/entity';
import { RecordModel } from '../record-model-abstract';

/**
 * Certificate BCMI data model.
 *
 * @export
 * @class CertificateBCMI
 */
export class CertificateBCMI extends RecordModel {
  _epicProjectId: string;
  _epicMilestoneId: string;
  recordSubtype: string;
  issuedTo: Entity;
  dateIssued: Date;
  issuingAgency: string;
  legislation: Legislation[];
  documents: object[];
  description: string;
  datePublished: Date;
  publishedBy: string;

  constructor(obj?: any) {
    super(obj);

    this._schemaName = 'CertificateBCMI';

    this._epicProjectId = (obj && obj._epicProjectId) || '';
    this._epicMilestoneId = (obj && obj._epicMilestoneId) || '';
    this._sourceRefId = (obj && obj._sourceRefId) || '';

    this.recordSubtype = (obj && obj.recordSubtype) || '';
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
  }
}
