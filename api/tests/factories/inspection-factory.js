const factory = require('factory-girl').factory;
const Inspection = require('../../models/inspection');

factory.define('inspection', Inspection, {
  code: factory.seq('Inspection.code', element => `app-code-${element}`),
  isDeleted: false,
  internal: {
    read: ['public', 'sysadmin']
  },
  name: factory.seq('Inspection.name', element => `inspection-${element}`),
  read: ['public', 'sysadmin']
});

exports.factory = factory;
