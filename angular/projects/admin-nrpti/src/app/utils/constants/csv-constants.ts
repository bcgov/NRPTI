/**
 * Required format object to specify fields whose value must have a specific format.
 *
 * @export
 * @interface IRequiredFormat
 */
export interface IRequiredFormat {
  field: string;
  type: string;
  format: string;
}

/**
 * Csv import constants.
 *
 * @export
 * @class CsvConstants
 */
export class CsvConstants {
  /**
   * Expected headers for CORS Ticket csv.
   *
   * Note: sort order and letter case of headers is not important.
   *
   * @static
   * @memberof CsvConstants
   */
  public static readonly corsTicketCsvRequiredHeaders = [
    'CONTRAVENTION_ENFORCEMENT_ID',
    'TICKET_DATE',
    'FIRST_NAME',
    'MIDDLE_NAME',
    'LAST_NAME',
    'BUSINESS_NAME',
    'LOCATION_OF_VIOLATION',
    'TICKET_TYPE',
    'ACT',
    'REG',
    'REGULATION_DESCRIPTION',
    'SECTION',
    'SUB_SECTION',
    'PARAGRAPH',
    'PENALTY',
    'DESCRIPTION',
    'CASE_NUMBER',
    'BIRTH_DATE'
  ];

  /**
   * Required fields for CORS Ticket csv.
   *
   * @static
   * @memberof CsvConstants
   */
  public static readonly corsTicketCsvRequiredFields = ['CONTRAVENTION_ENFORCEMENT_ID'];

  /**
   * Fields for CORS Ticket csv that have a required format.
   *
   * Note: These fields are not necessarily required, and only have a required format if present.
   *
   * @static
   * @type {IRequiredFormat[]}
   * @memberof CsvConstants
   */
  public static readonly corsTicketCsvRequiredFormats: IRequiredFormat[] = [
    { field: 'TICKET_DATE', type: 'date', format: 'MM/DD/YYYY' },
    { field: 'BIRTH_DATE', type: 'date', format: 'YYYY/MM/DD' }
  ];

  /**
   * Get the array of required csv headers for the provided dataSourceType and recordType.
   *
   * @static
   * @param {string} dataSourceType
   * @param {string} recordType
   * @returns array of csv required headers
   * @memberof CsvConstants
   */
  public static getCsvRequiredHeadersArray(dataSourceType: string, recordType: string): string[] {
    if (!dataSourceType || !recordType) {
      return null;
    }

    if (dataSourceType === 'cors-csv') {
      if (recordType === 'Ticket') {
        return this.corsTicketCsvRequiredHeaders;
      }
    }

    return null;
  }

  /**
   * Get the array of required csv field values for the provided dataSourceType and recordType.
   *
   * @static
   * @param {string} dataSourceType
   * @param {string} recordType
   * @returns array of csv required fields
   * @memberof CsvConstants
   */
  public static getCsvRequiredFieldsArray(dataSourceType: string, recordType: string): string[] {
    if (!dataSourceType || !recordType) {
      return null;
    }

    if (dataSourceType === 'cors-csv') {
      if (recordType === 'Ticket') {
        return this.corsTicketCsvRequiredFields;
      }
    }

    return null;
  }

  /**
   * Get the array of required formats for csv field values for the provided dataSourceType and recordType.
   *
   * @static
   * @param {string} dataSourceType
   * @param {string} recordType
   * @returns {IRequiredFormat[]} array of required formats for csv fields
   * @memberof CsvConstants
   */
  public static getCsvRequiredFormatsArray(dataSourceType: string, recordType: string): IRequiredFormat[] {
    if (!dataSourceType || !recordType) {
      return null;
    }

    if (dataSourceType === 'cors-csv') {
      if (recordType === 'Ticket') {
        return this.corsTicketCsvRequiredFormats;
      }
    }

    return null;
  }
}
