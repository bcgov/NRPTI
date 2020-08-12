import { Legislation } from './common-models/legislation';
import { Entity } from './common-models/entity';
import { RecordModel } from '../record-model-abstract';

/**
 * Permit data model.
 *
 * @export
 * @class Permit
 */
export class Permit extends RecordModel {
  _epicProjectId: string;
  _epicMilestoneId: string;
  mineGuid: string;

  recordSubtype: string;
  dateIssued: Date;
  issuingAgency: string;
  issuedTo: Entity;
  legislation: Legislation;
  legislationDescription: string;
  documents: object[];

  permitStatusCode: string;
  amendmentStatusCode: string;
  typeCode: string;
  originalPermit: string;


  // Fields for saving flavour in API.
  PermitLNG: object;

  constructor(obj?: any) {
    super(obj);

    this._schemaName = 'Permit';
    this._epicProjectId = (obj && obj._epicProjectId) || null;
    this._epicMilestoneId = (obj && obj._epicMilestoneId) || null;
    this.mineGuid = (obj && obj.mineGuid) || null;

    this.recordSubtype = (obj && obj.recordSubtype) || null;
    this.dateIssued = (obj && obj.dateIssued) || null;
    this.issuingAgency = (obj && obj.issuingAgency) || null;
    this.legislation = (obj && obj.legislation && new Legislation(obj.legislation)) || null;
    this.legislationDescription = (obj && obj.legislationDescription) || null;
    this.documents = (obj && obj.documents) || null;

    this.permitStatusCode = (obj && obj.permitStatusCode) || null;
    this.amendmentStatusCode = (obj && obj.amendmentStatusCode) || null;
    this.typeCode = (obj && obj.typeCode) || null;
    this.originalPermit = (obj && obj.originalPermit) || null;
  }
}
