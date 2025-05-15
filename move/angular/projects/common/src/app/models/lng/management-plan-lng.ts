import { RecordModel } from '../record-model-abstract';

/**
 * ManagementPlan LNG data model.
 *
 * @export
 * @class ManagementPlanLNG
 */
export class ManagementPlanLNG extends RecordModel {
  _epicProjectId: string;
  _epicMilestoneId: string;

  dateIssued: Date;
  agency: string;
  author: string;
  documents: object[];

  description: string;

  datePublished: Date;
  publishedBy: string;

  constructor(obj?: any) {
    super(obj);

    this._schemaName = 'ManagementPlanLNG';

    this._epicProjectId = (obj && obj._epicProjectId) || '';
    this._sourceRefId = (obj && obj._sourceRefId) || '';
    this._epicMilestoneId = (obj && obj._epicMilestoneId) || '';

    this.dateIssued = (obj && obj.dateIssued) || null;
    this.agency = (obj && obj.agency) || '';
    this.author = (obj && obj.author) || '';
    this.documents = (obj && obj.documents) || [];

    this.description = (obj && obj.description) || null;

    this.datePublished = (obj && obj.datePublished) || null;
    this.publishedBy = (obj && obj.publishedBy) || '';
  }
}
