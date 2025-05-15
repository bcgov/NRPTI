module.exports = require('../utils/model-schema-generator')(
  'Document',
  {
    _schemaName: { type: String, default: 'Document', index: true },
    fileName: { type: String, default: null },
    url: { type: String, default: null },
    key: { type: 'string', default: null },

    addedBy: { type: String, default: null },
    dateAdded: { type: Date, default: Date.now() },

    updatedBy: { type: String, default: null },
    dateUpdated: { type: Date, default: null },

    // Permissions
    write: [{ type: String, trim: true, default: 'sysadmin' }],
    read: [{ type: String, trim: true, default: 'sysadmin' }]
  },
  'nrpti'
);
