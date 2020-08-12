'use strict';

const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

let dbm;
let type;
let seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async function(db) {
  const mClient = await db.connection.connect(db.connectionString, { native_parser: true });

  try {
    console.log('Starting to transition Certificates to Certificate Amendments...');

    const nrpti = await mClient.collection('nrpti');
    const certificateAmendments = await nrpti.find({ _schemaName: 'Certificate', recordSubtype: 'Amendment', sourceSystemRef: 'epic' }).toArray();
    
    console.log(`Found ${certificateAmendments.length} Certificate Amendments`);

    for (const amendment of certificateAmendments) {
      let flavourRecordResult = null;
      let masterRecordResult = null;
      let flavourRecord = null;

      // Check if there is an LNG flavour.
      if (amendment._flavourRecords && amendment._flavourRecords.length) {
        // Epic certificates should only have a single LNG flavour, but lets confirm.
        flavourRecord = await nrpti.findOne({ _id: ObjectId(amendment._flavourRecords[0]) });

        if (flavourRecord._schemaName.includes('LNG')) {
          flavourRecordResult = await createLngFlavour(nrpti, flavourRecord);
        } else {
          console.log(`Master record ${amendment._id} had a flavour that wasn't LNG. Check flavour record ${flavourRecord._id}`);
        }
      }

      // Create the master record.
      masterRecordResult = await createMaster(nrpti, amendment, flavourRecordResult.insertedId);

      // Delete the originals.
      if (masterRecordResult) {
        await deleteRecord(nrpti, amendment._id);
      }

      if (flavourRecordResult) {
        await deleteRecord(nrpti, flavourRecord._id);
      }
    }

  } catch (err) {
    console.log('Error:', err);
  }

  console.log('Done.');
  mClient.close()
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  "version": 1
};

async function createLngFlavour(nrptiCollection, flavourRecord) {
  if (!nrptiCollection || !flavourRecord) {
    return;
  }

  const transformedRecord = {
    _schemaName: 'CertificateAmendmentLNG',
    _epicProjectId: flavourRecord._epicProjectId || '',
    _sourceRefId: flavourRecord.sourceRefId || '',
    _epicMilestoneId: flavourRecord._epicMilestoneId || '',

    mineGuid: flavourRecord.mineGuid || '',
    read: flavourRecord.read || [],
    write: flavourRecord.write || [],
    recordName: flavourRecord.recordName || '',
    recordType: 'CertificateAmendment',
    recordSubtype: '',
    dateIssued: flavourRecord.dateIssued || null,
    issuingAgency: flavourRecord.issuingAgency || '',
    legislationDescription: flavourRecord.legislationDescription || '',
    projectName: flavourRecord.projectName || '',
    location: flavourRecord.location || '',
    centroid: flavourRecord.centroid || [],
    documents: flavourRecord.documents || [],
    description: flavourRecord.description || '',
    dateAdded: flavourRecord.dateAdded || null,
    dateUpdated: flavourRecord.dateUpdated || null,
    addedBy: flavourRecord.addedBy || '',
    updatedBy: flavourRecord.updatedBy || '',
    sourceDateAdded: flavourRecord.sourceDateAdded || null,
    sourceDateUpdated: flavourRecord.sourceDateUpdated || null,
    sourceSystemRef: 'epic',
    datePublished: flavourRecord.datePublished || null,
    isLngPublished: flavourRecord.isLngPublished || false,
    isBcmiPublished: flavourRecord.isBcmiPublished || false,

    issuedTo: {
      write: ['sysadmin'],
      read: ['sysadmin'],
      type: null,
      companyName: '',
      firstName: '',
      middleName: '',
      lastName: '',
      fullName: '',
      dateOfBirth: null
    },
    legislation: {
      act: '',
      regulation: '',
      section: '',
      subSection: '',
      paragraph: '',
    }
  };

  return await nrptiCollection.insertOne(transformedRecord);
}

async function createMaster(nrptiCollection, amendment, flavourRecordId) {
  if (!nrptiCollection || !amendment) {
    return;
  }

  
  const transformedRecord = {
    _schemaName: 'CertificateAmendment',
    _epicProjectId: amendment._epicProjectId || '',
    _sourceRefId: amendment.sourceRefId || '',
    _epicMilestoneId: amendment._epicMilestoneId || '',
    _flavourRecords: flavourRecordId ? [flavourRecordId] : [],

    mineGuid: amendment.mineGuid || '',
    read: amendment.read || [],
    write: amendment.write || [],
    recordName: amendment.recordName || '',
    recordType: 'CertificateAmendment',
    recordSubtype: '',
    dateIssued: amendment.dateIssued || null,
    issuingAgency: amendment.issuingAgency || '',
    legislationDescription: amendment.legislationDescription || '',
    projectName: amendment.projectName || '',
    location: amendment.location || '',
    centroid: amendment.centroid || [],
    documents: amendment.documents || [],
    description: amendment.description || '',
    dateAdded: amendment.dateAdded || null,
    dateUpdated: amendment.dateUpdated || null,
    addedBy: amendment.addedBy || '',
    updatedBy: amendment.updatedBy || '',
    sourceDateAdded: amendment.sourceDateAdded || null,
    sourceDateUpdated: amendment.sourceDateUpdated || null,
    sourceSystemRef: 'epic',
    datePublished: amendment.datePublished || null,
    isLngPublished: amendment.isLngPublished || false,
    isBcmiPublished: amendment.isBcmiPublished || false,

    issuedTo: {
      write: ['sysadmin'],
      read: ['sysadmin'],
      type: null,
      companyName: '',
      firstName: '',
      middleName: '',
      lastName: '',
      fullName: '',
      dateOfBirth: null
    },
    legislation: {
      act: '',
      regulation: '',
      section: '',
      subSection: '',
      paragraph: '',
    }
  };


  return await nrptiCollection.insertOne(transformedRecord);
}

async function deleteRecord(nrptiCollection, recordId) {
  await nrptiCollection.deleteOne({ _id: ObjectId(recordId) });
}