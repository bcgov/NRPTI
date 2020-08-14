module.exports = require('../../utils/model-schema-generator')(
  'PermitBCMI',
  {
    // NRPTI Record boilerplate
    _schemaName: { type: String, default: 'PermitBCMI', index: true },
    _sourceRefId:  { type: String, default: null, index: true },
    _epicProjectId: { type: 'ObjectId', default: null, index: true },
    read: [{ type: String, trim: true, default: 'sysadmin' }],
    write: [{ type: String, trim: true, default: 'sysadmin' }],
    projectName: { type: String, default: '' },
    centroid: [{ type: Number, default: 0.0 }],
    recordName: { type: String, default: '' },
    recordType: { type: String, default: '' },
    recordSubtype: { type: String, default: '' },
    // MineBCMI Record GUID that ties this record to a mine
    mineGuid: { type: String, default: null, index: true },
    // Permit number from the mine. Technically can be dirived from the mineGuid ref
    permitNumber: { type: String, default: '' },
    // status code from the root permit doc
    permitStatusCode: { type: String, default: '' },
    // status code from the Core amendment doc
    amendmentStatusCode: { type: String, default: '' },
    // Amendment doc type code, either OGP (original permit) or AMD (Amendment)
    // If the Type is AMD, the OGP document ref will be applied to the originalPermit
    typeCode: { type: String, default: 'OGP' }, // OGP or AMD
    // Original Permit GUID, only populated for AMD types
    originalPermit: { type: 'ObjectId', default: null, index: true },
    receivedDate: { type: Date, default: null },
    dateIssued: { type: Date, default: null },
    issuingAgency: { type: String, default: '' },
    issuedTo: {
      write: [{ type: String, trim: true, default: 'sysadmin' }],
      read: [{ type: String, trim: true, default: 'sysadmin' }],

      type: { type: String, enum: ['Company', 'Individual', 'IndividualCombined'] },
      companyName: { type: String, default: '' },
      firstName: { type: String, default: '' },
      middleName: { type: String, default: '' },
      lastName: { type: String, default: '' },
      fullName: { type: String, default: '' },
      dateOfBirth: { type: Date, default: null }
    },
    authorizedEndDate: { type: Date, default: null },
    description: { type: String, default: '' },
    documents: [{ type: 'ObjectId', default: [], index: true }],

    // final Record boilerplate
    dateAdded: { type: Date, default: Date.now() },
    dateUpdated: { type: Date, default: null },
    datePublished: { type: Date, default: null },
    addedBy: { type: String, default: '' },
    updatedBy: { type: String, default: '' },
    publishedBy: { type: String, default: '' },
    // Source system for Permit is generally Core from the importer
    sourceSystemRef: { type: String, default: 'core' }
  },
  'nrpti'
);
