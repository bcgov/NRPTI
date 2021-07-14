'use strict';

// list all collections that require this migration
const collections = ['nrpti']

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function (options, seedLink) { };

exports.up = async function (db) {
  console.log('**** Amalgamating issuing agency names ****');

  const mClient = await db.connection.connect(db.connectionString, {
    native_parser: true
  });

  for (let collection of collections) {

    try {
      let currentCollection = await mClient.collection(collection);

      console.log(`Collection: ${collection}`);

      // Some difficulties arise in agencies with commas in their name - currently our search filter parses the query at these commas,
      // parsing the query string up incorrectly. For now, these agencies will have the comma removed in the db, and reinserted in their display names.

      await currentCollection.updateMany(
        { issuingAgency: 'Agriculture Land Commission C&E division' },
        { $set: { issuingAgency: 'Agricultural Land Commission' } }
      );

      await currentCollection.updateMany(
        { issuingAgency: 'Conservation Officer Service (COS)' },
        { $set: { issuingAgency: 'Conservation Officer Service' } }
      );

      await currentCollection.updateMany(
        { issuingAgency: 'EAO' },
        { $set: { issuingAgency: 'Environmental Assessment Office' } }
      );

      await currentCollection.updateMany(
        {
          $or: [
            { issuingAgency: 'Ministry of Energy, Mines and Low Carbon Innovation' },
            { issuingAgency: 'EMLI' },
          ]
        },
        { $set: { issuingAgency: 'Ministry of Energy Mines and Low Carbon Innovation' } }
      );

      await currentCollection.updateMany(
        { issuingAgency: 'ENV' },
        { $set: { issuingAgency: 'Ministry of Environment and Climate Change Strategy' } }
      );

      await currentCollection.updateMany(
        {
          $or: [
            { issuingAgency: 'Ministry of Forests, Lands and Natural Resource Operations' },
            { issuingAgency: 'Ministry of Forests, Lands, Natural Resource Operations and Rural Development' },
            { issuingAgency: 'FLNRO' },
          ]
        },
        { $set: { issuingAgency: 'Ministry of Forests Lands Natural Resource Operations and Rural Development' } }
      );

      await currentCollection.updateMany(
        { issuingAgency: 'Natural Resource Officers (NRO)' },
        { $set: { issuingAgency: 'Natural Resource Officers' } }
      );

      await currentCollection.updateMany(
        { issuingAgency: 'Ministry of Agriculture' },
        { $set: { issuingAgency: 'Ministry of Agriculture Food and Fisheries' } }
      );

      console.log(`Finished collection: ${collection}`);

    } catch (err) {
      console.log(`Error amalgamating issuing agency names (${collection}): ${err}`);
    }
  }

  console.log(`**** Finished amalgamating issuing agency names ****`);
  mClient.close();

  return null;
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  "version": 1
};
