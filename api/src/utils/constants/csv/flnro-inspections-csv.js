/**
 * Expected headers for NRIS FLNRO NRO Inspection csv.
 *
 * Note: sort order and letter case of headers is not important.
 *
 * @static
 * @memberof CsvConstants
 */
exports.flnrInspectionCsvRequiredHeaders = [
  'Record ID',
  'Date',
  'Client / Complainant',
  'Region',
  'Latitude',
  'Longitude',
  'Function',
  'Action Taken',
  'Activity',
  'Report Status'
];

/**
 * Required fields for NRIS FLNRO NRO Inspection csv.
 *
 * @static
 */
exports.flnrInspectionCsvRequiredFields = ['Record ID'];

/**
 * Fields for NRIS FLNRO NRO Inspection csv that have a required format.
 *
 * Note: These fields are not necessarily required, and only have a required format if present.
 *
 * @static
 * @memberof CsvConstants
 */
exports.flnrInspectionCsvRequiredFormats = [{ field: 'date', type: 'date', format: 'YYYY-MM-DD' }];

/**
 * Fields for NRIS FLNRO NRO Inspection csv that represent dates.
 *
 * @static
 * @memberof CsvConstants
 */
exports.flnrInspectionCsvDateFields = [{ field: 'date', format: 'YYYY-MM-DD' }];
