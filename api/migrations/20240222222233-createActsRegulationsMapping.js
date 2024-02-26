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
    let promises = [];
    const nrptiCollection = mClient.collection('nrpti');
        const actsRegulationsMappingData = {
          '_schemaName': 'ApplicationAgency',
          'agencyCode': 'AGENCY_OGC',
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
    promises.push(
      nrptiCollection.findOneAndUpdate(
        { _schemaName: actsRegulationsMappingData['_schemaName'], agencyCode: actsRegulationsMappingData['agencyCode']  },
        { $set: { parentAct: actsRegulationsMappingData['act']} }
      )
    );
    await Promise.all(promises);
    
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
