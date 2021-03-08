import { Type } from '@angular/core';
import moment from 'moment';
import { OrderDetailComponent } from '../orders/order-detail/order-detail.component';
import { InspectionDetailComponent } from '../inspections/inspection-detail/inspection-detail.component';
import { RestorativeJusticeDetailComponent } from '../restorative-justices/restorative-justice-detail/restorative-justice-detail.component';
import { AdministrativePenaltyDetailComponent } from '../administrative-penalties/administrative-penalty-detail/administrative-penalty-detail.component';
import { AdministrativeSanctionDetailComponent } from '../administrative-sanctions/administrative-sanction-detail/administrative-sanction-detail.component';
import { TicketDetailComponent } from '../tickets/ticket-detail/ticket-detail.component';
import { WarningDetailComponent } from '../warnings/warning-detail/warning-detail.component';
import { CourtConvictionDetailComponent } from '../court-convictions/court-conviction-detail/court-conviction-detail.component';
import { Penalty } from '../../../../../common/src/app/models/master/common-models/penalty';

export class RecordUtils {
  /**
   * Given a record type, return the matching detail component type, or null if no matching component found.
   *
   * @static
   * @param {string} recordType
   * @returns {Type<TableRowComponent>}
   * @memberof RecordUtils
   */
  static getRecordDetailComponent(recordType: string): Type<any> {
    if (!recordType) {
      return null;
    }

    switch (recordType) {
      case 'OrderNRCED':
        return OrderDetailComponent;
      case 'InspectionNRCED':
        return InspectionDetailComponent;
      case 'RestorativeJusticeNRCED':
        return RestorativeJusticeDetailComponent;
      case 'AdministrativePenaltyNRCED':
        return AdministrativePenaltyDetailComponent;
      case 'AdministrativeSanctionNRCED':
        return AdministrativeSanctionDetailComponent;
      case 'TicketNRCED':
        return TicketDetailComponent;
      case 'WarningNRCED':
        return WarningDetailComponent;
      case 'CourtConvictionNRCED':
        return CourtConvictionDetailComponent;
      default:
        return null;
    }
  }

  /**
   * Convert URL query params to API request params
   *
   * @static
   * @param {any} params 
   * @returns {any} API request params
   * @memberof RecordUtils
   */
  static buildFilterParams(params: any): any {
    const filterParams = {};

    if(!params)
      return filterParams;

    if (params.dateRangeFromFilter) {
      filterParams['dateRangeFromFilterdateIssued'] = params.dateRangeFromFilter;
    }

    if (params.dateRangeToFilter) {
      filterParams['dateRangeToFilterdateIssued'] = params.dateRangeToFilter;
    }

    if (params.issuedToCompany && params.issuedToIndividual) {
      filterParams['issuedTo.type'] = 'Company,Individual,IndividualCombined';
    } else if (params.issuedToCompany) {
      filterParams['issuedTo.type'] = 'Company';
    } else if (params.issuedToIndividual) {
      filterParams['issuedTo.type'] = 'Individual,IndividualCombined';
    }

    if (params.agency) {
      filterParams['issuingAgency'] = params.agency;
    }

    if (params.act) {
      filterParams['legislation.act'] = params.act;
    }

    if (params.regulation) {
      filterParams['legislation.regulation'] = params.regulation;
    }

    return filterParams;
  }

  /**
   * Converts the input array of records to CSV string and initiate download
   * in the browser.
   *
   * @static
   * @param {any[]} data Array of record to be covnerted to CSV
   * @memberof RecordUtils
   */
  static exportToCsv(data: any[]): void {
    const csvHeaders = [
      'Record Name',
      'Record Type',
      'Issued On',
      'Issued To',
      'Summary',
      'Issuing Agency',
      'Legislation Act',
      'Regulation',
      'Section',
      'Sub Section',
      'Paragraph',
      'Description',
      'Offence',
      'Penalties',
      'Site/Project',
      'Location',
      'Latitude',
      'Longitude'
    ];

    let output = '';
    output = `${csvHeaders.join(',')}\n`;

    for (const row of data) {
      let line = [];
      line.push(escapeCsvString(row['recordName']));
      line.push(escapeCsvString(row['recordType']));
      line.push(moment(row['dateIssued']).format('YYYY-MM-DD'));

      const issuedTo = row['issuedTo'];
      if (issuedTo) {
        if (issuedTo['type'] === 'Company') line.push(escapeCsvString(issuedTo['companyName']));
        else line.push(escapeCsvString(issuedTo['fullName']));
      } else {
        line.push('Unpublished');
      }

      line.push(escapeCsvString(row['summary']));
      line.push(escapeCsvString(row['issuingAgency']));

      const legislation = row['legislation'];

      if (legislation) {
        line.push(escapeCsvString(legislation['act']));
        line.push(escapeCsvString(legislation['regulation']));
        line.push(escapeCsvString(legislation['section']));
        line.push(escapeCsvString(legislation['subSection']));
        line.push(escapeCsvString(legislation['paragraph']));
      } else {
        line = line.concat(['', '', '', '', '', '']);
      }

      line.push(escapeCsvString(row['legislationDescription']));
      line.push(escapeCsvString(row['offence']));

      const penalties = row['penalties'];
      let penaltiesString = '';
      if (penalties) penaltiesString = penalties.map(penalty => new Penalty(penalty).buildPenaltyString()).join('; ');
      line.push(escapeCsvString(penaltiesString));

      line.push(escapeCsvString(row['projectName']));
      line.push(escapeCsvString(row['location']));

      const centroid = row['centroid'];

      if (centroid && centroid.length === 2) {
        line.push(centroid[1]);
        line.push(centroid[0]);
      } else {
        line = line.concat(['', '']);
      }

      output += `${line.join(',')}\n`;
    }

    download(`nrced-export-${moment().format('YYYY-MM-DD')}.csv`, output);
  }
}

/**
 * Escape special characters in the CSV fields so the final output can be opened
 * correcly in Excel.
 *
 * @static
 * @param {any} csvField A single CSV field value
 */
function escapeCsvString(csvField: any): string {
  if (!csvField) return '';

  let str = csvField.toString();

  // Replace newline chars
  str = str.replace(/(?:\r\n|\r|\n)/g, '');

  // Escape quotes
  str = str.replace(/\"/g, '""');

  // Escape commas
  if (str.indexOf(',') > -1) str = `"${str}"`;

  return str;
}

/**
 * Escape special characters in the CSV fields so the final output can be opened
 * correcly in Excel.
 *
 * @static
 * @param {string} filename CSV filename to be saved as
 * @param {string} text CSV file data
 */
function download(filename: string, text: string): void {
  var blob = new Blob([text], { type: 'text/plain' });
  var url = window.URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
}
