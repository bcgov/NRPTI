const MiscConstants = require('../../../utils/constants/misc');

/**
 * Derives the Legislation data.
 *
 * @param {*} csvRow
 * @returns {object} the Legislation object.
 */
exports.getLegislation = function(csvRow) {
  if (!csvRow || !csvRow['function']) {
    return null;
  }

  switch (csvRow['function']) {
    case 'Revenue Management':
      return {
        act: 'Forest Act',
        section: '142.2'
      };
    case 'Water Management':
      return {
        act: 'Water Sustainability Act',
        section: '93',
        subSection: '5'
      };
    case 'Wildfire Management':
      return {
        act: 'Wildfire Act',
        section: '19',
        subSection: '3'
      };
    case 'Land Management':
      if (csvRow['activity'] === 'Archaeology')
        return {
          act: 'Heritage Conservation Act',
          section: '15.1',
          subSection: '3'
        };

      if (csvRow['activity'] === 'Land Occupation' || csvRow['activity'] === 'Land Use')
        return {
          act: 'Land Act',
          section: '105'
        };

      return null;
    default:
      return {
        act: 'Forest and Range Practices Act',
        section: '59'
      };
  }
};

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

  if (complianceStatus === 'Compliant') return complianceStatus;

  if (complianceStatus === 'Alleged Non-Compliance') {
    const outcomes = [];

    // Construct contraventions.  See https://bcmines.atlassian.net/browse/NRPT-12 for more details
    //
    // For each instance for 'action take', append the matching `act or regulations` and `section`
    const actionsTaken = csvRow['action taken'].split(';');
    const actOrRegulations = csvRow['act or regulation'].split(';');
    const sections = csvRow['section'].split(';');

    for (let i = 0; i < actionsTaken.length; i++) {
      outcomes.push(`${actionsTaken[i].trim()} - ${stripAcronyms(actOrRegulations[i].trim())} ${sections[i].trim()}`);
    }

    return `${complianceStatus} - ${outcomes.join('; ')}`;
  }

  return `${complianceStatus} - ${csvRow['action taken']}`;
};

/**
 * Remove the trailing acrynyms in 'Act or Regulation' values
 *  e.g., 'Open Burning Smoke Control Regulation (EMA)' should become
 *    'Open Burning Smoke Control Regulation'
 *
 * @param {*} csvRow
 * @returns {string} the cleaned up 'Act or Regulation' values.
 */
function stripAcronyms(actOrRegulation) {
  if (!actOrRegulation) return actOrRegulation;

  return actOrRegulation.replace(/\(\w+\)$/, '').trim();
}

/**
 * Derives the EPIC project name and id.
 *
 * @param {*} csvRow
 * @returns {object} the EPIC project name and id.
 */
exports.getProjectNameAndEpicProjectId = function(csvRow) {
  if (!csvRow) {
    return null;
  }

  const client = csvRow['client no'];

  if (client === '166165') {
    return { projectName: 'Coastal GasLink Pipeline Ltd.', _epicProjectId: MiscConstants.EpicProjectIds.coastalGaslinkId };
  }

  if (client === '170181') {
    return { projectName: 'LNG Canada Development Inc.', _epicProjectId: MiscConstants.EpicProjectIds.lngCanadaId };
  }

  return null;
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

  const client = csvRow['client no'];

  // only set LNG and CGL to Company
  if (client === '166165' || client === '170181') {
    return MiscConstants.IssuedToEntityTypes.Company;
  }

  return MiscConstants.IssuedToEntityTypes.Individual;
};
