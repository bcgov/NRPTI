'use strict';

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function(options, seedLink) {};

/**
 * This migration sets the isLngPublished and isNrcedPublished flags on master
 * records according to their flavours' read permissions
 */
exports.up = async function(db) {
  console.log('**** Updating flavour published status on master records ****');

  const mClient = await db.connection.connect(db.connectionString, {
    native_parser: true
  });

  try {
    const nrpti = await mClient.collection('nrpti');

    const records = await nrpti
      .aggregate([
        {
          $match: {
            _schemaName: {
              $in: [
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
              ]
            }
          }
        },
        {
          $lookup: {
            from: 'nrpti',
            localField: '_flavourRecords',
            foreignField: '_id',
            as: 'flavours'
          }
        },
        {
          $project: {
            _id: 1,
            'flavours._schemaName': 1,
            'flavours.read': 1
          }
        }
      ])
      .toArray();

    const promises = [];
    for (const record of records) {
      let isLngPublished = false;
      let isNrcedPublished = false;

      for (const flavour of record.flavours) {
        if (flavour._schemaName.endsWith('LNG') && flavour.read.includes('public')) isLngPublished = true;

        if (flavour._schemaName.endsWith('NRCED') && flavour.read.includes('public')) isNrcedPublished = true;
      }

      promises.push(
        nrpti.updateOne(
          { _id: record._id },
          {
            $set: { isLngPublished: isLngPublished, isNrcedPublished: isNrcedPublished }
          }
        )
      );
    }

    await Promise.all(promises);

    console.log(`Finished updating ${records.length} master records`);
  } catch (err) {
    console.log(`Error updating flavour publish status on master records: ${err}`);
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
