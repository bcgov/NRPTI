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
  if (!csvRow) {
    return null;
  }

  let caseNum = '';
  if (csvRow['case_number']) {
    caseNum = csvRow['case_number'];
  } else if (csvRow['case_no']) {
    caseNum = csvRow['case_no'];
  } else {
    return null;
  }

  // csv import specific business logic, see https://bcmines.atlassian.net/browse/NRPT-78
  if (caseNum.toLowerCase().startsWith('p-')) {
    return MiscConstants.CoorsCsvIssuingAgencies.BC_Parks;
  }

  // Provide a default value ('') if 'act' is missing.
  let act = csvRow['act'] || '';

  // Act == Water Sustainability Act, in which case Issuing Agency = BC Energy Regulator
  if (act.toLowerCase() == 'water sustainability act') {
    return MiscConstants.CoorsCsvIssuingAgencies.Water_Sustainability_Act;
  }

  // Otherwise, the issuing agency defaults to Conservation Officer Service
  return MiscConstants.CoorsCsvIssuingAgencies.Conservation_Officer_Service;
};


/**
 * Derive the penalty type
 *
 * @param {string} elem
 * @returns {string} penalty type
 */
exports.getPenalty = function(elem) {
  if (!elem) {
    return null;
  }

  let penaltyType = '';
  MiscConstants.COURT_CONVICTION_PENALTY_TYPES.forEach( item => {
    if (elem.toLowerCase() === item.toLowerCase()) {
      penaltyType = item;
    } else if (elem.toLowerCase().startsWith('other'))  {
      penaltyType = 'Other';
    }
  })

  return penaltyType;
}

/**
 * Derive the unit type of penalty value (eg. Dollars)
 *
 * @param {string} elem
 * @returns {string} unit of penalty
 */
exports.getPenaltyUnits = function(elem) {
  if (!elem) {
    return null;
  }

  let units = '';
  MiscConstants.PENALTY_VALUE_TYPES.forEach( item => {
    if (elem.toLowerCase() === item.toLowerCase()) {
      units = item;
    }
  })

  return units;
}
