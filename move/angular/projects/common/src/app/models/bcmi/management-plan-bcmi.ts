import { RecordModel } from '../record-model-abstract';

/**
 * ManagementPlan BCMI data model.
 *
 * @export
 * @class ManagementPlanBCMI
 */
export class ManagementPlanBCMI extends RecordModel {
  _epicProjectId: string;
  _epicMilestoneId: string;

  dateIssued: Date;
  agency: string;
  issuingAgency: string;
  author: string;
  documents: object[];

  description: string;

  datePublished: Date;
  publishedBy: string;

  constructor(obj?: any) {
    super(obj);

    this._schemaName = 'ManagementPlanBCMI';

    this._epicProjectId = (obj && obj._epicProjectId) || '';
    this._sourceRefId = (obj && obj._sourceRefId) || '';
    this._epicMilestoneId = (obj && obj._epicMilestoneId) || '';

    this.dateIssued = (obj && obj.dateIssued) || null;
    this.agency = (obj && obj.agency) || '';
    this.issuingAgency = (obj && obj.agency) || '';
    this.author = (obj && obj.author) || '';
    this.documents = (obj && obj.documents) || [];

    this.description = (obj && obj.description) || null;

    this.datePublished = (obj && obj.datePublished) || null;
    this.publishedBy = (obj && obj.publishedBy) || '';
  }
}
