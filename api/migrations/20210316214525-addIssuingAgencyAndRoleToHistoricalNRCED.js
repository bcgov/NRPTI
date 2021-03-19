'use strict';

const { ApplicationRoles, ApplicationAgencies } = require('../src/utils/constants/misc');

const LegislationActs = {
  ACT_Agri_Land_Commission: 'Agricultural Land Commission Act',
  ACT_Dike_Maintenance: 'Dike Maintenance Act',
  ACT_Env_Management: 'Environmental Management Act',
  ACT_Fish_Seafood: 'Fish and Seafood Act',
  ACT_Fisheries: 'Fisheries Act (Canada)',
  ACT_Food_Safety: 'Food Safety Act',
  ACT_Int_Pest_Management: 'Integrated Pest Management Act',
  ACT_Mines: 'Mines Act',
  ACT_Oil_Gas_Activities: 'Oil and Gas Activities Act',
  ACT_Park: 'Park Act',
  ACT_Water: 'Water Act',
  ACT_Water_Sustainability: 'Water Sustainability Act',
  ACT_Wildlife: 'Wildlife Act'
};

var dbm;
var type;
var seed;
let recordCount = 0;

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
  console.log('**** Adding Issuing Agency to historical NRCED records ****');
  const mClient = await db.connection.connect(db.connectionString, { native_parser: true });

  try {
    console.log('attempting migration...');

    const nrpti = await mClient.collection('nrpti');

    const ocersRecords = await nrpti.find({ sourceSystemRef: 'ocers-csv' }).toArray();

    await ocersRecords.forEach(async record => {
      recordCount += 1;

      switch (record.recordType) {
        case 'Ticket':
          switch (record.legislation.act) {
            case LegislationActs.ACT_Food_Safety:
            case LegislationActs.ACT_Fish_Seafood:
              updateRecord(nrpti, record._id, ApplicationAgencies.AGENCY_AGRI, ApplicationRoles.ADMIN_AGRI);
              break;
            default:
              updateRecord(nrpti, record._id, ApplicationAgencies.AGENCY_ENV_COS, ApplicationRoles.ADMIN_ENV_COS);
              break;
          }
          break;

        case 'Administrative Sanction':
          updateRecord(nrpti, record._id, ApplicationAgencies.AGENCY_FLNRO, ApplicationRoles.ADMIN_FLNRO);
          break;

        case 'Administrative Penalty':
          switch (record.legislation.act) {
            case LegislationActs.ACT_Env_Management:
            case LegislationActs.ACT_Int_Pest_Management:
              updateRecord(nrpti, record._id, ApplicationAgencies.AGENCY_ENV_EPD, ApplicationRoles.ADMIN_ENV_EPD);
              break;
            case LegislationActs.ACT_Oil_Gas_Activities:
              // BC OGC role not yet created
              updateRecord(nrpti, record._id, ApplicationAgencies.AGENCY_OGC);
              break;
            case LegislationActs.ACT_Mines:
              updateRecord(nrpti, record._id, ApplicationAgencies.AGENCY_BCMI, ApplicationRoles.ADMIN_BCMI);
              break;
            case LegislationActs.ACT_Agri_Land_Commission:
              updateRecord(nrpti, record._id, ApplicationAgencies.AGENCY_ALC, ApplicationRoles.ADMIN_ALC);
              break;
          }
          break;

        case 'Court Conviction':
          updateRecord(nrpti, record._id, ApplicationAgencies.AGENCY_ENV_COS, ApplicationRoles.ADMIN_ENV_COS);
          break;

        case 'Restorative Justice':
          switch (record.legislation.act) {
            case LegislationActs.ACT_Env_Management:
              updateRecord(nrpti, record._id, ApplicationAgencies.AGENCY_ENV_EPD, ApplicationRoles.ADMIN_ENV_EPD);
              break;
            case LegislationActs.ACT_Wildlife:
            case LegislationActs.ACT_Fisheries:
              updateRecord(nrpti, record._id, ApplicationAgencies.AGENCY_ENV_COS, ApplicationRoles.ADMIN_ENV_COS);
              break;
            case LegislationActs.ACT_Park:
              // BC Parks role not yet created
              updateRecord(nrpti, record._id, ApplicationAgencies.AGENCY_BCPARKS);
              break;
          }
          break;

        case 'Order':
          switch (record.legislation.act) {
            case LegislationActs.ACT_Water:
            case LegislationActs.ACT_Water_Sustainability:
            case LegislationActs.ACT_Dike_Maintenance:
              updateRecord(nrpti, record._id, ApplicationAgencies.AGENCY_FLNRO, ApplicationRoles.ADMIN_FLNRO);
              break;
            case LegislationActs.ACT_Agri_Land_Commission:
              updateRecord(nrpti, record._id, ApplicationAgencies.AGENCY_ALC, ApplicationRoles.ADMIN_ALC);
              break;
            case LegislationActs.ACT_Park:
              // BC Parks role not yet created
              updateRecord(nrpti, record._id, ApplicationAgencies.AGENCY_BCPARKS);
              break;
            case LegislationActs.ACT_Env_Management:
            case LegislationActs.ACT_Int_Pest_Management:
              updateRecord(nrpti, record._id, ApplicationAgencies.AGENCY_ENV_EPD, ApplicationRoles.ADMIN_ENV_EPD);
              break;
          }
          break;
      }
    });
  } catch (error) {
    console.log('Error on migration: ', error);
    mClient.close();
  } finally {
    console.log(
      `**** Issuing Agency (historical NRCED docs) migration complete, ${recordCount} records updated. *****`
    );
    mClient.close();
  }

  function updateRecord(db, record_id, agency, role) {
    if (role) {
      try {
        db.update(
          { _id: record_id },
          {
            $set: {
              issuingAgency: agency
            }
          }
        );
        db.update(
          { _id: record_id },
          {
            $addToSet: {
              read: role,
              write: role
            }
          }
        );
      } catch (error) {
        console.log('Migration error: ', error);
      }
    } else {
      try {
        db.update(
          { _id: record_id },
          {
            $set: {
              issuingAgency: agency
            }
          }
        );
      } catch (error) {
        console.log('Migration error: ', error);
      }
    }
  }
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1
};
