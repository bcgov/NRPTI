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
};

exports.up = async function(db) {
  const mClient = await db.connection.connect(db.connectionString, { native_parser: true })
  try {
    const nrptiCollection = await mClient.collection('nrpti');

    const coreSchemas = ['Permit', 'PermitBCMI'];
    const schemas = ['MineBCMI', 'CollectionBCMI'];

    console.log('Removing Permits, Mines, and Collections');

    await nrptiCollection.remove(
      { '_schemaName' : { $in: coreSchemas }, 'sourceSystemRef': 'core' }
    );

    await nrptiCollection.remove(
      { '_schemaName' : { $in: schemas } }
    );

  } catch (e) {
    console.log('Error:', e)
  }

  mClient.close()
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  "version": 1
};
