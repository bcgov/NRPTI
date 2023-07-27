'use strict';

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

'use strict';

exports.up = async function(db) {

  const mClient = await db.connection.connect(db.connectionString, {
    native_parser: true
  });

  try {

    console.log('**** Started saving "issuedTo" object and updating "redacted_record_subset" collection ****');

    const nrpti = await mClient.collection('nrpti');
    const redactedRecordSubset = await mClient.collection('redacted_record_subset');

    const records = await nrpti
      .find({
        issuingAgency: 'Ministry of Forests',
        recordType: 'Administrative Sanction'
      })
      .toArray();

    const promises = records.map(async (record) => {
      if (
        record.issuedTo &&
        record.issuedTo.type === 'Individual'
      ) {
        // Save the "issuedTo" object in the "nrpti" collection
        await nrpti.updateOne({ _id: record._id }, { $set: { issuedTo: record.issuedTo } });

        // Make sure the "_flavourRecords" ID exists on the master record
        if (record._flavourRecords && record._flavourRecords.length > 0) {
          // Check if the corresponding "_flavourRecords" ID exists in the "redacted_record_subset" collection
          const redactedRecordSubsetDocument = await redactedRecordSubset.findOne({ _id: record._flavourRecords[0] });
        
          if (redactedRecordSubsetDocument) {
            // Update the "issuedTo" object in the "redacted_record_subset" collection
            await redactedRecordSubset.updateOne(
              { _id: record._flavourRecords[0] },
              { $set: { issuedTo: record.issuedTo } }
            );
          } else {
            // Insert the "issuedTo" data in the "redacted_record_subset" collection
            await redactedRecordSubset.insertOne({ _id: record._flavourRecords[0], issuedTo: record.issuedTo });
          }
        } else {
          console.error(`Skipping record ${record._id} because _flavourRecords is undefined or empty.`);
        }
      }
    });

    await Promise.all(promises);

    console.log('**** Finished saving "issuedTo" object and updating "redacted_record_subset" collection ****');
  } catch (error) {
    console.error(`Migration did not complete. Error processing: ${error.message}`);
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

