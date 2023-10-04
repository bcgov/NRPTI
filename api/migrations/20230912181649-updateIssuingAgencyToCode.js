'use strict';

var dbm;
var seed;

/**
 * Migration file for updating all existing records to use agency code instead of agency value
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  seed = seedLink;
};

exports.up = async function (db) {
  const mClient = await db.connection.connect(db.connectionString, {
    native_parser: true,
  });

  const LegislationActs = {
    ACT_Env_Management: 'Environmental Management Act',
    ACT_Int_Pest_Management: 'Integrated Pest Management Act',
  };

  const agencies = [
    { agencyCode: 'AGENCY_ALC', agencyName: 'Agricultural Land Commission' },
    { agencyCode: 'AGENCY_WF', agencyName: 'BC Wildfire Service' },
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
    { agencyCode: "AGENCY_CAS", agencyName: 'Climate Action Secretariat' }
  ];

  const collections = ['nrpti', 'redacted_record_subset'];

  try {
    for (let collection of collections) {
      console.log(`***** Collection: ${collection} *****`);
      console.log(`***** Updating ocers-csv records *****`);

      try {
        let currentCollection = await mClient.collection(collection);

        // Update issuingAgency to 'AGENCY_ENV_EPD' for specific records
        await currentCollection.updateMany(
          {
            $and: [
              { issuingAgency: 'Ministry of Environment and Climate Change Strategy' },
              { author: 'Ministry of Environment and Climate Change Strategy' },
              { 'legislation.act': { $in: [LegislationActs.ACT_Env_Management, LegislationActs.ACT_Int_Pest_Management] } }
            ]
          },
          { $set: { issuingAgency: 'AGENCY_ENV_EPD', author: 'AGENCY_ENV_EPD' } }
        );

        console.log(` ***** Updated records in collection: ${collection} *****`);
      } catch (err) {
        console.error(` ***** Error updating collection: ${collection} *****`, err);
      }

      console.log(`***** Updating all other records records *****`);
      try {
        let currentCollection = await mClient.collection(collection);

        for (const agency of agencies) {
            // Update issuingAgency and author fields for the agency
            await currentCollection.updateMany(
              { issuingAgency: agency['agencyName']  },
              { $set: { issuingAgency: agency['agencyCode'] } }
            );

            console.log(` ***** Updated collection: ${collection} for agency: ${agency['agencyName']} *****`);
        } 
      } catch (err) {
        console.error(` ***** Error updating collection: ${collection} for agency: ${agency['agencyName']} *****`, err);
      }
    }
  } catch (err) {
    console.error('Error connecting to the database:', err);
  } finally {
    if (mClient) {
      await mClient.close();
    }
  }

  return null;
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1
};

/**
 * Update a record in the collection with a new agency code.
 * @param {Collection} collection - MongoDB collection.
 * @param {string} recordId - The ID of the record to update.
 * @param {string} newAgencyCode - The new agency code.
 */
async function updateRecord(collection, recordId, newAgencyCode) {
  await collection.updateOne(
    { _id: recordId },
    { $set: { 'legislation.act': newAgencyCode } }
  );
}
