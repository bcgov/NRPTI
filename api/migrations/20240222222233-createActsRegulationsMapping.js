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
    const actsRegulationsMappingCollection = mClient.collection('acts_regulations_mapping');
        const actsRegulationsMappingData = {
          '_schemaName': 'ActsRegulations',
          'actCode': 'ACT_ERA',
          'act': { 'name': 'Energy Resource Activities Act',
          'regulations': [
            'Administrative Penalties Regulation',
            'Consultation and Notification Regulation',
            'Direction No. 1 to the Oil and Gas Commission',
            'Drilling and Production Regulation',
            'Emergency Management Regulation',
            'Environmental Protection and Management Regulation',
            'Fee, Levy and Security Regulation',
            'Geophysical Exploration Regulation',
            'Liquefied Natural Gas Facility Regulation',
            'Energy Resource Activities Act General Regulation',
            'Oil and Gas Road Regulation',
            'Pipeline Crossings Regulation',
            'Pipeline Regulation',
            'Service Regulation'
          ]
        }
        };
    const result = await actsRegulationsMappingCollection.insertOne(actsRegulationsMappingData);
    console.log(`Document inserted with ID: ${result.insertedId}`);
    
  } catch (err) {
    console.log('Error on index creation: ', err);
    mClient.close();

  } finally {
    mClient.close();
    console.log('**** acts_regulations_mapping creation complete. ****');
  }
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  "version": 1
};
