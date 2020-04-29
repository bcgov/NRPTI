const moment = require('moment');

/**
 * Creates a formatted date from the dateString and dateFormat.
 *
 * @param {*} dateString
 * @param {*} dateFormat
 * @returns the formatted date, or null if invalid dateString or dateFormat provided.
 */
exports.parseDate = function(dateString, dateFormat) {
  if (!dateString || !dateFormat) {
    return null;
  }

  const date = moment(dateString, dateFormat);

  if (!date.isValid()) {
    return null;
  }

  return date.toDate();
};

/**
 * Derives the act.
 *
 * @param {*} csvRow
 * @returns {string} the act.
 */
exports.getAct = function(csvRow) {
  if (!csvRow || !csvRow['act']) {
    return null;
  }

  if (csvRow['act'] === 'Fisheries Act') {
    return 'Fisheries Act (Canada)';
  }

  return csvRow['act'];
};

/**
 * Derives the issued to entity type.
 *
 * @param {*} csvRow
 * @returns {string} the entity type.
 */
exports.getEntityType = function(csvRow) {
  if (!csvRow) {
    return null;
  }

  if (csvRow['business_name']) {
    return 'Company';
  }

  return 'Individual';
};

/**
 * Derive the issuing agency.
 *
 * @param {*} csvRow
 * @returns {string} issuing agency.
 */
exports.getIssuingAgency = function(csvRow) {
  if (!csvRow || !csvRow['case_number']) {
    return null;
  }

  // business logic, see https://bcmines.atlassian.net/browse/NRPT-78
  if (csvRow['case_number'].toLowerCase().startsWith('p-')) {
    return 'BC Parks';
  }

  return 'Conservation Officer Service';
};
