'use strict';

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function(options, seedLink) {};

exports.up = async function(db) {
  console.log('**** Deleting COORS Ticket records with old IDs ****');

  const mClient = await db.connection.connect(db.connectionString, {
    native_parser: true
  });

  try {
    const nrpti = await mClient.collection('nrpti');

    const results = await nrpti.deleteMany({
      _schemaName: { $in: ['Ticket', 'TicketLNG', 'TicketNRCED'] },
      sourceSystemRef: 'coors-csv'
    });

    console.log(`Finished deleting ${results.deletedCount} COORS Ticket records`);
  } catch (err) {
    console.log(`Error deleting COORS Ticket records: ${err}`);
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
