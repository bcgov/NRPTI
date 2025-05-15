'use strict';

var dbm;
var type;
var seed;

var ObjectID = require('mongodb').ObjectID;

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
  const mClient = await db.connection.connect(db.connectionString, { native_parser: true })
  try {
    const nrptiCollection = await mClient.collection('nrpti');

    console.log('Updating lng-csv records with wrong LNG Canada _epicProjectId.');
    await nrptiCollection.updateMany(
      { sourceSystemRef: 'lng-csv', _epicProjectId: new ObjectID("588510cdaaecd9001b815f84") },
      { $set: { _epicProjectId: new ObjectID("588511d0aaecd9001b826192") } }
    );
    mClient.close()
  } catch (e) {
    console.log('Error:', e)
    mClient.close()
  }
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  "version": 1
};
