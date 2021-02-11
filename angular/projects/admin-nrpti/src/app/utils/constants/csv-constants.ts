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
 * Date fields and their corresponding date formats.  Dates must be transformed into proper date-strings prior to
 * being sent to the API.
 *
 * @export
 * @interface IDateField
 */
export interface IDateField {
  field: string;
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
   * Expected headers for COORS Administrative Sanction csv.
   *
   * Note: sort order and letter case of headers is not important.
   *
   * @static
   * @memberof CsvConstants
   */
  public static readonly coorsAdminSanctionCsvRequiredHeaders = [
    'CASE_CONTRAVENTION_ID',
    'ENFORCEMENT_ACTION_ID',
    'RECORD_TYPE_CODE',
    'BUSINESS_REVIEWED_IND',
    'FIRST_NAME',
    'MIDDLE_NAME',
    'LAST_NAME',
    'BIRTH_DATE',
    'BUSINESS_NAME',
    'LOCATION_OF_VIOLATION',
    'REGULATION_DESCRIPTION',
    'ACT',
    'SECTION',
    'SUB_SECTION',
    'PARAGRAPH',
    'VIOLATIONS_PROMPTING_ACTION',
    'EFFECTIVE_DATE',
    'SUMMARY',
    'ENFORCEMENT_LICENCE_CODE'
  ];

  /**
   * Required fields for COORS Administrative Sanction csv.
   *
   * @static
   * @memberof CsvConstants
   */
  public static readonly coorsAdminSanctionCsvRequiredFields = [
    'CASE_CONTRAVENTION_ID',
    'ENFORCEMENT_ACTION_ID',
    'RECORD_TYPE_CODE',
    'BUSINESS_REVIEWED_IND',
  ];

  /**
   * Fields for COORS Administrative Sanction csv that have a required format.
   *
   * Note: These fields are not necessarily required, and only have a required format if present.
   *
   * @static
   * @type {IRequiredFormat[]}
   * @memberof CsvConstants
   */
  public static readonly coorsAdminSanctionCsvRequiredFormats: IRequiredFormat[] = [
    { field: 'EFFECTIVE_DATE', type: 'date', format: 'MM/DD/YYYY' },
    { field: 'BIRTH_DATE', type: 'date', format: 'YYYY-MM-DD' }
  ];

  /**
   * Fields for COORS Administrative Sanction csv that represent dates.
   *
   * @static
   * @type {IDateField[]}
   * @memberof CsvConstants
   */
  public static readonly coorsAdminSanctionCsvDateFields: IDateField[] = [
    { field: 'EFFECTIVE_DATE', format: 'MM/DD/YYYY' },
    { field: 'BIRTH_DATE', format: 'YYYY-MM-DD' }
  ];

