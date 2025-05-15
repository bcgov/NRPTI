'use strict';

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function(options, seedLink) {};

/**
 * This migration sets the isLngPublished and isNrcedPublished flags on master
 * records according to their flavours' read permissions
 */
exports.up = async function(db) {
  console.log('**** Updating flavour published status on master records ****');

  const mClient = await db.connection.connect(db.connectionString, {
    native_parser: true
  });

  try {
    const nrpti = await mClient.collection('nrpti');

    // First fix the _flavourRecords array on master.
    await fixFlavourRecordsArray(nrpti);

    // Then fix the flavour publish status on master.
    await updatePublishStatus(nrpti);
  } catch (err) {
    console.log(`Error updating flavour publish status on master records: ${err}`);
  } finally {
    mClient.close();
  }

  return null;
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1
};

/**
 * Adding this function because there are many flavour records that 
 * are not their master's _flavourRecords array.  All these flavour
 * records have added date of around July to September 2020.  So the
 * root problem seems to be resolved, just need to fix existing data.
 */
async function fixFlavourRecordsArray(nrpti) {
  console.log('Fixing _flavourRecords array...');

  const records = await nrpti.find({ $and: [{ _master: { $exists: true } }, { _master: { $ne: null } }] }).toArray();

  const promises = [];

  for (const record of records) {
    promises.push(nrpti.updateOne({ _id: record._master }, { $addToSet: { _flavourRecords: record._id } }));
  }

  await Promise.all(promises);

  console.log('Fixed _flavourRecords array...');
}

async function updatePublishStatus(nrpti) {
  console.log('Updating flavour published status on master records');

  const records = await nrpti
    .aggregate([
      {
        $match: {
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
              'Warning'
            ]
          }
        }
      },
      {
        $lookup: {
          from: 'nrpti',
          localField: '_flavourRecords',
          foreignField: '_id',
          as: 'flavours'
        }
      },
      {
        $project: {
          _id: 1,
          'flavours._schemaName': 1,
          'flavours.read': 1
        }
      }
    ])
    .toArray();

  const promises = [];
  for (const record of records) {
    let isLngPublished = false;
    let isNrcedPublished = false;

    for (const flavour of record.flavours) {
      if (flavour._schemaName.endsWith('LNG') && flavour.read.includes('public')) isLngPublished = true;

      if (flavour._schemaName.endsWith('NRCED') && flavour.read.includes('public')) isNrcedPublished = true;
    }

    promises.push(
      nrpti.updateOne(
        { _id: record._id },
        {
          $set: { isLngPublished: isLngPublished, isNrcedPublished: isNrcedPublished }
        }
      )
    );
  }

  await Promise.all(promises);

  console.log(`Finished updating ${records.length} master records`);
}
