/**
 * Additional common Epic pre-processing/transformations for Epic records.
 *
 * @param {object} epicRecord Epic record (required)
 * @returns {Order} updated Epic record.
 * @throws {Error} if record is not provided.
 */
const preTransformRecord = function(epicRecord) {
  if (!epicRecord) {
    throw Error('preTransformRecord - required record must be non-null.');
  }

  // Transform Epic project names to match values tracked by NRPTI
  if (epicRecord.project && epicRecord.project.name) {
    switch (epicRecord.project.name) {
      case 'LNG Canada Export Terminal':
        epicRecord.project.name = 'LNG Canada';
        break;
      case 'Coastal GasLink Pipeline':
        epicRecord.project.name = 'Coastal Gaslink';
    }
  }

  // Transform Epic author names to match values tracked by NRPTI
  if (epicRecord.documentAuthor) {
    switch (epicRecord.documentAuthor) {
      case 'EPIC':
        epicRecord.documentAuthor = 'NRPTI';
        break;
      case 'EAO':
        epicRecord.documentAuthor = 'BC Government';
        break;
      case 'Proponent/Certificate Holder':
        epicRecord.documentAuthor = 'Proponent';
        break;
      default:
        epicRecord.documentAuthor = 'Other';
    }
  }

  return epicRecord;
};

exports.preTransformRecord = preTransformRecord;
