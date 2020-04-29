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
   * Get the array of required csv headers for the provided dataSourceType and recordType.
   *
   * @static
   * @param {string} dataSourceType
   * @param {string} recordType
   * @returns array of csv headers
   * @memberof CsvConstants
   */
  public static getCsvRequiredHeadersArray(dataSourceType: string, recordType: string): string[] {
    if (!dataSourceType || !recordType) {
      return null;
    }

    if (dataSourceType === 'cors-csv') {
      switch (recordType) {
        case 'Ticket':
          return this.corsTicketCsvRequiredHeaders;
        default:
          return null;
      }
    }
  }

  /**
   * Get the array of required csv field values for the provided dataSourceType and recordType.
   *
   * @static
   * @param {string} dataSourceType
   * @param {string} recordType
   * @returns array of csv headers
   * @memberof CsvConstants
   */
  public static getCsvRequiredFieldsArray(dataSourceType: string, recordType: string): string[] {
    if (!dataSourceType || !recordType) {
      return null;
    }

    if (dataSourceType === 'cors-csv') {
      switch (recordType) {
        case 'Ticket':
          return this.corsTicketCsvRequiredFields;
        default:
          return null;
      }
    }
  }
}
