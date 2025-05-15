'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async function (db) {
  console.log('**** Removing isBcmiPublished field from collections ****');
  const mClient = await db.connection.connect(db.connectionString, { native_parser: true });

  try {
    const nrpti = await mClient.collection('nrpti');

    await nrpti.updateMany(
      {
        _schemaName: 'CollectionBCMI',
        isBcmiPublished: { $exists: true }
      },
      {
        $unset: { 'isBcmiPublished': 1 }
      }
    );

    console.log('**** Finished updating collections ****');
  } catch (error) {
    console.error(`Migration did not complete. Error processing collections: ${error.message}`);
  }

  mClient.close();
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  "version": 1
};
