const BaseRecordUtils = require('./base-record-utils');

const MiscConstants = require('../../utils/constants/misc');

/**
 * AMS csv Orders record handler.
 *
 * @class Orders
 */
class Orders extends BaseRecordUtils {
  /**
   * Creates an instance of Orders.
   *
   * @param {*} auth_payload user information for auditing
   * @param {*} recordType an item from record-type-enum.js -> RECORD_TYPE
   * @param {*} csvRow an object containing the values from a single csv row.
   * @memberof Orders
   */
  constructor(auth_payload, recordType, csvRow) {
    super(auth_payload, recordType, csvRow);
  }

  /**
   * Convert the csv row object into the object expected by the API record post/put controllers.
   *
   * @returns an order object matching the format expected by the API record post/put controllers.
   * @memberof Orders
   */
  transformRecord(csvRow) {
    if (!csvRow) {
      throw Error('transformRecord - required csvRow must be non-null.');
    }

    const order = { ...super.transformRecord(csvRow) };

    order['_sourceRefStringId'] = csvRow['authnumber'] || '';

    order['recordType'] = 'Order';
    order['dateIssued'] = csvRow['issuedate'] || null;

    order['issuingAgency'] = 'Environmental Protection Division';
    order['author'] = 'Environmental Protection Division';

    order['recordName'] = (csvRow['authnumber'] && `AMS Authorization # ${csvRow['authnumber']}`) || '-';

    const region = csvRow['region'];
    if (region && region.startsWith('Authorizations - ')) {
      order['location'] = region.substring(17);
    } else {
      order['location'] = 'British Columbia';
    }

    if (csvRow['longitude'] && csvRow['latitude']) {
      order['centroid'] = [Number(csvRow['longitude']), Number(csvRow['latitude'])];
    } else {
      order['centroid'] = null;
    }

    order['issuedTo'] = {
      type: MiscConstants.IssuedToEntityTypes.Company,
      companyName: csvRow['clientname'] || ''
    };

    const wasteType = csvRow['wastetype'];
    if (wasteType) {
      order['summary'] = `Authorization Number: ${csvRow['authnumber']}; Waste Type: ${wasteType}`;
    } else {
      order['summary'] = `Authorization Number: ${csvRow['authnumber']}`;
    }

    const authorizationType = csvRow['authorizationtype'];
    order['legislation'] = {
      act: 'Environmental Management Act'
    };
    if (authorizationType === 'Information') {
      order['legislation']['section'] = 77;
      order['legislationDescription'] = 'Information Order';
    } else if (authorizationType === 'Pollution Prevention') {
      order['legislation']['section'] = 81;
      order['legislationDescription'] = 'Pollution Prevention Order';
    } else if (authorizationType === 'Pollution Abatement') {
      order['legislation']['section'] = 83;
      order['legislationDescription'] = 'Pollution Abatement Order';
    }

    

    return order;
  }
}

module.exports = Orders;
