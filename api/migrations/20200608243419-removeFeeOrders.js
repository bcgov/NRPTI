'use strict'

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

    console.log(`${orders.length} Fee Orders found.`);

    for (const order of orders) {
      // Delete any flavour records.
      for (const flavourId of order._flavourRecords) {
        nrptiCollection.remove({ _id: flavourId });
      }

      // Delete any document records.
      for (const documentId of order.documents) {
        nrptiCollection.remove({ _id: documentId });
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
