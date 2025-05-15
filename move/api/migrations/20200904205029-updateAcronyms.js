'use strict';

const RecordTypeEnum = require('../src/utils/constants/misc');

let dbm;
let type;
let seed;

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
  let failed = false;
  console.log('##########################################');
  console.log('##  Starting collection backref update  ##');
  console.log('##########################################\n');

  const mClient = await db.connection.connect(db.connectionString, { native_parser: true });

  console.log(' >> Updating Agency to Ancronyms for all records...');
  try {
    const nrpti = await mClient.collection('nrpti');

    console.log('    Changing "Environmental Assessment Office" to "EAO"');
    await updateAcronym(nrpti, 'Environmental Assessment Office', 'EAO');

    console.log('    Changing "Ministry of Energy, Mines and Petroleum Resources" to "EMPR"');
    await updateAcronym(nrpti, 'Ministry of Energy, Mines and Petroleum Resources', 'EMPR');

  } catch (err) {
    console.error('    //////////////////////////////////////////');
    console.error('    //  Error during agency assignment: ');
    console.error('    //  Error:', err);
    console.error('    //////////////////////////////////////////');
    failed = true;
  }
  console.log(' << Finished agency updates.\n');

  console.log(failed ? '\n##  Process Failed. Please review your errors' : '\n##  All done! Agency updated successfuly.');
  console.log('#############################################');

  mClient.close()
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  "version": 1
};

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
