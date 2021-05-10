const mongoose = require('mongoose');

module.exports = require('../utils/model-schema-generator')(
    'ConfigData',
    {
        _schemaName: { type: String, default: 'ConfigData', index: true },
        configApplication: { type: String, default: null, required: true },
        configType: { type: String, default: null, required: true },
        data: { type: mongoose.SchemaTypes.Mixed, default: null, required: true },
        addedBy: { type: String, default: null },
        updatedBy: { type: String, default: '' },
        dateAdded: { type: Date, default: Date.now() },
        dateUpdated: { type: Date, default: null },
        write: [{ type: String, trim: true, default: 'sysadmin' }],
        read: [{ type: String, trim: true, default: 'public' }]
    },
    'nrpti'
);
