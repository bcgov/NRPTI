const QueryActions = require('./query-actions');
const DocumentController = require('../controllers/document-controller');
const moment = require('moment');

/**
 * Apply business logic changes to a record. Updates the provided updateObj, and returns it.
 *
 * @param {*} updateObj
 * @param {*} sanitizedObj
 * @returns updateObj
 */
exports.applyBusinessLogicOnPut = function(updateObj, sanitizedObj) {
  if (!sanitizedObj) {
    return updateObj;
  }

  // apply anonymous business logic
  if (isRecordConsideredAnonymous(sanitizedObj) === true) {
    updateObj.$pull['issuedTo.read'] = 'public';
  } else {
    updateObj.$addToSet['issuedTo.read'] = 'public';
  }

  return updateObj;
};

/**
 * Apply business logic changes to a record. Updates the provided record, and returns it.
 *
 * @param {*} record
 * @returns record
 */
exports.applyBusinessLogicOnPost = function(record) {
  if (!record) {
    return record;
  }

  // apply anonymous business logic
  const isAnonymous = isRecordConsideredAnonymous(record);
  if (isAnonymous === null || isAnonymous === true) {
    record.issuedTo && (record.issuedTo = QueryActions.removePublicReadRole(record.issuedTo));
  } else {
    record.issuedTo && (record.issuedTo = QueryActions.addPublicReadRole(record.issuedTo));
  }

  return record;
};

/**
 * Calculate anonymity business logic rules for a record.
 *
 * A record that is considered to be anonymous must not make public any data that might contain an individuals name
 * (and related personally identifiable information). This includes record meta and associated documents.
 *
 * @param {*} record
 * @returns boolean true if the record is considered anonymous, false otherwise.
 */
function isRecordConsideredAnonymous(record) {
  let isAnonymous = isIssuedToConsideredAnonymous(record);

  if (record.sourceSystemRef && record.sourceSystemRef.toLowerCase() === 'ocers-csv') {
    // records imported from OCERS are not anonymous
    isAnonymous = false;
  }

  if (record.sourceSystemRef && record.sourceSystemRef.toLowerCase() === 'nris-epd') {
    // records imported from NRIS-EPD are not anonymous
    isAnonymous = false;
  }

  return isAnonymous;
}

exports.isRecordConsideredAnonymous = isRecordConsideredAnonymous;

/**
 * Determine if a record.issuedTo sub-object is considered anonymous or not.
 *
 * A record.issuedTo sub-object is considered anonymous if the following are true:
 * - The issuedTo.type indicates a person (Individual, IndividualCombined) AND
 * - The issuedTo.dateOfBirth is null OR the issuedTo.dateOfBirth indicates the person is less than 19 years of age.
 *
 * Note: If insufficient information is provided, must assume anonymous.
 *
 * @param {*} record
 * @returns true if the record.issuedTo is considered anonymous, false if the record is not considered anonymous, and
 * null if the record is missing the issuedTo sub-object and therefore anonymity can't be fully determined.
 */
function isIssuedToConsideredAnonymous(record) {
  if (!record || !record.issuedTo) {
    // can't determine if issuedTo is anonymous or not
    return null;
  }

  if (record.issuedTo.type !== 'Individual' && record.issuedTo.type !== 'IndividualCombined') {
    // only individuals can be anonymous
    return false;
  }

  if (!record.issuedTo.dateOfBirth) {
    // individuals without birth dates are anonymous
    return true;
  }

  if (moment().diff(moment(record.issuedTo.dateOfBirth), 'years') < 19) {
    // individuals with birth dates and are under the age of 19 are anonymous
    return true;
  }

  // no contradicting evidence, assume not anonymous
  return false;
}

exports.isIssuedToConsideredAnonymous = isIssuedToConsideredAnonymous;

/**
 * Determine if the document is considered anonymous or not.
 *
 * A document is considered anonymous if the record it is associated with is considered anonymous.
 * - See isRecordConsideredAnonymous for details.
 *
 * Note: If insufficient information is provided, must assume anonymous.
 *
 * @param {*} masterRecord
 * @returns true if the document is considered anonymous, false otherwise.
 */
function isDocumentConsideredAnonymous(masterRecord) {
  if (!masterRecord) {
    // can't determine if document is anonymous or not, must assume anonymous
    return true;
  }

  return isRecordConsideredAnonymous(masterRecord);
}

exports.isDocumentConsideredAnonymous = isDocumentConsideredAnonymous;

/**
 * Updates the read roles for all documents associated with the master record.
 *
 * @param {*} masterRecord
 * @param {*} auth_payload
 * @returns savedDocuments
 */
exports.updateDocumentRoles = async function(masterRecord, auth_payload) {
  if (!masterRecord) {
    return null;
  }

  let savedDocuments = [];
  const documentPromises = [];

  if (await isDocumentConsideredAnonymous(masterRecord)) {
    // unpublish the mongo document AND s3 document if one exists
    masterRecord.documents.forEach(docId => {
      documentPromises.push(
        DocumentController.unpublishDocument(docId, auth_payload).then(document => {
          if (document.key) {
            return DocumentController.unpublishS3Document(document.key);
          }
        })
      );
    });
  } else {
    // publish the mongo document AND s3 document if one exists
    masterRecord.documents.forEach(docId => {
      documentPromises.push(
        DocumentController.publishDocument(docId, auth_payload).then(document => {
          if (document.key) {
            return DocumentController.publishS3Document(document.key);
          }
        })
      );
    });
  }

  if (documentPromises.length > 0) {
    savedDocuments = await Promise.all(documentPromises);
  }

  return savedDocuments;
};
