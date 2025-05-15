'use strict';

var dbm;
var type;
var seed;

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
    console.log('Starting fix for mineGUID.');

    const nrptiCollection = await mClient.collection('nrpti');

    // Change all current default values of '' to a null.
    nrptiCollection.updateMany({ mineGuid: ''}, { $set: { mineGuid: null } });
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
