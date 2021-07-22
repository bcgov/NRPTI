import { Legislation } from '../master/common-models/legislation';
import { RecordModel } from '../record-model-abstract';

/**
 * SelfReport LNG data model.
 *
 * @export
 * @class SelfReportLNG
 */
export class SelfReportLNG extends RecordModel {
  _epicProjectId: string;
  _epicMilestoneId: string;

  dateIssued: Date;
  issuingAgency: string;
  author: string;
  legislation: Legislation[];
  documents: object[];

  description: string;

  datePublished: Date;
  publishedBy: string;

  constructor(obj?: any) {
    super(obj);

    this._schemaName = 'SelfReportLNG';

    this._epicProjectId = (obj && obj._epicProjectId) || '';
    this._epicMilestoneId = (obj && obj._epicMilestoneId) || '';

    this.dateIssued = (obj && obj.dateIssued) || null;
    this.issuingAgency = (obj && obj.issuingAgency) || '';
    this.author = (obj && obj.author) || '';
    this.legislation = (obj && obj.legislation && obj.legislation.length &&
      obj.legislation.map(legislation => new Legislation(legislation))) || null;
    this.documents = (obj && obj.documents) || [];

    this.description = (obj && obj.description) || null;

    this.datePublished = (obj && obj.datePublished) || null;
    this.publishedBy = (obj && obj.publishedBy) || '';
  }
}
