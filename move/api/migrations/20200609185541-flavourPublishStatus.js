'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function (db) {
  return db.connection.connect(db.connectionString, { native_parser: true })
    .then(async (mClient) => {
      console.log('Getting all NRCED and LNG flavour records.')
      var nrptiCollection = mClient.collection('nrpti');
      const flavourRecords = await nrptiCollection.find(
        {
          _schemaName: {
            $in: [
              'AdministrativePenaltyNRCED',
              'AdministrativeSanctionNRCED',
              'CourtConvictionNRCED',
              'InspectionNRCED',
              'OrderNRCED',
              'RestorativeJusticeNRCED',
              'TicketNRCED',
              'WarningNRCED',
              'AdministrativePenaltyLNG',
              'AdministrativeSanctionLNG',
              'AgreementLNG',
              'CertificateLNG',
              'ConstructionPlanLNG',
              'CourtConvictionLNG',
              'InspectionLNG',
              'ManagementPlanLNG',
              'OrderLNG',
              'PermitLNG',
              'RestorativeJusticeLNG',
              'SelfReportLNG',
              'TicketLNG',
              'WarningLNG'
            ]
          }
        }
      ).toArray();

      // TT = isNrcedPublished true and isLngPublished true
      // TF = isNrcedPublished true and isLngPublished false
      let promisesTT = [];
      let promisesTF = [];
      let promisesFT = [];
      let promisesFF = [];

      for (let i = 0; i < flavourRecords.length; i++) {
        const flavourRecord = flavourRecords[i];
        let isNrcedPublished = false;
        let isLngPublished = false;

        if (flavourRecord._schemaName.includes('NRCED') && flavourRecord.read.includes('public')) {
          isNrcedPublished = true;
        }
        if (flavourRecord._schemaName.includes('LNG') && flavourRecord.read.includes('public')) {
          isLngPublished = true;
        }

        if (isNrcedPublished && isLngPublished) {
          promisesTT.push(flavourRecord._master);
        } else if (isNrcedPublished && !isLngPublished) {
          promisesTF.push(flavourRecord._master);
        } else if (!isNrcedPublished && isLngPublished) {
          promisesFT.push(flavourRecord._master);
        } else {
          promisesFF.push(flavourRecord._master);
        }
      }

      console.log('Updating master records where NRCED and LNG is published');
      await nrptiCollection.updateMany(
        {
          _id: {
            $in: promisesTT
          }
        },
        { $set: { isNrcedPublished: true, isLngPublished: true } }
      );

      console.log('Updating master records where NRCED is published and LNG is unpublished');
      await nrptiCollection.updateMany(
        {
          _id: {
            $in: promisesTF
          }
        },
        { $set: { isNrcedPublished: true, isLngPublished: false } }
      );
      console.log('Updating master records where NRCED is unpublished and LNG is published');
      await nrptiCollection.updateMany(
        {
          _id: {
            $in: promisesFT
          }
        },
        { $set: { isNrcedPublished: false, isLngPublished: true } }
      );
      console.log('Updating master records where NRCED and LNG are unpublished');
      await nrptiCollection.updateMany(
        {
          _id: {
            $in: promisesFF
          }
        },
        { $set: { isNrcedPublished: false, isLngPublished: false } }
      );

      mClient.close();
    })
    .catch((err) => {
      console.log("Error on updating flavour publish statuses on masters: ", err);
      mClient.close();
    });
};


exports.down = function (db) {
  return null;
};

exports._meta = {
  "version": 1
};
