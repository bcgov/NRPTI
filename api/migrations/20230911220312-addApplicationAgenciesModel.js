'use strict';
const ApplicationAgency = require('../src/models/master/applicationAgency');
const mongoose = require('mongoose');

var dbm;
var type;
var seed;

/*
Migration file for adding agency codes and agency values to the nrpti collection
*/

exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async function (db) {
  console.log('**** Adding ApplicationAgencies constants to nrpti collection ****');
  
  // Connect to the database
  const mClient = await db.connection.connect(db.connectionString, {
    native_parser: true,
  });
  
  const agencies = [
    { agencyCode: "AGENCY_ALC", agencyName: 'Agricultural Land Commission' },
    { agencyCode: "AGENCY_WF", agencyName: 'BC Wildfire Service' },
    { agencyCode: "AGENCY_ENV_COS", agencyName: 'Conservation Officer Service' },
    { agencyCode: "AGENCY_EAO", agencyName: 'Environmental Assessment Office' },
    { agencyCode: "AGENCY_EMLI", agencyName: 'Ministry of Energy Mines and Low Carbon Innovation' },
    { agencyCode: "AGENCY_ENV", agencyName: 'Ministry of Environment and Climate Change Strategy' },
    { agencyCode: "AGENCY_ENV_BCPARKS", agencyName: 'BC Parks' },
    { agencyCode: "AGENCY_OGC", agencyName: 'BC Energy Regulator' },
    { agencyCode: "AGENCY_ENV_EPD", agencyName: 'Ministry of Environment and Climate Change Strategy' },
    { agencyCode: "AGENCY_LNG", agencyName: 'LNG Secretariat' },
    { agencyCode: "AGENCY_AGRI", agencyName: 'Ministry of Agriculture and Food' },
    { agencyCode: "AGENCY_FLNRO", agencyName: 'Ministry of Forests' },
    { agencyCode: "AGENCY_FLNR_NRO", agencyName: 'Natural Resource Officers' },
    { agencyCode: "AGENCY_WLRS", agencyName: 'Ministry of Water, Land and Resource Stewardship' },
    { agencyCode: "AGENCY_CAS", agencyName: 'Climate Action Secretariat' },
  ]

  try {
    let currentCollection = await mClient.collection('nrpti');
    
    for (const agency of agencies) {
      const existingAgency = await currentCollection.findOne({ _schemaName: 'ApplicationAgency', agencyCode: agency['agencyCode'] });

      if (!existingAgency) {
        await currentCollection.insertOne(
          { 
            _schemaName: 'ApplicationAgency',
            agencyCode: agency['agencyCode'],
            agencyName: agency['agencyName'],
            read: ['sysadmin'],
            write: ['sysadmin'],
            dateAdded: new Date(),
            dateUpdated: null,
            addedBy: '',
            updatedBy: '',
          }
        );
          console.log(` **** Add the ApplicationAgency code ${agency['agencyCode']} into nrpti collection ****`);
      } else {
        console.log(' **** ApplicationAgency code already exists in nrpti collection ****')
      }
    }
  } catch (err) {
    console.log(` **** Error updating nrpti collection for agency: ${agency['agencyName']} ****`, err);
  } finally {
    if (mClient) {
      console.log(' **** Closing connection to nrpti collection ****')
      await mClient.close();
    }
  }

  return null;
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  "version": 1
};
