'use strict';

var dbm;
var type;
var seed;

exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

/* 
Update to address improperly redacted administrative penalty(AMPs) records (due to a bug). 
AMPs should not be redacted if the issuingAgency in one in the list and the individual
cited is 19 or older.

from 'nrpti' get all _schemaName == 'AdministrativePenalty'
for each of these master records
  if 'public' is in read AND issuingAgency is good AND issuedTo.dateOfBirth was 19+ years ago THEN
    if 'public' not in issuedTo.read, push it in.
    for each record and flavour record in nrpti and redacted_record_subset record:
      record.issuedTo = master.issuedTo
      record.documents = master.documents.
 */

exports.up = async function(db) { 
  const validIssuingAgencies = [
    'BC Parks',
    'Environmental Assessment Office',
    'Conservation Officer Service',
    'Climate Action Secretariat',
    'Ministry of Environment and Climate Change Strategy',
    'Ministry of Forests',
    'AGENCY_ENV_COS',
    'AGENCY_EAO',
    'AGENCY_ENV_BCPARKS',
    'AGENCY_CAS',
    'AGENCY_ENV',
    'AGENCY_FLNRO'
  ];
  let numRecordsUpdated = 0;
  const mClient = await db.connection.connect(db.connectionString, { native_parser: true });
  try {
    console.info("***Updating improperly redacted administrative penalty records***");

    const collection = mClient.collection('nrpti');
    const redactedCollection = mClient.collection('redacted_record_subset');
    const currentDate = new Date();
    const nineteenYearsAgo = new Date(currentDate.setFullYear(currentDate.getFullYear() - 19));

    // get all records that match this query. these will be all records that should NOT be redacted
    const query = {
      _schemaName: 'AdministrativePenalty',
      read: { $in: ['public'] },
      'issuedTo.type': 'Individual',
      'issuedTo.dateOfBirth': { $lte: nineteenYearsAgo },
      issuingAgency: { $in: validIssuingAgencies }
    };

    const cursor = collection.find(query);

    while (await cursor.hasNext()) {
      const master = await cursor.next();

      // if 'public' is not included in issuedTo.read, add it (this means it is published, but the records in the redacted_record_subset is where NRPTI reads from)
      if (!master.issuedTo.read.includes('public')) {
        master.issuedTo.read.push('public');
        await collection.updateOne({ _id: master._id }, { $set: { 'issuedTo.read': master.issuedTo.read } });
      }
      
      //update the matching record in the redacted_record_subset so that issuedTo and documents are included.
      await redactedCollection.updateOne(
        { _id: master._id },
        { $set: { issuedTo: master.issuedTo, documents: master.documents } }
      );

      //update the associated flavour records in 'nrpti' and 'redacted_record_subset' collections so that issuedTo and documents are included.
      for (const flavourId of master._flavourRecords) {
        const subQuery = { _id: flavourId };
        const update = {
          $set: {
            issuedTo: master.issuedTo,
            documents: master.documents
          }
        };

        await collection.updateOne(subQuery, update);
        await redactedCollection.updateOne(subQuery, update);
        numRecordsUpdated ++;
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    console.info(`***Finished unredacting AMP records. ${numRecordsUpdated} NRCED AMP records updated. ***`)
    await mClient.close();
  }
};


exports.down = function(db) {
  return null;
};

exports._meta = {
  "version": 1
};
