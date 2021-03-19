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
  console.log('**** Running filenameURL re-encoder ****');
  const mClient = await db.connection.connect(db.connectionString, { native_parser: true });
  const nrpti = await mClient.collection('nrpti');

  console.log('**** Querying Documents ****');
  const records = await nrpti.find({
    _schemaName: 'Document'
  }).toArray();

  console.log(`**** Processing ${records.length} Documents ****`);
  records.forEach(async record => {
    const newURL = record.url.replace('#', '%23');
    await nrpti.updateOne({
      _id: record._id
    },
    {
      $set: { url: newURL }
    });
    console.log('Updated docId:', record._id);
  });

  mClient.close();
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  "version": 1
};
