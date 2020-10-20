const MiscConstants = require('../../../utils/constants/misc');

/**
 * Derives the project name and epic project id.
 *
 * @param {*} csvRow
 * @returns {{projectName: string, _epicProjectId: string}} object containing the project name and _epicProjectId.
 */
exports.getProjectNameAndEpicProjectId = function(csvRow) {
  if (!csvRow) {
    return null;
  }

  if (csvRow['operator'] === 'Coastal GasLink Pipeline Ltd.') {
    return { projectName: 'Coastal Gaslink', _epicProjectId: MiscConstants.EpicProjectIds.coastalGaslinkId };
  }

  if (csvRow['operator'] === 'LNG Canada Development Inc.') {
    return { projectName: 'LNG Canada', _epicProjectId: MiscConstants.EpicProjectIds.lngCanadaId };
  }

  return null;
};

/**
 * Derive the outcome description.
 *
 * @param {*} csvRow
 * @returns {string} outcome description.
 */
exports.getOutcomeDescription = function(csvRow) {
  if (!csvRow) {
    return null;
  }

  let outcomeDescription =
    `Activities Inspected: ${csvRow['activities inspected'] || '-'}; ` +
    `Inspection Result: ${csvRow['status'] || '-'}`;

  if (csvRow['status'] === 'Deficiencies Corrected' || csvRow['status'] === 'Deficiencies Identified for Correction') {
    outcomeDescription += `, ${getRegulation(csvRow) || '-'} ${csvRow['regulation number'] || '-'}`;
  }

  return outcomeDescription;
};

/**
 * Derive the regulation.
 *
 * @param {*} csvRow
 * @returns {string} regulation.
 */
function getRegulation(csvRow) {
  if (!csvRow || !csvRow['regulation name']) {
    return null;
  }

  if (csvRow['regulation name'] === 'OGAA') {
    return 'Oil and Gas activities Act';
  }

  if (csvRow['regulation name'] === 'D&PR') {
    return 'Drilling and Production Regulation';
  }

  if (csvRow['regulation name'] === 'PR') {
    return 'Pipeline Regulation';
  }

  if (csvRow['regulation name'] === 'OGRR') {
    return 'Oil and Gas Road Regulation';
  }

  if (csvRow['regulation name'] === 'EPMR') {
    return 'Environmental Protection and Management Regulation';
  }

  if (csvRow['regulation name'] === 'LA') {
    return 'Land Act';
  }

  return null;
}
exports.getRegulation = getRegulation;
