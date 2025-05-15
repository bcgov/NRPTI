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
  let failed = false;
  console.log('##########################################');
  console.log('##  Starting collection backref update  ##');
  console.log('##########################################\n');

  const mClient = await db.connection.connect(db.connectionString, { native_parser: true });

  try {
    const nrpti = await mClient.collection('nrpti');

    // adding collectionId to records
    console.log(' >> Adding new collectionId attribute to all records...');
    await nrpti.updateMany({$and: [
      {
        _schemaName: {
          $in: [
            'AdministrativePenalty',
            'AdministrativeSanction',
            'Agreement',
            'AnnualReport',
            'Certificate',
            'CertificateAmendment',
            'ConstructionPlan',
            'Correspondence',
            'CourtConviction',
            'DamSafetyInspection',
            'Inspection',
            'ManagementPlan',
            'Order',
            'Permit',
            'Report',
            'RestorativeJustice',
            'SelfReport',
            'Ticket',
            'Warning',
            'AnnualReportBCMI',
            'CertificateAmendmentBCMI',
            'CorrespondenceBCMI',
            'DamSafetyInspectionBCMI',
            'InspectionBCMI',
            'ManagementPlanBCMI',
            'OrderBCMI',
            'PermitBCMI',
            'ReportBCMI'
          ]
        }
      },
      { collectionId: { $exists: false } }
    ]},{ $set: { collectionId: null } });
    console.log(' << Attribute created!\n');
    // Get all Collections
    console.log(' >> Fetching collections...');
    const collections = await nrpti.find({ _schemaName: 'CollectionBCMI' }).toArray();

    console.log(` << Found ${collections.length} collections!\n`);
    console.log(' >> Starting backref updates...');

    for (const collection of collections) {
      if (!collection.records || collection.records.length === 0) {
        console.log(`    Collection ${collection.name} has no records. Skipping...`);
        continue;
      }

      console.log(`     >> Updating ${collection.name} record backrefs...`);
      console.log(`        found ${collection.records.length} records to update`);
      for (const recordId of collection.records) {
        // add collection backref to master
        await nrpti.update({ _id: new ObjectId(recordId) }, { $set: { collectionId: new ObjectId(collection._id) }});

        // fetch record (we need to get the _flavourRecords)
        const record  = await nrpti.findOne({ _id: new ObjectId(recordId) });

        // make sure record is not null, has a flavourRecords array, and the array isn't empty
        if (record && record._flavourRecords && record._flavourRecords.length > 0) {
          // add collectionId to BCMI flavour (if a BCMI flavour exists)
          for (const flavourId of record._flavourRecords) {
            // fetch the flavour
            const flavour  = await nrpti.findOne({ _id: new ObjectId(flavourId) });
            if (flavour._schemaName.endsWith('BCMI')) {
              // add collectiob backref to flavour
              await nrpti.update({ _id: new ObjectId(flavourId) }, { $set: { collectionId: new ObjectId(collection._id) }});
            }
          }
        }
      }
      console.log('     << Finished');
    }
    console.log(' << Finished backref updates.\n');
  } catch (err) {
    console.error('//////////////////////////////////////////');
    console.error('//  Error during backref assignment: ');
    console.error('//  Error:', err);
    console.error('//////////////////////////////////////////');
    failed = true;
  }

  console.log(failed ? '\n##  Process Failed. Please review your errors' : '\n##  All done! BackRefs added successfuly.');
  console.log('#############################################');

  mClient.close()
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  "version": 1
};
