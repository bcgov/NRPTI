'use strict';

let dbm;
let type;
let seed;

const AnnualReport = require('../src/controllers/post/annual-report');
const CertificateAmendment = require('../src/controllers/post/certificate-amendment');
const Correspondence = require('../src/controllers/post/correspondence');
const DamSafetyInspection = require('../src/controllers/post/dam-safety-inspection');
const Inspection = require('../src/controllers/post/inspection');
const ManagementPlan = require('../src/controllers/post/management-plan');
const Order = require('../src/controllers/post/order');
const Permit = require('../src/controllers/post/permit');
const Report = require('../src/controllers/post/report');

const mongoose = require('mongoose');
const ObjectID = require('mongodb').ObjectID;

const DB_CONNECTION =
  'mongodb://' +
  (process.env.MONGODB_SERVICE_HOST || process.env.DB_1_PORT_27017_TCP_ADDR || 'localhost') +
  '/' +
  (process.env.MONGODB_DATABASE || 'nrpti-dev');
mongoose.connect(DB_CONNECTION);
require('../src/models/bcmi/annualReport-bcmi');
require('../src/models/bcmi/certificateAmendment-bcmi');
require('../src/models/bcmi/correspondence-bcmi');
require('../src/models/bcmi/damSafetyInspection-bcmi');
require('../src/models/bcmi/inspection-bcmi');
require('../src/models/bcmi/managementPlan-bcmi');
require('../src/models/bcmi/order-bcmi');
require('../src/models/bcmi/permit-bcmi');
require('../src/models/bcmi/report-bcmi');

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async function (db) {
  console.log('**** Creating BCMI flavour records ****');
  const mClient = await db.connection.connect(db.connectionString, { native_parser: true });

  try {
    const nrpti = await mClient.collection('nrpti');

    const existingBcmiFlavours = await nrpti.find({
      _schemaName: {
        $in: [
          'AnnualReportBCMI',
          'CertificateAmendmentBCMI',
          'CorrespondenceBCMI',
          'DamSafetyInspectionBCMI',
          'InspectionBCMI',
          'ManagementPlanBCMI',
          'OrderBCMI',
          'PermitBCMI',
          'ReportBCMI'
        ]
      }
    }).toArray();
    let flavourMasterIds = existingBcmiFlavours.map(flavour => flavour._master);

    let masterRecords = await nrpti.find({
      _schemaName: {
        $in: [
          'AnnualReport',
          'CertificateAmendment',
          'Correspondence',
          'DamSafetyInspection',
          'Inspection',
          'ManagementPlan',
          'Order',
          'Permit',
          'Report'
        ]
      }
    }).toArray();

    let promises = [];
    let i = masterRecords.length;

    while (i--) {
      const record = masterRecords[i];
      let j = flavourMasterIds.length
      let hasBcmiFlavour = false;
      while (j--) {
        const flavourMasterId = flavourMasterIds[j];
        if (record._id.toString() === flavourMasterId.toString()) {
          flavourMasterIds.splice(j, 1);
          hasBcmiFlavour = true;
          break;
        }
      }

      if (!hasBcmiFlavour) {
        let args = {
          swagger: {
            params: {
              auth_payload: {
                realm_access: {
                  roles: ['sysadmin']
                }
              }
            }
          }
        };

        let flavourRecord = {
          ...record
        };
        let obj = null;

        flavourRecord._master = record._id;

        switch (record._schemaName) {
          case 'AnnualReport':
            obj = AnnualReport.createBCMI(args, null, null, flavourRecord);
            break;
          case 'CertificateAmendment':
            obj = CertificateAmendment.createBCMI(args, null, null, flavourRecord);
            break;
          case 'Correspondence':
            obj = Correspondence.createBCMI(args, null, null, flavourRecord);
            break;
          case 'DamSafetyInspection':
            obj = DamSafetyInspection.createBCMI(args, null, null, flavourRecord);
            break;
          case 'Inspection':
            obj = Inspection.createBCMI(args, null, null, flavourRecord);
            break;
          case 'ManagementPlan':
            obj = ManagementPlan.createBCMI(args, null, null, flavourRecord);
            break;
          case 'Order':
            obj = Order.createBCMI(args, null, null, flavourRecord);
            break;
          case 'Permit':
            obj = Permit.createBCMI(args, null, null, flavourRecord);
            break;
          case 'Report':
            obj = Report.createBCMI(args, null, null, flavourRecord);
            break;
          default:
            break;
        }

        if (obj) {
          promises.push(obj.save());
          promises.push(nrpti.findOneAndUpdate({ _id: ObjectID(record._id) }, { $push: { _flavourRecords: ObjectID(obj._id) } }));
        } else {
          throw 'Error creating BCMI flavour object';
        }
      }
    }

    await Promise.all(promises);
    console.log('**** Finished creating BCMI flavours ****');
  } catch (error) {
    console.error(`Migration did not complete. Error creating flavour records: ${error.message}`);
  }

  mClient.close();
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  "version": 1
};
