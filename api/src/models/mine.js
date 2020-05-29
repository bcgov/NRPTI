let mongoose = require('mongoose');

let GeoJSON = new mongoose.Schema(
  {
      type:
      {
        type: String,
        enum: ['Point'],
        required: true
      },
      coordinates:
      {
        type: [Number],
        required: true
      }
  });

module.exports = require('../utils/model-schema-generator')(
  'Mine',
  {
    _schemaName: { type: String, default: 'Mine', index: true },
    name: { type: String, default: '' },
    permitNumber: { type: String, default: '' },
    status: { type: String, default: '' },
    type: { type: String, default: '' },
    commodities: { type: String, default: '' },
    // number of tailings impoundments
    tailingsImpoundments: { type: Number, default: 0 },
    region: { type: String, default: '' },
    location : { type: GeoJSON, default: { type: "Point", coordinates: [ 0.00, 0.00 ] } },
    operator: { type: String, default: '' },
    owner: { type: String, default: '' },
    summary: { type: String, default: '' },
    description: { type: String, default: '' },
    links: [{ type: String, trim: true, default: '' }],
    read: [{ type: String, trim: true, default: 'sysadmin' }],
    write: [{ type: String, trim: true, default: 'sysadmin' }]
  },
  'nrpti'
);
