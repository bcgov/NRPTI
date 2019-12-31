/**
 * Inspection data model.
 *
 * @export
 * @class Inspection
 */
export class Inspection {
  _id: string;

  _schemaName: string;

  read: string;
  write: string;

  recordName: string;
  issuingAgency: string;
  author: string;
  type: string;
  quarter: string;
  entityType: string;
  issuedTo: string;
  birthDate: Date;
  description: string;
  centroid: number;
  location: string;
  nationName: string;
  documentAttachments: string;
  sourceSystemRef: string;
  legislation: string;
  status: string;
  project: string;
  projectSector: string;
  projectType: string;
  penalty: string;
  courtConvictionOutcome: string;

  tabSelection: string;

  documentId: string;
  documentType: string;
  documentFileName: string;
  documentDate: Date;

  dateAdded: Date;
  dateUpdated: Date;

  sourceDateAdded: Date;
  sourceDateUpdated: Date;

  constructor(obj?: any) {
    this._id = (obj && obj._id) || null;

    this._schemaName = (obj && obj._schemaName) || null;

    this.read = (obj && obj.read) || null;
    this.write = (obj && obj.write) || null;

    this.recordName = (obj && obj.recordName) || null;
    this.issuingAgency = (obj && obj.issuingAgency) || null;
    this.author = (obj && obj.author) || null;
    this.type = (obj && obj.type) || null;
    this.quarter = (obj && obj.quarter) || null;
    this.entityType = (obj && obj.entityType) || null;
    this.issuedTo = (obj && obj.issuedTo) || null;
    this.birthDate = (obj && obj.birthDate) || null;
    this.description = (obj && obj.description) || null;
    this.centroid = (obj && obj.centroid) || null;
    this.location = (obj && obj.location) || null;
    this.nationName = (obj && obj.nationName) || null;
    this.documentAttachments = (obj && obj.documentAttachments) || null;
    this.sourceSystemRef = (obj && obj.sourceSystemRef) || null;
    this.legislation = (obj && obj.legislation) || null;
    this.status = (obj && obj.status) || null;
    // relatedRecords: { type: String, default: '' }, // out of scope?
    // outcomeDescription: { type: String, default: '' }, // out of scope?
    this.project = (obj && obj.project) || null;
    this.projectSector = (obj && obj.projectSector) || null;
    this.projectType = (obj && obj.projectType) || null;
    this.penalty = (obj && obj.penalty) || null;
    this.courtConvictionOutcome = (obj && obj.courtConvictionOutcome) || null;

    this.tabSelection = (obj && obj.tabSelection) || null;

    this.documentId = (obj && obj.documentId) || null;
    this.documentType = (obj && obj.documentType) || null;
    this.documentFileName = (obj && obj.documentFileName) || null;
    this.documentDate = (obj && obj.documentDate) || null;

    this.dateAdded = (obj && obj.dateAdded) || null;
    this.dateUpdated = (obj && obj.dateUpdated) || null;

    this.sourceDateAdded = (obj && obj.sourceDateAdded) || null;
    this.sourceDateUpdated = (obj && obj.sourceDateUpdated) || null;
  }
}
