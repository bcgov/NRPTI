/**
 * Interface for default NRPTI Record Models
 *
 * @interface
 */
export interface IRecordModel {
  _id:               string;
  _schemaName:       string;
  _sourceRefId:      string;
  read:              string[];
  write:             string[];
  recordName:        string;
  recordType:        string;
  projectName:       string;
  location:          string;
  centroid:          number[];
  dateAdded:         Date;
  dateUpdated:       Date;
  addedBy:           string;
  updatedBy:         string;
  sourceDateAdded:   Date;
  sourceDateUpdated: Date;
  sourceSystemRef:   string;
}
