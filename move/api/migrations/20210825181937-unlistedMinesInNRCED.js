'use strict';

// list all collections that require this migration
const collections = ['nrpti', 'redacted_record_subset']

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function (options, seedLink) { };

exports.up = async function (db) {
  console.log('**** Adding unlistedMine fields to NRCED flavour records ****');

  const mClient = await db.connection.connect(db.connectionString, {
    native_parser: true
  });

  for (let collection of collections) {

    try {
      let currentCollection = await mClient.collection(collection);

      console.log(`Collection: ${collection}`);


      // ensure all NRCED flavours of AdministrativePenalty and CourtConviction have unlistedMine & unlistedMineType fields

      await currentCollection.updateMany(
        {
          $and: [
            {
              $or: [
                { _schemaName: 'AdministrativePenaltyNRCED' },
                { _schemaName: 'CourtConvictionNRCED' }
              ]
            },
            {
              unlistedMine: { $exists: false }
            }
          ]
        },
        {
          $set: { unlistedMine: '' }
        }
      )

      await currentCollection.updateMany(
        {
          $and: [
            {
              $or: [
                { _schemaName: 'AdministrativePenaltyNRCED' },
                { _schemaName: 'CourtConvictionNRCED' }
              ]
            },
            {
              unlistedMineType: { $exists: false }
            }
          ]
        },
        {
          $set: { unlistedMineType: '' }
        }
      )

    } catch (err) {
      console.log(`Error adding unlistedMine fields (${collection}): ${err}`);
    }
  }

  console.log(`**** Finished adding unlistedMine fields to NRCED flavour records ****`);
  mClient.close();

  return null;
}

exports.down = function (db) {
  return null;
};

exports._meta = {
  "version": 1
};