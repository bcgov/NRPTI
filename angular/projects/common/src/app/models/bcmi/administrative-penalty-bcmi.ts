import { Legislation } from '../master/common-models/legislation';
import { Entity } from '../master/common-models/entity';
import { Penalty } from '../master/common-models/penalty';
import { RecordModel } from '../record-model-abstract';

/**
 * AdministrativePenalty BCMI data model.
 *
 * @export
 * @class AdministrativePenaltyBCMI
 */
export class AdministrativePenaltyBCMI extends RecordModel {
  _epicProjectId: string;
  _epicMilestoneId: string;
  mineGuid: string;
  unlistedMine: string;
  unlistedMineType: string;

  dateIssued: Date;
  issuingAgency: string;
  author: string;
  legislation: Legislation;
  offence: string;
  issuedTo: Entity;
  penalties: Penalty;
  documents: object[];

  summary: string;

  datePublished: Date;

  publishedBy: string;

  constructor(obj?: any) {
    super(obj);

    this._schemaName = 'AdministrativePenaltyBCMI';

    this._epicProjectId = (obj && obj._epicProjectId) || '';
    this._epicMilestoneId = (obj && obj._epicMilestoneId) || '';
    this.mineGuid = (obj && obj.mineGuid) || '';
    this.unlistedMine = (obj && obj.unlistedMine) || '';

    this.dateIssued = (obj && obj.dateIssued) || null;
    this.issuingAgency = (obj && obj.issuingAgency) || '';
    this.author = (obj && obj.author) || '';
    this.legislation = (obj && obj.legislation && new Legislation(obj.legislation)) || null;
    this.offence = (obj && obj.offence) || '';
    this.issuedTo = (obj && obj.issuedTo && new Entity(obj.issuedTo)) || null;
    this.penalties =
      (obj && obj.penalties && obj.penalties.length && obj.penalties.map(penalty => new Penalty(penalty))) || null;
    this.documents = (obj && obj.documents) || [];

    this.summary = (obj && obj.summary) || null;

    this.datePublished = (obj && obj.datePublished) || null;
    this.publishedBy = (obj && obj.publishedBy) || '';
  }
}
