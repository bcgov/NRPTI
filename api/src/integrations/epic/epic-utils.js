/**
 * Additional common Epic pre-processing/transformations for Epic records.
 *
 * @param {object} epicRecord Epic record (required)
 * @returns {Order} updated Epic record.
 * @throws {Error} if record is not provided.
 */
const preTransformRecord = function (epicRecord) {
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
  // See admin-nrpti/../record-constants.ts -> authorPicklist
  if (epicRecord.documentAuthor) {
    switch (epicRecord.documentAuthor) {
      case '5cf00c03a266b7e1877504db': // 'EAO' - legislation 2002
      case '5df79dd77b5abbf7da6f51d1': // 'EAO - legislation 2018
        epicRecord.documentAuthor = 'BC Government';
        break;
      case '5cf00c03a266b7e1877504dc': // 'Proponent / Certificate Holder' - legislation 2002
      case '5df79dd77b5abbf7da6f51d2': // 'Proponent/Certificate Holder' - legislation 2018
        epicRecord.documentAuthor = 'Proponent';
        break;
      default:
        epicRecord.documentAuthor = 'Other';
    }
  }

  return epicRecord;
};

exports.preTransformRecord = preTransformRecord;
