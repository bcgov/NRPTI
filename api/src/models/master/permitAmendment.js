'use strict';

module.exports = require('../../utils/model-schema-generator')(
  'PermitAmendment',
  {
    _schemaName: { type: String, default: 'PermitAmendment', index: true },
    _sourceRefId:  { type: String, default: null, index: true },

    read: [{ type: String, trim: true, default: 'sysadmin' }],
    write: [{ type: String, trim: true, default: 'sysadmin' }],

    _flavourRecords: [{ type: 'ObjectId', default: [], index: true }],

    statusCode: { type: String, default: '' },
    typeCode: { type: String, default: '' },
    receivedDate: { type: Date, default: null },
    issueDate: { type: Date, default: null },
    authorizedEndDate: { type: Date, default: null },
    description: { type: String, default: '' },
    documents: [{
      _sourceRefId: { type: String, default: null },
      documentName: { type: String, defualt: '' },
      documentId: { type: 'ObjectId', default: null }
    }],

    dateAdded: { type: Date, default: Date.now() },
    dateUpdated: { type: Date, default: null },

    addedBy: { type: String, default: '' },
    updatedBy: { type: String, default: '' },

    isBcmiPublished: { type: Boolean, default: false, index: true },

    sourceSystemRef: { type: String, default: 'core' }
  },
  'nrpti'
);
