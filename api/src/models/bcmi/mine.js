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

module.exports = require('../../utils/model-schema-generator')(
  'MineBCMI',
  {
    _schemaName: { type: String, default: 'Mine', index: true },
    _sourceRefId:  { type:'ObjectId', default: null, index: true },

    read: [{ type: String, trim: true, default: 'sysadmin' }],
    write: [{ type: String, trim: true, default: 'sysadmin' }],

    name: { type: String, default: '' },
    permitNumber: [{ type: String, default: '' }],
    status: { type: String, default: '' },
    type: { type: String, default: '' },
    commodities: { type: String, default: '' },
    tailingsImpoundments: { type: Number, default: 0 },
    region: { type: String, default: '' },
    location : { type: GeoJSON, default: { type: "Point", coordinates: [ 0.00, 0.00 ] } },
    operator: { type: String, default: '' },
    owner: { type: String, default: '' },
    summary: { type: String, default: '' },
    description: { type: String, default: '' },
    links: [{ type: String, trim: true, default: '' }],

    dateAdded: { type: Date, default: Date.now() },
    dateUpdated: { type: Date, default: null },
    datePublished: { type: Date, default: null },

    addedBy: { type: String, default: '' },
    updatedBy: { type: String, default: '' },
    publishedBy: { type: String, default: '' },

    sourceDateAdded: { type: Date, default: null },
    sourceDateUpdated: { type: Date, default: null },
    sourceSystemRef: { type: String, default: 'core' }
  },
  'nrpti'
);
