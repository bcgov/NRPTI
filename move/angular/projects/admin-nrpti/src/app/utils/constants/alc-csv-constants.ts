import { IRequiredFormat, IDateField } from './csv-constants';

/**
 * Expected headers for ALC Inspection csv.
 *
 * Note: sort order and letter case of headers is not important.
 */
export const alcInspectionCsvRequiredHeaders = [
  'Record ID',
  'Record Type',
  'Date',
  'Local Government',
  'Inspection Property Owner',
  'Reason',
  'Section',
  'Compliance Status',
  'C&E Actions',
  'Status'
];

/**
 * Required fields for ALC Inspection  csv.
 *
 */
export const alcInspectionCsvRequiredFields = [
  'Record ID',
  'Record Type',
  'Compliance Status',
  'C&E Actions',
  'Date',
  'Status'
];

/**
 * Fields for ALC Inspection csv that have a required format.
 *
 * @type {IRequiredFormat[]}
 */
export const alcInspectionsCsvRequiredFormats: IRequiredFormat[] = [
  { field: 'Date', type: 'date', format: 'YYYY-MM-DD' }
];

/**
 * Fields for ALC Inspection csv that represent dates.
 *
 * @type {IDateField[]}
 */
export const alcInspectionsCsvDateFields: IDateField[] = [{ field: 'Date', format: 'YYYY-MM-DD' }];
