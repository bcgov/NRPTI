import { Legislation } from '../master/common-models/legislation';

/**
 * Permit LNG data model.
 *
 * @export
 * @class PermitLNG
 */
export class PermitLNG {
  _id: string;
  _schemaName: string;

  _epicProjectId: string;
  _sourceRefId: string;
  _epicMilestoneId: string;

  read: string[];
  write: string[];

  recordName: string;
  recordType: string;
  recordSubtype: string;
  dateIssued: Date;
  issuingAgency: string;
  legislation: Legislation;
  projectName: string;
  location: string;
  centroid: number[];
  documents: object[];

  description: string;

  dateAdded: Date;
  dateUpdated: Date;
  datePublished: Date;

  addedBy: string;
  updatedBy: string;
  publishedBy: string;

  sourceDateAdded: Date;
  sourceDateUpdated: Date;
  sourceSystemRef: string;

  constructor(obj?: any) {
    this._id = (obj && obj._id) || null;
    this._schemaName = (obj && obj._schemaName) || 'PermitLNG';

    this._epicProjectId = (obj && obj._epicProjectId) || '';
    this._sourceRefId = (obj && obj._sourceRefId) || '';
    this._epicMilestoneId = (obj && obj._epicMilestoneId) || '';

    this.read = (obj && obj.read) || null;
    this.write = (obj && obj.write) || null;

    this.recordName = (obj && obj.recordName) || '';
    this.recordType = (obj && obj.recordType) || '';
    this.recordSubtype = (obj && obj.recordSubtype) || '';
    this.dateIssued = (obj && obj.dateIssued) || null;
    this.issuingAgency = (obj && obj.issuingAgency) || '';
    this.legislation = (obj && obj.legislation && new Legislation(obj.legislation)) || null;
    this.projectName = (obj && obj.projectName) || '';
    this.location = (obj && obj.location) || '';
    this.centroid = (obj && obj.centroid) || [];
    this.documents = (obj && obj.documents) || [];

    this.description = (obj && obj.description) || null;

    this.dateAdded = (obj && obj.dateAdded) || null;
    this.dateUpdated = (obj && obj.dateUpdated) || null;
    this.datePublished = (obj && obj.datePublished) || null;

    this.addedBy = (obj && obj.addedBy) || '';
    this.updatedBy = (obj && obj.updatedBy) || '';
    this.publishedBy = (obj && obj.publishedBy) || '';

    this.sourceDateAdded = (obj && obj.sourceDateAdded) || null;
    this.sourceDateUpdated = (obj && obj.sourceDateUpdated) || null;
    this.sourceSystemRef = (obj && obj.sourceSystemRef) || '';
  }
}
