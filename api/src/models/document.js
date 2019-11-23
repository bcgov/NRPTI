'use strict';

module.exports = require('../utils/model-schema-generator')('Document', {
  _addedBy: { type: String, default: null },
  _record: { type: 'ObjectId', ref: 'Record', default: null },
  documentFileName: { type: String, default: '' },
  // Note: Default tag property is display only, and has no real effect on the model. This must be done in the code.
  read: [{ type: String, trim: true, default: '["sysadmin"]' }],
  write: [{ type: String, trim: true, default: '["sysadmin"]' }],
  displayName: { type: String, default: '' },
  internalURL: { type: String, default: '' },
  isDeleted: { type: Boolean, default: false },
  passedAVCheck: { type: Boolean, default: false },
  internalMime: { type: String, default: '' }
});
