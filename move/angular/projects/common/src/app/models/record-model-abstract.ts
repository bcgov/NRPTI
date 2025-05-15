import { IRecordModel } from './record-model-interface';

/**
 * Record Model abstract for extending with NRPTI models
 *
 * @export
 * @abstract
 * @class RecordModel
 * @implements {IRecordModel}
 */
export abstract class RecordModel implements IRecordModel {
  _id: string;
  _schemaName: string;
  _sourceRefId: string;
  mineGuid: string;
  collectionId: string;
  read: string[];
  write: string[];
  recordName: string;
  recordType: string;
  projectName: string;
  location: string;
  centroid: number[];
  dateAdded: Date;
  dateUpdated: Date;
  addedBy: string;
  updatedBy: string;
  sourceDateAdded: Date;
  sourceDateUpdated: Date;
  sourceSystemRef: string;

  constructor(record?: any) {
    this._id = (record && record._id) || null;
    this._schemaName = (record && record._schemaName) || 'INVALID_SCHEMA';
    this._sourceRefId = (record && record._sourceRefId) || null;
    this.mineGuid = (record && record.mineGuid) || null;
    this.collectionId = (record && record.collectionId) || null;
    this.read = (record && record.read) || null;
    this.write = (record && record.write) || null;
    this.recordName = (record && record.recordName) || null;
    this.recordType = (record && record.recordType) || null;
    this.projectName = (record && record.projectName) || null;
    this.location = (record && record.location) || null;
    this.centroid = (record && record.centroid) || null;
    this.dateAdded = (record && record.dateAdded) || null;
    this.dateUpdated = (record && record.dateUpdated) || null;
    this.addedBy = (record && record.addedBy) || null;
    this.updatedBy = (record && record.updatedBy) || null;
    this.sourceDateAdded = (record && record.sourceDateAdded) || null;
    this.sourceDateUpdated = (record && record.sourceDateUpdated) || null;
    this.sourceSystemRef = (record && record.sourceSystemRef) || null;
  }
}
