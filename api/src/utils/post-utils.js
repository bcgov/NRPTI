const QueryUtils = require('./query-utils');
const QueryActions = require('./query-actions');

/**
 * Builds the issuedTo.fullName string, based on the issuedTo.type field.
 *
 * @param {*} issuedToObj
 * @returns
 */
exports.getIssuedToFullNameValue = function(issuedToObj) {
  if (!issuedToObj || !issuedToObj.type) {
    return '';
  }

  if (issuedToObj.type === 'IndividualCombined') {
    return issuedToObj.fullName;
  }

  if (issuedToObj.type === 'Company') {
    return issuedToObj.companyName;
  }

  if (!issuedToObj.firstName && !issuedToObj.middleName && !issuedToObj.lastName) {
    return '';
  }

  if (issuedToObj.type === 'Individual') {
    let entityString = '';

    const entityNameParts = [];
    if (issuedToObj.lastName) {
      entityNameParts.push(issuedToObj.lastName);
    }

    if (issuedToObj.firstName) {
      entityNameParts.push(issuedToObj.firstName);
    }

    entityString = entityNameParts.join(', ');

    if (issuedToObj.middleName) {
      entityString += ` ${issuedToObj.middleName}`;
    }

    return entityString;
  }
};

/**
 * Apply business logic changes to a record. Updates the provided record, and returns it.
 *
 * @param {*} record
 * @returns record
 */
exports.applyBusinessLogic = function(record) {
  if (!record) {
    return record;
  }

  // apply anonymous business logic
  if (QueryUtils.isRecordConsideredAnonymous(record)) {
    record.issuedTo && (record.issuedTo = QueryActions.removePublicReadRole(record.issuedTo));
  } else {
    record.issuedTo && (record.issuedTo = QueryActions.addPublicReadRole(record.issuedTo));
  }

  return record;
};
