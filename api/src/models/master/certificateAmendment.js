'use strict';

module.exports = require('../../utils/model-schema-generator')(
  'CertificateAmendment',
  {
    _schemaName:      { type: String, default: 'CertificateAmendment', index: true },
    _epicProjectId:   { type: 'ObjectId', default: null, index: true },
    _sourceRefId:     { type: 'ObjectId', default: null, index: true },
    _epicMilestoneId: { type: 'ObjectId', default: null, index: true },
    mineGuid:         { type: String, default: '', index: true },
    read:             [{ type: String, trim: true, default: 'sysadmin' }],
    write:            [{ type: String, trim: true, default: 'sysadmin' }],
    _flavourRecords:  [{ type: 'ObjectId', default: [], index: true }],
    recordName:       { type: String, default: '' },
    recordType:       { type: String, default: '' },
    recordSubtype:    { type: String, default: 'Certificate' },
    issuedTo: {
      write:       [{ type: String, trim: true, default: 'sysadmin' }],
      read:        [{ type: String, trim: true, default: 'sysadmin' }],
      type:        { type: String, enum: ['Company', 'Individual', 'IndividualCombined'] },
      companyName: { type: String, default: '' },
      firstName:   { type: String, default: '' },
      middleName:  { type: String, default: '' },
      lastName:    { type: String, default: '' },
      fullName:    { type: String, default: '' },
      dateOfBirth: { type: Date, default: null }
    },
    dateIssued:       { type: Date, default: null },
    issuingAgency:    { type: String, default: '' },
    legislation: {
      act:        { type: String, default: '' },
      regulation: { type: String, default: '' },
      section:    { type: String, default: '' },
      subSection: { type: String, default: '' },
      paragraph:  { type: String, default: '' }
    },
    legislationDescription: { type: String, default: '' },
    projectName:            { type: String, default: '' },
    location:               { type: String, default: '' },
    centroid:               [{ type: Number, default: 0.0 }],
    documents:              [{ type: 'ObjectId', default: [], index: true }],
    description:            { type: String, default: '' },
    dateAdded:              { type: Date, default: Date.now() },
    dateUpdated:            { type: Date, default: null },
    addedBy:                { type: String, default: '' },
    updatedBy:              { type: String, default: '' },
    sourceDateAdded:        { type: Date, default: null },
    sourceDateUpdated:      { type: Date, default: null },
    sourceSystemRef:        { type: String, default: 'nrpti' },
    isLngPublished:        { type: Boolean, default: false, index: true },
    isBcmiPublished:        { type: Boolean, default: false, index: true }
  },
  'nrpti'
);
