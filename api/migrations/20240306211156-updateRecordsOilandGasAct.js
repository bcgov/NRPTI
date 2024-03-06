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
  const mClient = await db.connection.connect(db.connectionString, { native_parser: true });
  try {
    const nrptiCollection = mClient.collection('nrpti');
    await nrptiCollection.updateMany(
      { 'legislation.act': 'Oil and Gas Activities Act' },
      { $set: { 'legislation.$.act': 'Energy Resource Activities Act' } }
    );
} catch (err) {
  console.log('Error on updating Oil and Gas Records: ', err);
  mClient.close();

} finally {
  mClient.close();
  console.log('**** updateRecordsOilandGas creation complete. ****');
}
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  "version": 1
};
