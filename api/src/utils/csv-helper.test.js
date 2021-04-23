const AWS = require('aws-sdk');
const awsMock = require('aws-sdk-mock');
const Readable = require('stream').Readable;

const { readAndParseCsvFile } = require('./csv-helpers');

const csvBody = 'Record ID,Date,Compliance Status,Region,Function,Activity,Parent Act,Act or Regulation,Client Type,Client / Complainant,Latitude,Longitude,Action Taken,Client No,Report Status,Section \
999999,2021-02-24,Alleged Thing,Somewhere,Grass Management,Mowing,Lawn Care,Lawn Care Act,C,A Copmany,54.432,-124.5,Cutting Action,111111,Complete,"Mowing without a license"';

AWS.config.paramValidation = false;

describe('readAndParseCsvFile', () => {
  it('returns null if csv stream is empty ', async () => {
    const bodyStream = new Readable();
    bodyStream.push(csvBody);
    bodyStream.push(null);
    awsMock.mock('S3', 'getObject', bodyStream)
    const stream = new AWS.S3().getObject('getObject').createReadStream();
    const result = await readAndParseCsvFile(stream, 'nris-flnr-csv', 'Inspection');

    expect(result).toBe(null);
  });
})