  /**
   * Expected headers for COORS Ticket csv.
   *
   * Note: sort order and letter case of headers is not important.
   *
   * @static
   * @memberof CsvConstants
   */
  public static readonly coorsTicketCsvRequiredHeaders = [
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
   * Required fields for COORS Ticket csv.
   *
   * @static
   * @memberof CsvConstants
   */
  public static readonly coorsTicketCsvRequiredFields = ['CONTRAVENTION_ENFORCEMENT_ID'];

  /**
   * Fields for COORS Ticket csv that have a required format.
   *
   * Note: These fields are not necessarily required, and only have a required format if present.
   *
   * @static
   * @type {IRequiredFormat[]}
   * @memberof CsvConstants
   */
  public static readonly coorsTicketCsvRequiredFormats: IRequiredFormat[] = [
    { field: 'TICKET_DATE', type: 'date', format: 'MM/DD/YYYY' },
    { field: 'BIRTH_DATE', type: 'date', format: 'YYYY/MM/DD' }
  ];

  /**
   * Fields for COORS Ticket csv that represent dates.
   *
   * @static
   * @type {IDateField[]}
   * @memberof CsvConstants
   */
  public static readonly coorsTicketCsvDateFields: IDateField[] = [
    { field: 'TICKET_DATE', format: 'MM/DD/YYYY' },
    { field: 'BIRTH_DATE', format: 'YYYY/MM/DD' }
  ];

  /**
   * Expected headers for COORS Court Convictions csv.
   *
   * Note: sort order and letter case of headers is not important.
   *
   * @static
   * @memberof CsvConstants
   */
   public static readonly coorsConvictionCsvRequiredHeaders = [
    'CASE_CONTRAVENTION_ID',
    'ENFORCEMENT_ACTION_ID',
    'FINAL_DECISION_DATE',
    'FIRST_NAME',
    'MIDDLE_NAME',
    'LAST_NAME',
    'BUSINESS_NAME',
    'LOCATION',
    'ACT',
    'REGULATION_DESCRIPTION',
    'SECTION',
    'SUB_SECTION',
    'PARAGRAPH',
    'PENALTY_AMOUNT',
    'PENALTY_UNIT_CODE',
    'DESCRIPTION',
    'SUMMARY',
    'CASE_NO',
    'BIRTH_DATE'
  ];

  /**
   * Required fields for COORS Ticket csv.
   *
   * @static
   * @memberof CsvConstants
   */
  public static readonly coorsConvictionCsvRequiredFields = [
    'CASE_CONTRAVENTION_ID',
    'ENFORCEMENT_ACTION_ID'
  ];

  /**
   * Fields for COORS Ticket csv that have a required format.
   *
   * Note: These fields are not necessarily required, and only have a required format if present.
   *
   * @static
   * @type {IRequiredFormat[]}
   * @memberof CsvConstants
   */
  public static readonly coorsConvictionCsvRequiredFormats: IRequiredFormat[] = [
    { field: 'FINAL_DECISION_DATE', type: 'date', format: 'MM/DD/YYYY' },
    { field: 'BIRTH_DATE', type: 'date', format: 'YYYY-MM-DD' }
  ];

  /**
   * Fields for COORS Ticket csv that represent dates.
   *
   * @static
   * @type {IDateField[]}
   * @memberof CsvConstants
   */
  public static readonly coorsConvictionCsvDateFields: IDateField[] = [
    { field: 'FINAL_DECISION_DATE', format: 'MM/DD/YYYY' },
    { field: 'BIRTH_DATE', format: 'YYYY-MM-DD' }
  ];

  /**
   * Expected headers for OGC Inspection csv.
   *
   * Note: sort order and letter case of headers is not important.
   *
   * @static
   * @memberof CsvConstants
   */
  public static readonly ogcInspectionCsvRequiredHeaders = [
    'Inspection Number',
    'Inspection Date',
    'Location',
    'Operator',
    'Activities Inspected',
    'Status',
    'Regulation Name',
    'Regulation Number',
    'Deficiency Objectid'
  ];

  /**
   * Required fields for OGC Inspection csv.
   *
   * @static
   * @memberof CsvConstants
   */
  public static readonly ogcInspectionCsvRequiredFields = ['Inspection Number'];

  /**
   * Fields for OGC Inspection csv that have a required format.
   *
   * Note: These fields are not necessarily required, and only have a required format if present.
   *
   * @static
   * @type {IRequiredFormat[]}
   * @memberof CsvConstants
   */
  public static readonly ogcInspectionCsvRequiredFormats: IRequiredFormat[] = [
    { field: 'Inspection Date', type: 'date', format: 'DD-MMM-YYYY' }
  ];

  /**
   * Fields for OGC Inspection csv that represent dates.
   *
   * @static
   * @type {IDateField[]}
   * @memberof CsvConstants
   */
  public static readonly ogcInspectionCsvDateFields: IDateField[] = [
    { field: 'Inspection Date', format: 'DD-MMM-YYYY' }
  ];

  /**
   * Expected headers for NRIS FLNRO NRO Inspection csv.
   *
   * Note: sort order and letter case of headers is not important.
   *
   * @static
   * @memberof CsvConstants
   */
  public static readonly nroInspectionCsvRequiredHeaders = [
    'Record ID',
    'Date',
    'Client / Complainant',
    'Region',
    'Latitude',
    'Longitude',
    'Function',
    'Action Taken',
    'Activity',
    'Report Status',
  ];

  /**
   * Required fields for NRIS FLNRO NRO Inspection csv.
   *
   * @static
   * @memberof CsvConstants
   */
  public static readonly nroInspectionCsvRequiredFields = ['Record ID'];

  /**
   * Fields for NRIS FLNRO NRO Inspection csv that have a required format.
   *
   * Note: These fields are not necessarily required, and only have a required format if present.
   *
   * @static
   * @type {IRequiredFormat[]}
   * @memberof CsvConstants
   */
  public static readonly nroInspectionCsvRequiredFormats: IRequiredFormat[] = [
    { field: 'Date', type: 'date', format: 'YYYY-MM-DD' }
  ];

  /**
   * Fields for NRIS FLNRO NRO Inspection csv that represent dates.
   *
   * @static
   * @type {IDateField[]}
   * @memberof CsvConstants
   */
  public static readonly nroInspectionCsvDateFields: IDateField[] = [
    { field: 'Date', format: 'YYYY-MM-DD' }
  ];

  /**
   * Expected headers for AGRI MIS Inspection csv.
   *
   * Note: sort order and letter case of headers is not important.
   *
   * @static
   * @memberof CsvConstants
   */
  public static readonly misInspectionCsvRequiredHeaders = [
    'Est. Name',
    'Region',
    'Issue No.',
    'Created ',
    'Regulation'
  ];

  /**
   * Required fields for AGRI MIS Inspection csv.
   *
   * @static
   * @memberof CsvConstants
   */
  // todo revist make sure there aren't more required fields to add
  public static readonly misInspectionCsvRequiredFields = ['Issue No.'];

  /**
   * Fields forAGRI MIS Inspection csv that have a required format.
   *
   * Note: These fields are not necessarily required, and only have a required format if present.
   *
   * @static
   * @type {IRequiredFormat[]}
   * @memberof CsvConstants
   */
  public static readonly misInspectionsCsvRequiredFormats: IRequiredFormat[] = [
    { field: 'Date', type: 'date', format: 'MM/DD/YYYY' }
  ];

  /**
   * Fields for AGRI MIS Inspection csv that represent dates.
   *
   * @static
   * @type {IDateField[]}
   * @memberof CsvConstants
   */
  public static readonly misInspectionsCsvDateFields: IDateField[] = [
    { field: 'Created ', format: 'MM/DD/YYYY' }
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

    if (dataSourceType === 'coors-csv') {
      if (recordType === 'Ticket') {
        return this.coorsTicketCsvRequiredHeaders;
      }
      if (recordType === 'Court Conviction') {
        return this.coorsConvictionCsvRequiredHeaders;
      }
      if (recordType === 'Administrative Sanction') {
        return this.coorsAdminSanctionCsvRequiredHeaders;
      }
    }

    if (dataSourceType === 'bcogc') {
      if (recordType === 'Inspection') {
        return this.ogcInspectionCsvRequiredHeaders;
      }
    }

    if (dataSourceType === 'nro-csv') {
      if (recordType === 'Inspection') {
        return this.nroInspectionCsvRequiredHeaders;
      }
    }

    if (dataSourceType === 'mis-csv') {
      if (recordType === 'Inspection') {
        return this.misInspectionCsvRequiredHeaders;
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

    if (dataSourceType === 'coors-csv') {
      if (recordType === 'Ticket') {
        return this.coorsTicketCsvRequiredFields;
      }
      if (recordType === 'Court Conviction') {
        return this.coorsConvictionCsvRequiredFields;
      }
      if (recordType === 'Administrative Sanction') {
        return this.coorsAdminSanctionCsvRequiredFields;
      }
    }

    if (dataSourceType === 'bcogc') {
      if (recordType === 'Inspection') {
        return this.ogcInspectionCsvRequiredFields;
      }
    }

    if (dataSourceType === 'nro-csv') {
      if (recordType === 'Inspection') {
        return this.nroInspectionCsvRequiredFields;
      }
    }

    if (dataSourceType === 'mis-csv') {
      if (recordType === 'Inspection') {
        return this.misInspectionCsvRequiredFields;
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

    if (dataSourceType === 'coors-csv') {
      if (recordType === 'Ticket') {
        return this.coorsTicketCsvRequiredFormats;
      }
      if (recordType === 'Court Conviction') {
        return this.coorsConvictionCsvRequiredFormats;
      }
      if (recordType === 'Administrative Sanction') {
        return this.coorsAdminSanctionCsvRequiredFormats;
      }
    }

    if (dataSourceType === 'bcogc') {
      if (recordType === 'Inspection') {
        return this.ogcInspectionCsvRequiredFormats;
      }
    }

    if (dataSourceType === 'nro-csv') {
      if (recordType === 'Inspection') {
        return this.nroInspectionCsvRequiredFormats;
      }
    }

    if (dataSourceType === 'mis-csv') {
      if (recordType === 'Inspection') {
        return this.misInspectionsCsvRequiredFormats;
      }
    }

    return null;
  }

  /**
   * Get the array of date fields for csv dataSourceType and recordType.
   *
   * @static
   * @param {string} dataSourceType
   * @param {string} recordType
   * @returns {IDateFields[]} array of date fields and their formats for csv
   * @memberof CsvConstants
   */
  public static getCsvDateFieldsArray(dataSourceType: string, recordType: string): IDateField[] {
    if (!dataSourceType || !recordType) {
      return null;
    }

    if (dataSourceType === 'coors-csv') {
      if (recordType === 'Ticket') {
        return this.coorsTicketCsvDateFields;
      }
      if (recordType === 'Court Conviction') {
        return this.coorsConvictionCsvDateFields;
      }
      if (recordType === 'Administrative Sanction') {
        return this.coorsAdminSanctionCsvDateFields;
      }
    }

    if (dataSourceType === 'bcogc') {
      if (recordType === 'Inspection') {
        return this.ogcInspectionCsvDateFields;
      }
    }

    if (dataSourceType === 'nro-csv') {
      if (recordType === 'Inspection') {
        return this.nroInspectionCsvDateFields;
      }
    }

    if (dataSourceType === 'mis-csv') {
      if (recordType === 'Inspection') {
        return this.misInspectionsCsvDateFields;
      }
    }

    return null;
  }
}
