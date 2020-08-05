'use strict';

module.exports = require('../../utils/model-schema-generator')(
  'Permit',
  {
    _schemaName: { type: String, default: 'Permit', index: true },
    _epicProjectId: { type: 'ObjectId', default: null, index: true },
    _sourceRefId: { type: String, default: null, index: true },
    _epicMilestoneId: { type: 'ObjectId', default: null, index: true },
    _sourceDocumentRefId: { type: String, default: null, index: true },

    mineGuid: { type: String, default: '', index: true },

    read: [{ type: String, trim: true, default: 'sysadmin' }],
    write: [{ type: String, trim: true, default: 'sysadmin' }],

    _flavourRecords: [{ type: 'ObjectId', default: [], index: true }],

    recordName: { type: String, default: '' },
    recordType: { type: String, default: '' },
    recordSubtype: { type: String, default: '' },
    dateIssued: { type: Date, default: null },
    issuingAgency: { type: String, default: '' },
    legislation: {
      act: { type: String, default: '' },
      regulation: { type: String, default: '' },
      section: { type: String, default: '' },
      subSection: { type: String, default: '' },
      paragraph: { type: String, default: '' }
    },
    legislationDescription: { type: String, default: '' },
    projectName: { type: String, default: '' },
    location: { type: String, default: '' },
    centroid: [{ type: Number, default: 0.0 }],
    documents: [{ type: 'ObjectId', default: [], index: true }],

    permitNumber: { type: String, default: '' },
    status: { type: String, default: '' },
    // status code from the root permit doc
    permitStatusCode: { type: String, default: '' },
    // status code from the Core amendment doc
    amendmentStatusCode: { type: String, default: '' },
    // Amendment doc type code, either OGP (original permit) or AMD (Amendment)
    // If the Type is AMD, the OGP document ref will be applied to the originalPermit
    typeCode: { type: String, default: 'OGP' }, // OGP or AMD
    // Original Permit GUID, only populated for AMD types
    originalPermit: { type: 'ObjectId', default: null, index: true },

    dateAdded: { type: Date, default: Date.now() },
    dateUpdated: { type: Date, default: null },

    addedBy: { type: String, default: '' },
    updatedBy: { type: String, default: '' },

    sourceDateAdded: { type: Date, default: null },
    sourceDateUpdated: { type: Date, default: null },
    sourceSystemRef: { type: String, default: 'nrpti' },
    isLngPublished: { type: Boolean, default: false, index: true },
    isBcmiPublished: { type: Boolean, default: false, index: true }
  },
  'nrpti'
);
