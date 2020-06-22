const MiscConstants = require('../../../utils/constants/misc');

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
    return MiscConstants.IssuedToEntityTypes.Company;
  }

  return MiscConstants.IssuedToEntityTypes.Individual;
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
