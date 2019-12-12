module.exports = require('../utils/model-schema-generator')('Task', {
  _schemaName: { type: String, default: 'Task' },
  dataSource: { type: String, default: '' },
  dataSourceLabel: { type: String, default: '' },
  startDate: { type: Date, default: new Date() },
  finishDate: { type: Date, default: null },
  itemTotal: { type: Number, default: 0 },
  itemsProcessed: { type: Number, default: 0 },
  status: { type: String, default: 'Created' },
  read: [{ type: String, trim: true, default: 'sysadmin' }],
  write: [{ type: String, trim: true, default: 'sysadmin' }]
}, 'nrpti');
