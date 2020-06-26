let mongoose = require('mongoose');

const PermitAmendment = new mongoose.Schema(
  {
    _sourceRefId: { type: String, default: null },
    statusCode: { type: String, default: '' },
    typeCode: { type: String, default: '' },
    receivedDate: { type: Date, default: null },
    issueDate: { type: Date, default: null },
    authorizedEndDate: { type: Date, default: null },
    description: { type: String, default: '' },
    documents: [{
      _sourceRefId: { type: String, default: null},
      documentId: { type: 'ObjectId', default: null }
    }]
  });

module.exports = require('../../utils/model-schema-generator')(
  'MinePermit',
  {
    _schemaName: { type: String, default: 'MinePermit', index: true },
    _sourceRefId:  { type: String, default: null, index: true },

    read: [{ type: String, trim: true, default: 'sysadmin' }],
    write: [{ type: String, trim: true, default: 'sysadmin' }],

    mineGuid: { type: String, default: '' },
    permitNumber: { type: String, default: '' },
    status: { type: String, default: '' },
    permitAmendments: [{ type: PermitAmendment }],

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
