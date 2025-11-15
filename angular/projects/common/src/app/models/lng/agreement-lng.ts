import { RecordModel } from '../record-model-abstract';

/**
 * Agreement LNG data model.
 *
 * @export
 * @class AgreementLNG
 */
export class AgreementLNG extends RecordModel {
  _epicProjectId: string;
  _epicMilestoneId: string;

  dateIssued: Date;
  nationName: string;
  declare projectName: string;
  documents: object[];

  description: string;

  datePublished: Date;

  publishedBy: string;

  constructor(obj?: any) {
    super(obj);

    this._schemaName = 'AgreementLNG';

    this._epicProjectId = (obj && obj._epicProjectId) || '';
    this._epicMilestoneId = (obj && obj._epicMilestoneId) || '';

    this.dateIssued = (obj && obj.dateIssued) || null;
    this.nationName = (obj && obj.nationName) || '';
    this.projectName = (obj && obj.projectName) || '';
    this.documents = (obj && obj.documents) || [];

    this.description = (obj && obj.description) || null;

    this.datePublished = (obj && obj.datePublished) || null;
    this.publishedBy = (obj && obj.publishedBy) || '';
  }
}
