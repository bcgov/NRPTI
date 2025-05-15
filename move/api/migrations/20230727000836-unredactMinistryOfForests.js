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
        record.issuedTo.type === 'Individual' &&
        record.issuedTo.dateOfBirth
      ) {
        const dateOfBirth = new Date(record.issuedTo.dateOfBirth);
        const today = new Date();
        const ageInYears = today.getFullYear() - dateOfBirth.getFullYear();
    
        if (ageInYears >= 19) {
          // Save the "issuedTo" object in the "nrpti" collection
          // Add "public" to the "read" array in the "issuedTo" object
          await nrpti.updateOne({ _id: record._id }, { $set: { issuedTo: record.issuedTo } });
          const issuedToWithPublic = { ...record.issuedTo, read: [...record.issuedTo.read, 'public'] };
    
          // Make sure the "_flavourRecords" ID exists on the master record
          // Check if the corresponding "_flavourRecords" ID exists in the "redacted_record_subset" collection
          if (record._flavourRecords && record._flavourRecords.length > 0) {
            const redactedRecordSubsetDocument = await redactedRecordSubset.findOne({ _id: record._flavourRecords[0] });
    
            // Update the "issuedTo" object in the "redacted_record_subset" collection
            // Otherwise, insert the "issuedTo" data in the "redacted_record_subset" collection
            if (redactedRecordSubsetDocument) {
              await redactedRecordSubset.updateOne(
                { _id: record._flavourRecords[0] },
                { $set: { issuedTo: issuedToWithPublic } }
              );
            } else {
              await redactedRecordSubset.insertOne({ _id: record._flavourRecords[0], issuedTo: issuedToWithPublic });
            }
          } else {
            console.error(`Skipping record ${record._id} because _flavourRecords is undefined or empty.`);
          }
        } else {
          // Remove issuedTo from redacted_record_subset if the individual is younger than 19 years old
          if (record._flavourRecords && record._flavourRecords.length > 0) {
            await redactedRecordSubset.updateOne(
              { _id: record._flavourRecords[0] },
              { $unset: { issuedTo: 1 } }
            );
          }
          console.log(`Removing issuedTo for record ${record._id} because the individual is younger than 19 years old.`);
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

