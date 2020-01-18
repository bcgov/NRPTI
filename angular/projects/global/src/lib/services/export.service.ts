import { Injectable } from '@angular/core';
import { saveAs } from 'file-saver';
import { Parser } from 'json2csv';
import get from 'lodash.get';
import moment from 'moment';

/**
 * Service to generate and download an excel or csv file.
 *
 * @export
 * @class ExportService
 */
// @dynamic
@Injectable({
  providedIn: 'root'
})
export class ExportService {
  constructor() {}

  /**
   * Generates and downloads the given data as a csv file.
   *
   * @param {any[]} data array of objects
   * @param {string} fileName file name, not including extension
   * @param {string[]} [fields=[]] data fields include in csv, in order
   * @memberof ExportService
   */
  public exportAsCSV(data: any[], fileName: string, fields: any[] = []): void {
    const csvData: string = new Parser({ fields: fields }).parse(data);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, `${fileName}.csv`);
  }

  /**
   * Convenience method for converting an export date field to a formatted date string that is recognized by Excel as
   * a Date.
   *
   * Note: See www.npmjs.com/package/json2csv for details on what this function is supporting.
   *
   * @param {string} dateProperty the object property for the date (the key path, not the value). Can be the path to a
   *                              nested date field: 'some.nested.date'
   * @returns {(row) => string} a function that takes a row and returns a string
   * @memberof ExportService
   */
  public static getExportDateFormatter(dateProperty: string): (row) => string {
    return row => {
      const dateProp = get(row, dateProperty);

      if (!dateProp) {
        return null;
      }

      const date = moment(dateProp, 'YYYY-MM-DD');

      if (!date.isValid()) {
        return null;
      }

      return date.format('YYYY-MM-DD');
    };
  }

  /**
   * Convenience method for padding a string.
   *
   * Note: See www.npmjs.com/package/json2csv for details on why this function is organized the way it is.
   *
   * @param {string} property the object property for a value (the key path, not the value). Can be the path to a
   *                          nested field: 'some.nested.value' (required)
   * @param {number} padLength the length to pad the string to.  If the string is longer than padLength, no padding
   *                          occurs. (required)
   * @param {string} padValue the value that will be added to pad the string length, will be repeatedly added
   *                                     until the padLength is met or exceeded. (required)
   * @param {boolean} [padEnd=false] true if the padding should be added to the end of the string. (optional)
   * @returns {(row) => string} a function that takes a row and returns a string
   * @memberof ExportService
   */
  public static getExportPadFormatter(
    property: string,
    padLength: number,
    padValue: string,
    padEnd: boolean = false
  ): (row) => string {
    return row => {
      const prop = get(row, property);

      if (!prop) {
        return null;
      }

      if (padEnd) {
        return prop.toString().padEnd(padLength, padValue);
      }

      return prop.toString().padStart(padLength, padValue);
    };
  }
}
