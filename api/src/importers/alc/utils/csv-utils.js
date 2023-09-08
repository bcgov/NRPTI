const MiscConstants = require('../../../utils/constants/misc');

/**
 * Derives the outcome description string.
 *
 * @param {*} csvRow
 * @returns {string} the outcome description string.
 */
exports.getOutcomeDescription = function(csvRow) {
  if (!csvRow) {
    return null;
  }

  const complianceStatus = csvRow['compliance status'];
  const ceAction = csvRow['c&e actions'];
  const section = csvRow['section'];

  if (complianceStatus === 'Alleged Non-Compliance' && section) {
    return  `${complianceStatus} - ${ceAction}; Alleged Contravention: ${section}`
  }

  return `${complianceStatus} - ${ceAction}`;
};

/**
 * Derives the issued to entity type.
 *
 * @param {*} csvRow
 * @returns {string} the entity type.
 */
exports.getEntityType = function(csvRow) {
  let options = [" Ltd.", " Ltd", " Inc.", " Inc", " Corp.", " Corp"];

  function endsWithBusinessType(value, endings){
    for (const ending of endings) {
      const pattern = new RegExp(`${ending}$`, 'i');
      if (pattern.test(value)) {
        return true;
      }
  }
    return false
  }


  if (!csvRow) {
    return null;
  }
  if (endsWithBusinessType(csvRow['inspection property owner'], options)){
    return MiscConstants.IssuedToEntityTypes.Company;
  }

  return MiscConstants.IssuedToEntityTypes.Individual;
};
