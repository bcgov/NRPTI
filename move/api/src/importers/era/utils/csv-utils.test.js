const CsvUtils = require('./csv-utils');
const MiscConstants = require('../../../utils/constants/misc');

describe('getEntityType', () => {
  it('returns null if null csvRow paramter provided ', async () => {
    const result = await CsvUtils.getEntityType(null);

    expect(result).toBe(null);
  });

  it('returns "Company" if csvRow "client_type_code" is "C"', async () => {
    const result = await CsvUtils.getEntityType({ 'client_type_code': 'C' });

    expect(result).toEqual(MiscConstants.IssuedToEntityTypes.Company);
  });

  it('returns "Individual" if csvRow "client_type_code" is empty', async () => {
    const result = await CsvUtils.getEntityType({ 'client_type_code': '' });

    expect(result).toEqual(MiscConstants.IssuedToEntityTypes.Individual);
  });

  it('returns "Individual" if csvRow "client_type_code"', async () => {
    const result = await CsvUtils.getEntityType({ 'client_type_code': null });

    expect(result).toEqual(MiscConstants.IssuedToEntityTypes.Individual);
  });
});