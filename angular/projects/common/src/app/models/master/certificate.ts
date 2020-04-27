import { Legislation } from './common-models/legislation';

/**
 * Certificate data model.
 *
 * @export
 * @class Certificate
 */
export class Certificate {
  _id: string;
  _schemaName: string;

  _epicProjectId: string;
  _sourceRefId: string;
  _epicMilestoneId: string;

  read: string[];
  write: string[];

  recordType: string;
  recordSubtype: string;
  dateIssued: Date;
  issuingAgency: string;
  author: string;
  description: string;
  legislation: Legislation;
  legislationDescription: string;
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
  CertificateLNG: object;

  constructor(obj?: any) {
    this._id = (obj && obj._id) || null;
    this._schemaName = (obj && obj._schemaName) || 'Certificate';

    this._epicProjectId = (obj && obj._epicProjectId) || null;
    this._sourceRefId = (obj && obj._sourceRefId) || null;
    this._epicMilestoneId = (obj && obj._epicMilestoneId) || null;

    this.read = (obj && obj.read) || null;
    this.write = (obj && obj.write) || null;

    this.recordType = (obj && obj.recordType) || null;
    this.recordSubtype = (obj && obj.recordSubtype) || null;
    this.dateIssued = (obj && obj.dateIssued) || null;
    this.issuingAgency = (obj && obj.issuingAgency) || null;
    this.author = (obj && obj.author) || null;
    this.description = (obj && obj.description) || null;
    this.legislation = (obj && obj.legislation && new Legislation(obj.legislation)) || null;
    this.legislationDescription = (obj && obj.legislationDescription) || null;
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
