import { IRequiredFormat, IDateField } from './csv-constants';

/**
 * Expected headers for AMS Order csv.
 *
 * Note: sort order and letter case of headers is not important.
 */
export const amsOrdersCsvRequiredHeaders = [
  'AuthNumber',
  'ClientName',
  'IssueDate',
  'Latitude',
  'Longitude',
  'Region',
  'AuthorizationType',
  'WasteType'
];

/**
 * Required fields for AMS Order  csv.
 *
 */
export const amsOrdersCsvRequiredFields = [
  'AuthNumber',
  'ClientName',
  'IssueDate',
  'AuthorizationType',
];

/**
 * Fields for AMS Order  csv that have a required format.
 *
 * @type {IRequiredFormat[]}
 */
export const amsOrdersCsvRequiredFormats: IRequiredFormat[] = [
  { field: 'IssueDate', type: 'date', format: 'YYYY-MM-DD HH:mm:ss' }
];

/**
 * Fields for AMS Order csv that represent dates.
 *
 * @type {IDateField[]}
 */
export const amsOrdersCsvDateFields: IDateField[] = [{ field: 'IssueDate', format: 'YYYY-MM-DD HH:mm:ss' }];
