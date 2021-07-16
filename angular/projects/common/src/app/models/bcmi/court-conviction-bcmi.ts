import { Legislation } from '../master/common-models/legislation';
import { Entity } from '../master/common-models/entity';
import { Penalty } from '../master/common-models/penalty';
import { RecordModel } from '../record-model-abstract';

/**
 * CourtConviction data model.
 *
 * @export
 * @class CourtConviction
 */
export class CourtConvictionBCMI extends RecordModel {
  _epicProjectId: string;
  _epicMilestoneId: string;
  mineGuid: string;
  unlistedMine: string;
  unlistedMineType: string;

  recordSubtype: string;
  dateIssued: Date;
  issuingAgency: string;
  author: string;
  legislation: Legislation;
  offence: string;
  issuedTo: Entity;
  penalties: Penalty[];
  documents: object[];

  CourtConvictionNRCED: object;
  CourtConvictionLNG: object;
  CourtConvictionBCMI: object;

  description: string;

  datePublished: Date;
  publishedBy: string;

  constructor(obj?: any) {
    super(obj);

    this._schemaName = 'CourtConvictionBCMI';
    this._epicProjectId = (obj && obj._epicProjectId) || null;
    this._epicMilestoneId = (obj && obj._epicMilestoneId) || null;
    this.mineGuid = (obj && obj.mineGuid) || '';
    this.unlistedMine = (obj && obj.unlistedMine) || '';
    this.unlistedMineType = (obj && obj.unlistedMineType) || '';

    this.recordSubtype = (obj && obj.recordSubtype) || null;
    this.dateIssued = (obj && obj.dateIssued) || null;
    this.issuingAgency = (obj && obj.issuingAgency) || null;
    this.author = (obj && obj.author) || null;
    this.legislation = (obj && obj.legislation && new Legislation(obj.legislation)) || null;
    this.offence = (obj && obj.offence) || null;
    this.issuedTo = (obj && obj.issuedTo && new Entity(obj.issuedTo)) || null;
    this.penalties =
      (obj && obj.penalties && obj.penalties.length && obj.penalties.map(penalty => new Penalty(penalty))) || null;
    this.documents = (obj && obj.documents) || null;

    this.description = (obj && obj.description) || null;

    this.datePublished = (obj && obj.datePublished) || null;
    this.publishedBy = (obj && obj.publishedBy) || '';
  }
}
