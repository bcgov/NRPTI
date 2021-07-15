import { Legislation } from './common-models/legislation';
import { RecordModel } from '../record-model-abstract';

/**
 * Certificate data model.
 *
 * @export
 * @class Certificate
 */
export class Certificate extends RecordModel {
  _epicProjectId: string;
  _epicMilestoneId: string;

  recordSubtype: string;
  dateIssued: Date;
  issuingAgency: string;
  author: string;
  description: string;
  legislation: Legislation[];
  documents: object[];

  // Fields for saving flavour in API.
  CertificateLNG: object;

  constructor(obj?: any) {
    super(obj);

    this._schemaName = 'Certificate';

    this._epicProjectId = (obj && obj._epicProjectId) || null;
    this._epicMilestoneId = (obj && obj._epicMilestoneId) || null;

    this.recordSubtype = (obj && obj.recordSubtype) || null;
    this.dateIssued = (obj && obj.dateIssued) || null;
    this.issuingAgency = (obj && obj.issuingAgency) || null;
    this.author = (obj && obj.author) || null;
    this.description = (obj && obj.description) || null;
    this.legislation = (obj && obj.legislation && obj.legislation.length &&
      obj.legislation.map(legislation => new Legislation(legislation))) || null;
    this.documents = (obj && obj.documents) || null;
  }
}
