const RECORD_TYPE = require('../../utils/constants/record-type-enum');

/**
 * Supported BCOGC record types.
 */
const BCOGC_UTILS_TYPES = Object.freeze({
  Order: {
    getUtil: (auth_payload, csvRow) => {
      return new (require('./orders-utils'))(auth_payload, RECORD_TYPE.Order, csvRow);
    }
  },
  Inspection: {
    getUtil: (auth_payload, csvRow) => {
      return new (require('./inspections-utils'))(auth_payload, RECORD_TYPE.Inspection, csvRow);
    }
  },
  AdministrativePenalty: {
    getUtil: (auth_payload, csvRow) => {
      return new (require('./administrative-penalties-utils'))(auth_payload, RECORD_TYPE.AdministrativePenalty, csvRow);
    }
  },
  Warning: {
    getUtil: (auth_payload, csvRow) => {
      return new (require('./warnings-utils'))(auth_payload, RECORD_TYPE.Warning, csvRow);
    }
  }
});

module.exports = BCOGC_UTILS_TYPES;
