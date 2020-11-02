'use strict';

module.exports = require('../../utils/model-schema-generator')(
  'CollectionBCMI',
  {
    _schemaName: { type: String, default: 'CollectionBCMI' },
    _sourceRefId: { type: 'ObjectId', default: null, index: true },
    read: [{ type: String, trim: true, default: 'sysadmin' }],
    write: [{ type: String, trim: true, default: 'sysadmin' }],

    // The name shown on the UI
    name: { type: String, default: '' },

    // The date shown on the UI
    date: { type: Date, default: Date.now() },

    // This is the mine/project/etc
    project: { type: 'ObjectId', index: true },

    // Type: Amendment, Permit, Management Plan, etc.. depending on which
    // type is specified here, it will automatically be selected for display
    // in the various tabs: Authorizations, Compliance Oversight, or
    // Other Documents.  No need to store the tab specific info (we do the
    // same on LNG public)
    type: { type: String, default: '' },

    // EMPR can be anything we want the default
    // Ministry of Environment tag to be.  NB: Migration moves from the 3
    // isForXXX => booleans to the respective tag (below is EMPR tag)
    // isForMEM => EMPR, isForEAO => EAO, isForENV => ENV
    agency: { type: String, default: 'EMPR' },

    // Links to various record types in NRPTI.  This will
    // be treated as a sorted list.  visual will be embedded in a populated
    // record.recordName and record.document[0].url
    records: [{ type: 'ObjectId', default: [] }],

    // Internal NRPT fields
    dateAdded: { type: Date, default: Date.now() },
    addedBy: { type: String, default: '' },
    dateUpdated: { type: Date, default: null },
    updatedBy: { type: String, default: '' },
    datePublished: { type: Date, default: null },
    sourceSystemRef: { type: String, default: 'nrpti' },
    publishedBy: { type: String, default: '' }
  },
  'nrpti'
);
