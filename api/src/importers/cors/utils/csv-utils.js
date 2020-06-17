const MiscConstants = require('../../../utils/constants/misc');

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

  // csv import specific business logic, see https://bcmines.atlassian.net/browse/NRPT-78
  if (csvRow['case_number'].toLowerCase().startsWith('p-')) {
    return MiscConstants.CorsCsvIssuingAgencies.BC_Parks;
  }

  return MiscConstants.CorsCsvIssuingAgencies.Conservation_Officer_Service;
};
