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
  console.log('**** Removing EPIC certificate amendments that are duplicates ****');
  const mClient = await db.connection.connect(db.connectionString, { native_parser: true });

  try {
    const nrpti = await mClient.collection('nrpti');
    await nrpti.deleteMany({ _sourceRefId: { $in: ["", null] }, sourceSystemRef: 'epic' });
  } catch (err) {
    console.error('Error removing duplicates', err);
  }

  console.log('**** Duplicates removed ****');

  mClient.close();
}

exports.down = function (db) {
  return null;
};

exports._meta = {
  "version": 1
};
