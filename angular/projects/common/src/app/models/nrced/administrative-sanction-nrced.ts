import { Legislation } from '../master/common-models/legislation';

/**
 * AdministrativeSanction NRCED data model.
 *
 * @export
 * @class AdministrativeSanctionNRCED
 */
export class AdministrativeSanctionNRCED {
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
  legislationDescription: string;
  issuedTo: string;
  projectName: string;
  location: string;
  centroid: number[];
  outcomeStatus: string;
  outcomeDescription: string;
  penalty: string;
  documents: object[];

  summary: string;

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
    this._schemaName = (obj && obj._schemaName) || 'AdministrativeSanctionNRCED';

    this._epicProjectId = (obj && obj._epicProjectId) || '';
    this._sourceRefId = (obj && obj._sourceRefId) || '';
    this._epicMilestoneId = (obj && obj._epicMilestoneId) || '';

    this.read = (obj && obj.read) || null;
    this.write = (obj && obj.write) || null;

    this.recordName = (obj && obj.recordName) || '';
    this.recordType = (obj && obj.recordType) || '';
    this.dateIssued = (obj && obj.dateIssued) || null;
    this.issuingAgency = (obj && obj.issuingAgency) || '';
    this.author = (obj && obj.author) || '';
    this.legislation = (obj && obj.legislation && new Legislation(obj.legislation)) || null;
    this.legislationDescription = (obj && obj.legislationDescription) || '';
    this.issuedTo = (obj && obj.issuedTo) || '';
    this.projectName = (obj && obj.projectName) || '';
    this.location = (obj && obj.location) || '';
    this.centroid = (obj && obj.centroid) || [];
    this.outcomeStatus = (obj && obj.outcomeStatus) || '';
    this.outcomeDescription = (obj && obj.outcomeDescription) || '';
    this.penalty = (obj && obj.penalty) || '';
    this.documents = (obj && obj.documents) || [];

    this.summary = (obj && obj.summary) || null;

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
