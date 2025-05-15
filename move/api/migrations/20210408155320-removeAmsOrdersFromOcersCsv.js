'use strict';

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function(options, seedLink) {};

exports.up = async function(db) {
  console.log('**** Deleting duplicate AMS Orders from OCERS-CSV ****');

  const mClient = await db.connection.connect(db.connectionString, {
    native_parser: true
  });

  try {
    const nrpti = await mClient.collection('nrpti');

    // Delete these duplicate AMS Order records from the ocers-csv source
    const result = await nrpti.deleteMany({
      sourceSystemRef: 'ocers-csv',
      'legislation.act': 'Environmental Management Act',
      'legislation.section': { $in: ['77', '81', '83'] }
    });

    console.log(`Finished deleting ${result.deletedCount} Orders from OCERS-CSV`);
  } catch (err) {
    console.log(`Error deleting duplicate AMS Orders from OCERS-CSV: ${err}`);
  } finally {
    mClient.close();
  }

  return null;
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1
};
