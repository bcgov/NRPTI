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

  if (csvRow['client_type_code'] === 'C') return MiscConstants.IssuedToEntityTypes.Company;

  return MiscConstants.IssuedToEntityTypes.Individual;
};
