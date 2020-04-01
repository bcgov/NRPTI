/**
 * Builds the issuedTO.fullName string, based on the issuedTo.type field.
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
    return [[issuedToObj.lastName || '-', issuedToObj.firstName || '-'].join(', '), issuedToObj.middleName || '-'].join(
      ' '
    );
  }
};
