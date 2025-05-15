const mongoose = require('mongoose');

module.exports = require('../utils/model-schema-generator')(
  'FeatureFlag',
  {
    _schemaName: { type: String, default: 'FeatureFlag', index: true },
    data: { type: mongoose.SchemaTypes.Mixed, default: '{}' },

    addedBy: { type: String, default: null },
    dateAdded: { type: Date, default: Date.now() },

    updatedBy: { type: String, default: null },
    dateUpdated: { type: Date, default: null },

    // Permissions
    write: [{ type: String, trim: true, default: 'sysadmin' }],
    read: [{ type: String, trim: true, default: 'public' }]
  },
  'nrpti'
);
