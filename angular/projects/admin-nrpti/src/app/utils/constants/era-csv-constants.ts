import { IRequiredFormat, IDateField } from './csv-constants';

/**
 * Expected headers for ALC Inspection csv.
 *
 * Note: sort order and letter case of headers is not important.
 */
export const eraTicketsCsvRequiredHeaders = [
  'CASE_CONTRAVENTION_ID',
  'ENFORCEMENT_ACTION_ID',
  'FC_CLIENT_NAME',
  'ACT_DESCRIPTION',
  'REG_DESCRIPTION',
  'SECTION',
  'SUB_SECTION',
  'PARAGRAPH',
  'ARTICLE_DESCRIPTION',
  'FINE_AMOUNT',
  'SERVICE_DATE',
  'REGION',
  'ORG_UNIT_NAME',
  'CLIENT_TYPE_CODE'
];

/**
 * Required fields for ALC Inspection  csv.
 *
 */
export const eraTicketsCsvRequiredFields = [
  'CASE_CONTRAVENTION_ID',
  'ENFORCEMENT_ACTION_ID',
  'FC_CLIENT_NAME',
  'SERVICE_DATE',
  'CLIENT_TYPE_CODE'
];

/**
 * Fields for ALC Inspection csv that have a required format.
 *
 * @type {IRequiredFormat[]}
 */
export const eraTicketsCsvRequiredFormats: IRequiredFormat[] = [
  { field: 'SERVICE_DATE', type: 'date', format: 'MM/DD/YYYY' }
];

/**
 * Fields for ALC Inspection csv that represent dates.
 *
 * @type {IDateField[]}
 */
export const eraTicketsCsvDateFields: IDateField[] = [{ field: 'SERVICE_DATE', format: 'MM/DD/YYYY' }];
