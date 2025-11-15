import { Legislation } from '../master/common-models/legislation';
import { RecordModel } from '../record-model-abstract';

/**
 * Permit LNG data model.
 *
 * @export
 * @class PermitLNG
 */
export class PermitLNG extends RecordModel {
  _epicProjectId: string;
  _epicMilestoneId: string;
  declare mineGuid: string;

  recordSubtype: string;
  dateIssued: Date;
  issuingAgency: string;
  legislation: Legislation[];

  documents: object[];

  description: string;

  datePublished: Date;
  publishedBy: string;

  permitStatusCode: string;
  amendmentStatusCode: string;
  typeCode: string;
  originalPermit: string;

  constructor(obj?: any) {
    super(obj);

    this._schemaName = 'PermitLNG';

    this._epicProjectId = (obj && obj._epicProjectId) || '';
    this._epicMilestoneId = (obj && obj._epicMilestoneId) || '';
    this.mineGuid = (obj && obj.mineGuid) || null;

    this.recordSubtype = (obj && obj.recordSubtype) || '';
    this.dateIssued = (obj && obj.dateIssued) || null;
    this.issuingAgency = (obj && obj.issuingAgency) || '';
    this.legislation =
      (obj &&
        obj.legislation &&
        obj.legislation.length &&
        obj.legislation.map(legislation => new Legislation(legislation))) ||
      null;
    this.documents = (obj && obj.documents) || [];

    this.description = (obj && obj.description) || null;

    this.datePublished = (obj && obj.datePublished) || null;

    this.typeCode = (obj && obj.typeCode) || null;
    this.originalPermit = (obj && obj.originalPermit) || null;

    this.publishedBy = (obj && obj.publishedBy) || '';
  }
}
