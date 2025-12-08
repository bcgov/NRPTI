const awsMock = require('aws-sdk-mock');
const AWS = require('aws-sdk');
const moment = require('moment-timezone');
const fs = require('fs');
const path = require('path');

// Mock has to be setup before csv-helpers is loaded or the S3 connection doesn't use the mock
awsMock.setSDKInstance(AWS);
awsMock.mock('S3', 'getObject', Buffer.from(fs.readFileSync(path.resolve(__dirname, '../tests/fixture/mockCsv.csv'))));
const { readAndParseCsvFile } = require('./csv-helpers');

describe('readAndParseCsvFile', () => {
  it('returns parsed row if csv is valid ', async () => {
    const stream = new AWS.S3().getObject('getObject').createReadStream();
    const result = await readAndParseCsvFile(stream, 'nris-flnr-csv', 'Inspection');
    expect(result).toBeDefined();
    expect(result).toHaveLength(1);
    expect(result[0]['section']).toBe('Mowing without a license');
    expect(result[0]['date'] === moment.tz('2021-02-24', 'America/Vancouver'));
    expect(result[0]['record id']).toBe('999999');
  });
});
