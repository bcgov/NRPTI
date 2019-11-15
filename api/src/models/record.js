'use strict';

module.exports = require('../utils/model-schema-generator')('Record', {
  isDeleted: { type: Boolean, default: false },
  tags: [[{ type: String, trim: true, default: '[["sysadmin"]]' }]]
});
