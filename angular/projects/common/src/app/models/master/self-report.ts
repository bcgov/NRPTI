import { Legislation } from './common-models/legislation';

/**
 * SelfReport data model.
 *
 * @export
 * @class SelfReport
 */
export class SelfReport {
  _id: string;
  _schemaName: string;
  _epicProjectId: string;
  _sourceRefId: string;
  _epicMilestoneId: string;

  read: string[];
  write: string[];

  recordName: string;
  recordType: string;
  dateIssued: Date;
  issuingAgency: string;
  author: string;
  legislation: Legislation;
  projectName: string;
  location: string;
  centroid: number[];
  documents: object[];

  dateAdded: Date;
  dateUpdated: Date;

  sourceDateAdded: Date;
  sourceDateUpdated: Date;
  sourceSystemRef: string;

  // Fields for saving flavour in API.
  SelfReportLNG: object;

  constructor(obj?: any) {
    this._id = (obj && obj._id) || null;
    this._schemaName = (obj && obj._schemaName) || 'SelfReport';
    this._epicProjectId = (obj && obj._epicProjectId) || null;
    this._sourceRefId = (obj && obj._sourceRefId) || null;
    this._epicMilestoneId = (obj && obj._epicMilestoneId) || null;

    this.read = (obj && obj.read) || null;
    this.write = (obj && obj.write) || null;

    this.recordName = (obj && obj.recordName) || null;
    this.recordType = (obj && obj.recordType) || null;
    this.dateIssued = (obj && obj.dateIssued) || null;
    this.issuingAgency = (obj && obj.issuingAgency) || null;
    this.author = (obj && obj.author) || null;
    this.legislation = (obj && obj.legislation && new Legislation(obj.legislation)) || null;
    this.projectName = (obj && obj.projectName) || null;
    this.location = (obj && obj.location) || null;
    this.centroid = (obj && obj.centroid) || null;
    this.documents = (obj && obj.documents) || null;

    this.dateAdded = (obj && obj.dateAdded) || null;
    this.dateUpdated = (obj && obj.dateUpdated) || null;

    this.sourceDateAdded = (obj && obj.sourceDateAdded) || null;
    this.sourceDateUpdated = (obj && obj.sourceDateUpdated) || null;
    this.sourceSystemRef = (obj && obj.sourceSystemRef) || null;
  }
}
