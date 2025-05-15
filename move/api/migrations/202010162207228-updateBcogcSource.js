'use strict';

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
}

exports.up = async function(db) {
  console.log('**** Updating bcogc-csv source ****');
  const mClient = await db.connection.connect(db.connectionString, { native_parser: true });

  try {
    const nrpti = await mClient.collection('nrpti');

    await nrpti.updateMany({ sourceSystemRef: 'bcogc-csv' }, {  $set: { sourceSystemRef: 'bcogc' } });

    console.log('**** Finished updating records ****');
  } catch (error) {
    console.error(`Migration did not complete. Error processing records: ${error.message}`);
  }

  mClient.close();
}

exports.down = function(db) {
  return null;
}

exports._meta = {
  "version": 1
}
