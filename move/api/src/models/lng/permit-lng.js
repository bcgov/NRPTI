'use strict';

module.exports = require('../../utils/model-schema-generator')(
  'PermitLNG',
  {
    _schemaName: { type: String, default: 'PermitLNG', index: true },
    _epicProjectId: { type: 'ObjectId', default: null, index: true },
    _sourceRefId: { type: 'ObjectId', default: null, index: true },
    _epicMilestoneId: { type: 'ObjectId', default: null, index: true },
    _master: { type: 'ObjectId', default: null, index: true },

    read: [{ type: String, trim: true, default: 'sysadmin' }],
    write: [{ type: String, trim: true, default: 'sysadmin' }],

    recordName: { type: String, default: '' },
    recordType: { type: String, default: '' },
    recordSubtype: { type: String, default: '' },
    dateIssued: { type: Date, default: null },
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
    issuingAgency: { type: String, default: '' },
    legislation: [{
      act: { type: String, default: '' },
      regulation: { type: String, default: '' },
      section: { type: String, default: '' },
      subSection: { type: String, default: '' },
      paragraph: { type: String, default: '' },
      legislationDescription: { type: String, default: '' }
    }],
    projectName: { type: String, default: '' },
    location: { type: String, default: '' },
    centroid: [{ type: Number, default: 0.0 }],
    documents: [{ type: 'ObjectId', default: [], index: true }],

    description: { type: String, default: '' },

    dateAdded: { type: Date, default: Date.now() },
    dateUpdated: { type: Date, default: null },
    datePublished: { type: Date, default: null },

    addedBy: { type: String, default: '' },
    updatedBy: { type: String, default: '' },
    publishedBy: { type: String, default: '' },

    sourceDateAdded: { type: Date, default: null },
    sourceDateUpdated: { type: Date, default: null },
    sourceSystemRef: { type: String, default: 'nrpti' }
  },
  'nrpti'
);
