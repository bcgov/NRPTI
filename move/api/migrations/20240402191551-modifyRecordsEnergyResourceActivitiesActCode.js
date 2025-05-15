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
// update all records that have Energy Resource Activities Act to replace with intermediary actCode
exports.up = async function(db) {
  const mClient = await db.connection.connect(db.connectionString, { native_parser: true });
  const ENERGY_ACT_CODE = 'ACT_103';
  try {
    const nrptiCollection = mClient.collection('nrpti');
    await nrptiCollection.updateMany(
      { 'legislation.act': 'Energy Resource Activities Act' },
      { $set: { 'legislation.$.act': ENERGY_ACT_CODE } }
    );
} catch (err) {
  console.log('Error on updating Energy Records: ', err);
  mClient.close();

} finally {
  mClient.close();
  console.log('**** modifyRecordsEnergyResourceActivitiesActCode migration complete. ****');
}
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  "version": 1
};
