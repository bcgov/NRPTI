'use strict';

const constants = require('../src/utils/constants/misc');

const MASTER_SCHEMAS = [
  'AdministrativePenalty',
  'AdministrativeSanction',
  'Agreement',
  'AnnualReport',
  'Certificate',
  'CertificateAmendment',
  'ConstructionPlan',
  'Correspondence',
  'CourtConviction',
  'DamSafetyInspection',
  'Inspection',
  'ManagementPlan',
  'Order',
  'Permit',
  'Report',
  'RestorativeJustice',
  'SelfReport',
  'Ticket',
  'Warning'
];

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function(options, seedLink) {};

exports.up = async function(db) {
  console.log('**** Updating COORS records ****');

  const mClient = await db.connection.connect(db.connectionString, {
    native_parser: true
  });

  try {
    const nrpti = await mClient.collection('nrpti');

    const records = await nrpti.find({ sourceSystemRef: 'cors-csv' }).toArray();

    const promises = [];

    for (const record of records) {
      const setObj = {
        recordName: record.offence,
        author: record.issuingAgency,
        sourceSystemRef: 'coors-csv'
      };

      const unsetObj = {};

      // Rename _sourceRefCorsId to _sourceRefCoorsId on master records
      if (MASTER_SCHEMAS.includes(record._schemaName)) {
        unsetObj._sourceRefCorsId = 1;
        setObj._sourceRefCoorsId = record._sourceRefCorsId;
      }

      // Set dateOfBirth to current date for individuals that do not have names
      if (record.issuedTo.type === constants.IssuedToEntityTypes.Individual) {
        if (!(record.issuedTo.firstName && record.issuedTo.middleName && record.issuedTo.lastName)) {
          setObj['issuedTo.dateOfBirth'] = new Date();
        }
      }

      const updateObj = { $set: setObj };

      if (unsetObj._sourceRefCorsId) {
        updateObj.$unset = unsetObj;
      }

      promises.push(
        nrpti.updateOne(
          { _id: record._id },
          updateObj
        )
      );
    }

    await Promise.all(promises);

    console.log(`Finished updating ${records.length} COORS records`);
  } catch (err) {
    console.log(`Error updating COORS records: ${err}`);
  } finally {
    mClient.close();
  }

  return null;
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1
};
