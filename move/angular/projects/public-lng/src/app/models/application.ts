import { Document } from './document';

export class Application {
  // the following are retrieved from the API
  _id: string;
  agency: string;
  areaHectares: number;
  businessUnit: string;
  centroid: number[] = []; // [lng, lat]
  cl_file: number;
  client: string;
  description: string = null;
  legalDescription: string = null;
  location: string;
  name: string;
  publishDate: Date = null;
  purpose: string;
  status: string;
  subpurpose: string;
  subtype: string;
  tantalisID: number;
  tenureStage: string;
  type: string;
  statusHistoryEffectiveDate: Date = null;

  region: string; // region code derived from Business Unit
  appStatus: string; // user-friendly application status
  appStatusCode: string; // application status code
  cpStatusCode: string; // comment period status code

  isLoaded = false; // whether this application is loaded in list

  // associated data
  documents: Document[] = [];

  constructor(obj?: any) {
    this._id = (obj && obj._id) || null;
    this.agency = (obj && obj.agency) || null;
    this.areaHectares = (obj && obj.areaHectares) || null;
    this.businessUnit = (obj && obj.businessUnit) || null;
    this.cl_file = (obj && obj.cl_file) || null;
    this.client = (obj && obj.client) || null;
    this.location = (obj && obj.location) || null;
    this.name = (obj && obj.name) || null;
    this.purpose = (obj && obj.purpose) || null;
    this.status = (obj && obj.status) || null;
    this.subpurpose = (obj && obj.subpurpose) || null;
    this.subtype = (obj && obj.subtype) || null;
    this.tantalisID = (obj && obj.tantalisID) || null; // not zero
    this.tenureStage = (obj && obj.tenureStage) || null;
    this.type = (obj && obj.type) || null;
    this.region = (obj && obj.region) || null;
    this.appStatus = (obj && obj.appStatus) || null;
    this.appStatusCode = (obj && obj.appStatusCode) || null;
    this.cpStatusCode = (obj && obj.cpStatusCode) || null;

    if (obj && obj.publishDate) {
      this.publishDate = new Date(obj.publishDate);
    }

    if (obj && obj.statusHistoryEffectiveDate) {
      this.statusHistoryEffectiveDate = new Date(obj.statusHistoryEffectiveDate); // in milliseconds
    }

    // replace \\n (JSON format) with newlines
    if (obj && obj.description) {
      this.description = obj.description.replace(/\\n/g, '\n');
    }
    if (obj && obj.legalDescription) {
      this.legalDescription = obj.legalDescription.replace(/\\n/g, '\n');
    }

    // copy centroid
    if (obj && obj.centroid) {
      obj.centroid.forEach((num: number) => {
        this.centroid.push(num);
      });
    }

    // copy documents
    if (obj && obj.documents) {
      for (const doc of obj.documents) {
        this.documents.push(doc);
      }
    }
  }
}
