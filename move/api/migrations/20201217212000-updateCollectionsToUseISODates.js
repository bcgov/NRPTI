'use strict';

let dbm;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
};

exports.up = async function(db) {
  console.log('**** Updating bcmi collection dates ****');
  const mClient = await db.connection.connect(db.connectionString, { native_parser: true });

  try {
    const nrpti = await mClient.collection('nrpti');

    const collections = await nrpti.find({ _schemaName: 'CollectionBCMI' }).toArray();
    const collectionsWithStringDates = collections.filter(collection => collection.date && typeof collection.date == 'string');

    let count = 0;

    collectionsWithStringDates.forEach( async collection => {
      count += 1;
      collection.date = new Date(collection.date);
      await nrpti.update({ _id: collection._id }, { $set: collection });
    });

    console.log('**** Finished updating ' + count + ' bcmi collection dates ****');
  } catch (error) {
    console.error(`Migration did not complete. Error processing collections: ${error.message}`);
  }

  mClient.close();
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  "version": 1
};
