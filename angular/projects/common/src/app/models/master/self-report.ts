import { Legislation } from './common-models/legislation';
import { RecordModel } from '../record-model-abstract';

/**
 * SelfReport data model.
 *
 * @export
 * @class SelfReport
 */
export class SelfReport extends RecordModel {
  _epicProjectId: string;
  _epicMilestoneId: string;

  dateIssued: Date;
  issuingAgency: string;
  author: string;
  legislation: Legislation;
  legislationDescription: string;
  documents: object[];

  // Fields for saving flavour in API.
  SelfReportLNG: object;

  constructor(obj?: any) {
    super(obj);

    this._schemaName = 'SelfReport';
    this._epicProjectId = (obj && obj._epicProjectId) || null;
    this._epicMilestoneId = (obj && obj._epicMilestoneId) || null;

    this.dateIssued = (obj && obj.dateIssued) || null;
    this.issuingAgency = (obj && obj.issuingAgency) || null;
    this.author = (obj && obj.author) || null;
    this.legislation = (obj && obj.legislation && new Legislation(obj.legislation)) || null;
    this.legislationDescription = (obj && obj.legislationDescription) || null;
    this.documents = (obj && obj.documents) || null;
  }
}
