import { RecordModel } from '../record-model-abstract';

/**
 * ManagementPlan data model.
 *
 * @export
 * @class ManagementPlan
 */
export class ManagementPlan extends RecordModel {
  _epicProjectId: string;
  _epicMilestoneId: string;

  dateIssued: Date;
  agency: string;
  author: string;
  description: string;
  documents: object[];

  // Fields for saving flavour in API.
  ManagementPlanLNG: object;

  constructor(obj?: any) {
    super(obj);

    this._schemaName = 'ManagementPlan';

    this._epicProjectId = (obj && obj._epicProjectId) || null;
    this._epicMilestoneId = (obj && obj._epicMilestoneId) || null;

    this.dateIssued = (obj && obj.dateIssued) || null;
    this.agency = (obj && obj.agency) || null;
    this.author = (obj && obj.author) || null;
    this.description = (obj && obj.description) || null;
    this.documents = (obj && obj.documents) || null;
  }
}
