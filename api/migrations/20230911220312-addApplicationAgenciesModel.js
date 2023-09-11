'use strict';
const ApplicationAgency = require('../src/models/master/applicationAgency');
const mongoose = require('mongoose');

var dbm;
var type;
var seed;

exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async function (db) {
  console.log('**** Adding ApplicationAgencies constants to nrpti collection ****');
  
  // Connect to the database
  mongoose.connect(db.connectionString, { useNewUrlParser: true, useUnifiedTopology: true });
  const dbConnection = mongoose.connection;
  
  dbConnection.on('error', console.error.bind(console, 'MongoDB connection error:'));
  dbConnection.once('open', async function () {
    const agencies = {
      AGENCY_ALC: 'Agricultural Land Commission',
      AGENCY_WF: 'BC Wildfire Service',
      AGENCY_ENV_COS: 'Conservation Officer Service',
      AGENCY_EAO: 'Environmental Assessment Office',
      AGENCY_EMLI: 'Ministry of Energy Mines and Low Carbon Innovation',
      AGENCY_ENV: 'Ministry of Environment and Climate Change Strategy',
      AGENCY_ENV_BCPARKS: 'BC Parks',
      AGENCY_OGC: 'BC Energy Regulator',
      AGENCY_ENV_EPD: 'Ministry of Environment and Climate Change Strategy',
      AGENCY_LNG: 'LNG Secretariat',
      AGENCY_AGRI: 'Ministry of Agriculture and Food',
      AGENCY_FLNRO: 'Ministry of Forests',
      AGENCY_FLNR_NRO: 'Natural Resource Officers',
      AGENCY_WLRS: 'Ministry of Water, Land and Resource Stewardship',
    };
  
    // Create and insert documents for each agency
    const agencyInsertPromises = Object.entries(agencies).map(([code, name]) =>
      ApplicationAgency.create({ agencyCode: code, agencyName: name })
        .catch(error => {
          console.error(`Error inserting agency ${code}:`, error);
        })
    );
  
    try {
      // await Promise.all(agencyInsertPromises);
      console.log('Migration completed successfully');
    } catch (error) {
      console.error('Migration failed:', error);
    }
  });

  mongoose.connection.close();
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  "version": 1
};