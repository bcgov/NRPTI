module.exports = require('../utils/model-schema-generator')(
  'Metric',
  {
    _schemaName: { type: String, default: 'Metric', index: true },
    code: { type: String, default: '' },
    description: { type: String, default: '' },
    operation: { type: String, default: '' },

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
