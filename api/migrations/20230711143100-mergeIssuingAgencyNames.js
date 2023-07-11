'use strict';

// list all collections that require this migration
const collections = ['nrpti', 'redacted_record_subset']

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

      await currentCollection.updateMany(
        { issuingAgency: 'BC Oil and Gas Commission' },
        { $set: { issuingAgency: 'BC Energy Regulator' }, }
      );

      await currentCollection.updateMany(
        { author: 'BC Oil and Gas Commission' },
        { $set: { author: 'BC Energy Regulator' } }
      );

      await currentCollection.updateMany(
        { issuingAgency: 'Agriculture Land Commission' },
        { $set: { issuingAgency: 'Agricultural Land Commission' }, }
      );

      await currentCollection.updateMany(
        { author: 'Agriculture Land Commission' },
        { $set: { author: 'Agricultural Land Commission' } }
      );


      await currentCollection.updateMany(
        { issuingAgency: 'Environmental Protection Division' },
        { $set: { issuingAgency: 'Ministry of Environment and Climate Change Strategy' }, }
      );

      await currentCollection.updateMany(
        { author: 'Environmental Protection Division' },
        { $set: { author: 'Ministry of Environment and Climate Change Strategy' } }
      );


      await currentCollection.updateMany(
        { issuingAgency: 'FLNRO' },
        { $set: { issuingAgency: 'Ministry of Forests' }, }
      );

      await currentCollection.updateMany(
        { author: 'FLNRO' },
        { $set: { author: 'Ministry of Forests' } }
      );


      await currentCollection.updateMany(
        { issuingAgency: 'Ministry of Agriculture Food and Fisheries' },
        { $set: { issuingAgency: 'Ministry of Agriculture and Food' }, }
      );

      await currentCollection.updateMany(
        { author: 'Ministry of Agriculture Food and Fisheries' },
        { $set: { author: 'Ministry of Agriculture and Food' } }
      );


      await currentCollection.updateMany(
        { issuingAgency: 'Ministry of Forests Lands Natural Resource Operations and Rural Development' },
        { $set: { issuingAgency: 'Ministry of Forests' }, }
      );

      await currentCollection.updateMany(
        { author: 'Ministry of Forests Lands Natural Resource Operations and Rural Development' },
        { $set: { author: 'Ministry of Forests' } }
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
