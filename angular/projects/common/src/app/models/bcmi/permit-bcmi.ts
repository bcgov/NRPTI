import { Legislation } from '../master/common-models/legislation';
import { Entity } from '../master/common-models/entity';
import { RecordModel } from '../record-model-abstract';

/**
 * Permit BCMI data model.
 *
 * @export
 * @class PermitBCMI
 */
export class PermitBCMI extends RecordModel {
  _epicProjectId: string;
  _epicMilestoneId: string;

  recordSubtype: string;
  dateIssued: Date;
  issuingAgency: string;
  issuedTo: Entity;
  legislation: Legislation[];
  documents: object[];

  description: string;

  datePublished: Date;
  publishedBy: string;

  permitStatusCode: string;
  amendmentStatusCode: string;
  typeCode: string;
  originalPermit: string;

  constructor(obj?: any) {
    super(obj);

    this._schemaName = 'PermitBCMI';

    this._epicProjectId = (obj && obj._epicProjectId) || '';
    this._epicMilestoneId = (obj && obj._epicMilestoneId) || '';

    this.recordSubtype = (obj && obj.recordSubtype) || '';
    this.dateIssued = (obj && obj.dateIssued) || null;
    this.issuingAgency = (obj && obj.issuingAgency) || '';
    this.legislation = (obj && obj.legislation && obj.legislation.length &&
      obj.legislation.map(legislation => new Legislation(legislation))) || null;
    this.documents = (obj && obj.documents) || [];

    this.description = (obj && obj.description) || null;

    this.datePublished = (obj && obj.datePublished) || null;

    this.permitStatusCode = (obj && obj.permitStatusCode) || null;
    this.amendmentStatusCode = (obj && obj.amendmentStatusCode) || null;
    this.typeCode = (obj && obj.typeCode) || null;
    this.originalPermit = (obj && obj.originalPermit) || null;

    this.publishedBy = (obj && obj.publishedBy) || '';
  }
}
