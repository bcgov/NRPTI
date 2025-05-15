'use strict';

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function(options, seedLink) {};

exports.up = async function(db) {
  console.log('**** Deleting duplicate COORS records ****');

  const mClient = await db.connection.connect(db.connectionString, {
    native_parser: true
  });

  try {
    const nrpti = await mClient.collection('nrpti');

    const records = await nrpti.find({ _sourceRefCorsId: { $exists: true } }).toArray();

    const idsToDelete = [];

    for (const record of records) {
      idsToDelete.push(record._id);

      if (records._flavourRecords && records._flavourRecords.length) {
        for (const flavour of records._flavourRecords) {
          idsToDelete.push(flavour);
        }
      }
    }

    await nrpti.deleteMany({ _id: { $in: idsToDelete } });

    console.log(`Finished deleting ${records.length} duplicate COORS records`);
  } catch (err) {
    console.log(`Error deleting COORS records: ${err}`);
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
