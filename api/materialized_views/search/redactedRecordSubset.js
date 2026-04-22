const mongoose = require('mongoose');

const defaultLog = require('../../src/utils/logger')('redacted-record-subset');
const BusinessLogicManager = require('../../src/utils/business-logic-manager');

/**
 * Updates or adds the record passed in, in hte redacted record subset
 *
 * @param {*} record
 */
function redactRecord(record) {
  let redactedRecord = record.toObject();
  const issuedTo = record.issuedTo;
  const issuingAgency = record.issuingAgency;

  if (BusinessLogicManager.isIssuedToConsideredAnonymous(issuedTo, issuingAgency)) {
    // Remove the issuedTo completely so that it shows up as "Unpublished" on NRCED public.
    delete redactedRecord.issuedTo;

    // Make sure that no documents are publicly available either.
    redactedRecord.documents = [];
  }

  return redactedRecord;
}

/**
 * adds the record passed in to the redacted record subset
 *
 * @param {*} record
 */
async function saveOneRecord(record) {
  const redactedRecord = redactRecord(record);

  try {
    defaultLog.info('Updating redacted_record_subset');

    const db = mongoose.connection.db;
    const redactedCollection = db.collection('redacted_record_subset');
    await redactedCollection.replaceOne({ _id: redactedRecord._id }, redactedRecord, { upsert: true });

    defaultLog.info('(saveOneRecord) Done Updating redacted_record_subset');
  } catch (error) {
    defaultLog.error('(saveOneRecord) Failed to update redacted_record_subset, error: ' + error);
  }
}

exports.saveOneRecord = saveOneRecord;

/**
 * Updates the record passed in, in the redacted record subset
 *
 * @param {*} record
 */
async function updateOneRecord(record) {
  const redactedRecord = redactRecord(record);

  try {
    defaultLog.info('Updating redacted_record_subset');

    const db = mongoose.connection.db;
    const redactedCollection = db.collection('redacted_record_subset');
    await redactedCollection.findOneAndUpdate({ _id: redactedRecord._id }, { $set: redactedRecord });

    defaultLog.info('(updateOneRecord) Done Updating redacted_record_subset');
  } catch (error) {
    defaultLog.error('(updateOneRecord) Failed to update redacted_record_subset, error: ' + error);
  }
}

exports.updateOneRecord = updateOneRecord;

/**
 * Updates the record passed in, in the redacted record subset
 *
 * @param {*} record
 */
async function deleteOneRecord(record) {
  try {
    defaultLog.info('Updating redacted_record_subset');

    const db = mongoose.connection.db;
    const redactedCollection = db.collection('redacted_record_subset');
    await redactedCollection.deleteOne({ _id: record._id });

    defaultLog.info('(deleteOneRecord) Done Updating redacted_record_subset');
  } catch (error) {
    defaultLog.error('(deleteOneRecord) Failed to update redacted_record_subset, error: ' + error);
  }
}

exports.deleteOneRecord = deleteOneRecord;
