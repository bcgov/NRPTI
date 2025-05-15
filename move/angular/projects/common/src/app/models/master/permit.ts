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

  recordSubtype: string;
  dateIssued: Date;
  issuingAgency: string;
  issuedTo: Entity;
  legislation: Legislation[];
  documents: object[];

  permitStatusCode: string;
  amendmentStatusCode: string;
  typeCode: string;
  originalPermit: string;

  // Fields for saving flavour in API.
  PermitLNG: object;
  isBcmiPublished: boolean;
  isLngPublished: boolean;

  constructor(obj?: any) {
    super(obj);

    this._schemaName = 'Permit';
    this._epicProjectId = (obj && obj._epicProjectId) || null;
    this._epicMilestoneId = (obj && obj._epicMilestoneId) || null;

    this.recordSubtype = (obj && obj.recordSubtype) || null;
    this.dateIssued = (obj && obj.dateIssued) || null;
    this.issuingAgency = (obj && obj.issuingAgency) || null;
    this.legislation =
      (obj &&
        obj.legislation &&
        obj.legislation.length &&
        obj.legislation.map(legislation => new Legislation(legislation))) ||
      null;
    this.documents = (obj && obj.documents) || null;

    this.permitStatusCode = (obj && obj.permitStatusCode) || null;
    this.amendmentStatusCode = (obj && obj.amendmentStatusCode) || null;
    this.typeCode = (obj && obj.typeCode) || null;
    this.originalPermit = (obj && obj.originalPermit) || null;
    this.isBcmiPublished = (obj && obj.isBcmiPublished) || false;
    this.isLngPublished = (obj && obj.isLngPublished) || false;
  }
}
