'use strict';

const RecordTypeEnum = require('../src/utils/constants/misc');

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
    const nrpti = await mClient.collection('nrpti');

    console.log('**** Renaming ManagementPlan and ManagementPlanLNG agency to issuingAgency ****');
    await renameAgency(nrpti);
    console.log('**** Finished renaming agency to issuingAgency ****');

    console.log('**** Updating "Environmental Assessment Office" to "EAO" ****');
    await updateAcronym(nrpti, 'Environmental Assessment Office', 'EAO');
    console.log('**** Finished updating "Environmental Assessment Office" to "EAO" ****');

    console.log('**** Deleting empty agency field ****');
    await deleteEmptyAgency(nrpti);
    console.log('**** Finished deleting empty agency field ****');

  } catch (error) {
    console.error(`Migration did not complete. Error processing: ${error.message}`);
  }

  mClient.close();
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  "version": 1
};

async function renameAgency(nrpti) {
  const schemas = ["ManagementPlan", "ManagementPlanLNG"];

  const result = await nrpti.updateMany(
    { _schemaName: { $in: schemas } },
    { $rename: { agency: "issuingAgency" } }
  );

  console.log(`     - ${result.result.ok === 1 ? 'Success!' : 'Failed!'}`);
  console.log(`     - Updated ${result.result.nModified} records`);
}

async function updateAcronym(nrpti, issuingAgencyString, issuingAgencyReplacement) {
  const schemas = [...RecordTypeEnum.MASTER_SCHEMA_NAMES,
                   ...RecordTypeEnum.LNG_SCHEMA_NAMES,
                   ...RecordTypeEnum.NRCED_SCHEMA_NAMES,
                   ...RecordTypeEnum.BCMI_SCHEMA_NAMES];

  const result = await nrpti.updateMany(
    { $and: [ { _schemaName: { $in: schemas } }, { issuingAgency: issuingAgencyString } ] },
    { $set: { issuingAgency: issuingAgencyReplacement } }
  );

  console.log(`     - ${result.result.ok === 1 ? 'Success!' : 'Failed!'}`);
  console.log(`     - Updated ${result.result.nModified} records`);
}

async function deleteEmptyAgency(nrpti)
{
  const schema = "ManagementPlanBCMI";

  const result = await nrpti.updateMany(
    { _schemaName: schema },
    { $unset: { agency: "" } }
  );

  console.log(`     - ${result.result.ok === 1 ? 'Success!' : 'Failed!'}`);
  console.log(`     - Updated ${result.result.nModified} records`);
}