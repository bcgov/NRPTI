'use strict';

// list all collections that require this migration
const collections = ['nrpti', 'redacted_record_subset'];

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function(options, seedLink) {};

exports.up = async function(db) {
  console.log('**** Deleting existing EMLI records ****');

  const mClient = await db.connection.connect(db.connectionString, {
    native_parser: true
  });

  try {
    for (const collection of collections) {
      try {
        const dbCollection = await mClient.collection(collection);

        const result = await dbCollection.deleteMany({ sourceSystemRef: 'nris-emli' });

        console.log(`Deleted ${result.deletedCount} records from ${collection}`);
      } catch (err) {
        console.log(`Error deleting records (${collection}): ${err}`);
      }
    }

    console.log(`**** Finished deleting existing EMLI records ****`);
  } catch (err) {
    console.log(`Error deleting records: ${err}`);
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
