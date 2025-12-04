'use strict';

const mongoose = require('mongoose');

module.exports = require('../../utils/model-schema-generator')(
  'AdministrativePenaltyNRCED',
  {
    _sourceRefOgcPenaltyId: { type: String, default: null },
    _schemaName: { type: String, default: 'AdministrativePenaltyNRCED' },
    _master: { type: 'ObjectId', default: null, index: true },

    read: [{ type: String, trim: true, default: 'sysadmin' }],
    write: [{ type: String, trim: true, default: 'sysadmin' }],

    recordName: { type: String, default: '' },
    recordType: { type: String, default: '' },
    dateIssued: { type: Date, default: null },
    issuingAgency: { type: String, default: '' },
    author: { type: String, default: '' },
    legislation: [
      {
        act: { type: String, default: '' },
        regulation: { type: String, default: '' },
        section: { type: String, default: '' },
        subSection: { type: String, default: '' },
        paragraph: { type: String, default: '' },
        offence: { type: String, default: '' }
      }
    ],
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
    projectName: { type: String, default: '' },
    location: { type: String, default: '' },
    centroid: [{ type: Number, default: 0.0 }],
    unlistedMine: { type: String, default: '' },
    unlistedMineType: { type: String, default: '' },
    penalties: [
      {
        type: { type: String, default: '' },
        penalty: { type: mongoose.SchemaTypes.Mixed, default: {} },
        description: { type: String, default: '' }
      }
    ],
    documents: [{ type: 'ObjectId', default: [], index: true }],

    summary: { type: String, default: '' },

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
