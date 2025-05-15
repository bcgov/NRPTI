import { RecordModel } from '../record-model-abstract';

/**
 * ConstructionPlan data model.
 *
 * @export
 * @class ConstructionPlan
 */
export class ConstructionPlan extends RecordModel {
  _epicProjectId: string;
  _epicMilestoneId: string;

  dateIssued: Date;
  issuingAgency: string;
  author: string;
  documents: object[];

  // Fields for saving flavour in API.
  ConstructionPlanLNG: object;

  constructor(obj?: any) {
    super(obj);

    this._schemaName = 'ConstructionPlan';
    this._epicProjectId = (obj && obj._epicProjectId) || null;
    this._epicMilestoneId = (obj && obj._epicMilestoneId) || null;

    this.dateIssued = (obj && obj.dateIssued) || null;
    this.issuingAgency = (obj && obj.issuingAgency) || null;
    this.author = (obj && obj.author) || null;
    this.documents = (obj && obj.documents) || null;
  }
}
