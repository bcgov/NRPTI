'use strict';

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function(options, seedLink) {};

exports.up = async function(db) {
  console.log('**** Renaming Conservation Officer Service issuing agency ****');

  const mClient = await db.connection.connect(db.connectionString, {
    native_parser: true
  });

  try {
    const nrpti = await mClient.collection('nrpti');

    await nrpti.updateMany(
      {
        issuingAgency: 'Conservation Officer Service'
      },
      { $set: { issuingAgency: 'Conservation Officer Service (COS)' } }
    );

    console.log(`Finished renaming Conservation Officer Service issuing agency`);
  } catch (err) {
    console.log(`Error renaming Conservation Officer Service issuing agency: ${err}`);
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
