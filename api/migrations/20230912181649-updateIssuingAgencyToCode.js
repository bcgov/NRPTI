/**
 * @summary Updates existing records in nrpti and redacted_record_subset to use agency/ministry codes instead of names.
 */

/**
 * @param {Object} db - Database connection object.
 * @description Updates records in specified collections to use agency codes instead of agency values.
 */
exports.up = async function (db) {
  const mClient = await db.connection.connect(db.connectionString, {
    native_parser: true,
  });

  const agencies = [
    { agencyCode: 'AGENCY_ALC', agencyName: 'Agricultural Land Commission' },
    { agencyCode: 'AGENCY_WF', agencyName: 'BC Wildfire Service' },
    { agencyCode: "AGENCY_ENV_COS", agencyName: 'Conservation Officer Service' },
    { agencyCode: "AGENCY_EAO", agencyName: 'Environmental Assessment Office' },
    { agencyCode: "AGENCY_EMLI", agencyName: 'Ministry of Energy Mines and Low Carbon Innovation' },
    { agencyCode: "AGENCY_ENV", agencyName: 'Ministry of Environment and Climate Change Strategy' },
    { agencyCode: "AGENCY_ENV_BCPARKS", agencyName: 'BC Parks' },
    { agencyCode: "AGENCY_OGC", agencyName: 'BC Energy Regulator' },
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

/**
 * @param {Object} db - Database connection object.
 * @description Performs the reverse migration (not implemented in this script).
 */
exports.down = function (db) {
  return null;
};

/**
 * @property {Object} _meta
 * @property {number} _meta.version - The version of the migration script.
 */
exports._meta = {
  version: 1
};
