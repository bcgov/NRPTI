import { RecordModel } from '../record-model-abstract';

/**
 * Agreement data model.
 *
 * @export
 * @class Agreement
 */
export class Agreement extends RecordModel {
  _epicProjectId: string;
  _epicMilestoneId: string;

  dateIssued: Date;
  nationName: string;
  documents: object[];

  AgreementLNG: object;

  constructor(obj?: any) {
    super(obj);

    this._schemaName = 'Agreement';
    this._epicProjectId = (obj && obj._epicProjectId) || null;
    this._epicMilestoneId = (obj && obj._epicMilestoneId) || null;

    this.dateIssued = (obj && obj.dateIssued) || null;
    this.nationName = (obj && obj.nationName) || null;
    this.documents = (obj && obj.documents) || null;
  }
}
