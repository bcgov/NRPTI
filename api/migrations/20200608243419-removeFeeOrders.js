'use strict'

const DocumentController = require('../src/controllers/document-controller');

let dbm;
let type;
let seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;;
  seed = seedLink
};

exports.up = async function(db) {
  const mClient = await db.connection.connect(db.connectionString, { native_parser: true });

  try {
    const nrptiCollection = await mClient.collection('nrpti');

    const orders = await nrptiCollection.find({ _schemaName: 'Order' }).toArray();
    const inspections = await nrptiCollection.find({ _schemaName: 'Inspection' }).toArray();

    const recordToCheck = [...orders, ...inspections];

    // Filter out only the fee orders  
    // Any document names that contain these terms are considered Fee Orders.
    const orderTermsBlacklist = [
      'fee order',
      'order to pay fees',
      'fee package'
    ];

    const feeOrders = [];

    for (const record of recordToCheck) {
      for (const term of orderTermsBlacklist) {
        if (record.recordName.toLowerCase().includes(term)) {
          feeOrders.push(record);
          break;
        }
      }
    }

    console.log(`${feeOrders.length} Fee Orders found.`);

    for (const order of feeOrders) {
      // Delete any flavour records.
      for (const flavourId of order._flavourRecords) {
        nrptiCollection.remove({ _id: flavourId });
      }

      // Delete any document records.
      for (const documentId of order.documents) {
        const doc = await nrptiCollection.findOneAndDelete({ _id: documentId });

        // Delete from S3 if it exists.
        if (doc.key) {
          DocumentController.deleteS3Document(doc.key);
        }
      }

      nrptiCollection.remove({ _id: order._id })
    }
    
    mClient.close()
  } catch (e) {
    console.log('Error', e);
    mClient.close();
  }
}

exports.down = function(db) {
  return null
}

exports._meta = {
  "version": 1
}
