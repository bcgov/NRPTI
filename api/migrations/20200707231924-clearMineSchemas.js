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

    console.log('Removing all Core Permit Amendments');

    await nrptiCollection.remove(
      { "_schemaName" : "PermitAmendment", "sourceSystemRef": "core" }
    );

    await nrptiCollection.remove(
      { "_schemaName" : "PermitAmendmentBCMI", "sourceSystemRef": "core" }
    );

    console.log('Removing all Core Permits');

    await nrptiCollection.remove(
      { "_schemaName" : "Permit", "sourceSystemRef": "core" }
    );

    await nrptiCollection.remove(
      { "_schemaName" : "PermitBCMI", "sourceSystemRef": "core" }
    );

    console.log('Removing all Core Mines');
    
    await nrptiCollection.remove(
      { "_schemaName" : "MineBCMI", "sourceSystemRef": "core" }
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
