module.exports = require('../../utils/model-schema-generator')(
  'PermitBCMI',
  {
    _schemaName: { type: String, default: 'PermitBCMI', index: true },
    _sourceRefId:  { type: String, default: null, index: true },

    read: [{ type: String, trim: true, default: 'sysadmin' }],
    write: [{ type: String, trim: true, default: 'sysadmin' }],

    mineGuid: { type: String, default: '' },
    permitNumber: { type: String, default: '' },
    status: { type: String, default: '' },
    permitAmendments: [{ type: 'ObjectId', default: [], index: true }],

    dateAdded: { type: Date, default: Date.now() },
    dateUpdated: { type: Date, default: null },
    datePublished: { type: Date, default: null },

    addedBy: { type: String, default: '' },
    updatedBy: { type: String, default: '' },
    publishedBy: { type: String, default: '' },

    sourceSystemRef: { type: String, default: 'core' }
  },
  'nrpti'
);
