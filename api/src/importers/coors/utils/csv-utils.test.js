const CsvUtils = require('./csv-utils');
const MiscConstants = require('../../../utils/constants/misc');

describe('getEntityType', () => {
  it('returns null if null csvRow paramter provided ', async () => {
    const result = await CsvUtils.getEntityType(null);

    expect(result).toBe(null);
  });

  it('returns "Company" if csvRow "business_name" is non-null', async () => {
    const result = await CsvUtils.getEntityType({ business_name: 'a business name' });

    expect(result).toEqual(MiscConstants.IssuedToEntityTypes.Company);
  });

  it('returns "Individual" if csvRow "business_name" is empty', async () => {
    const result = await CsvUtils.getEntityType({ business_name: '' });

    expect(result).toEqual(MiscConstants.IssuedToEntityTypes.Individual);
  });

  it('returns "Individual" if csvRow "business_name" is null', async () => {
    const result = await CsvUtils.getEntityType({ business_name: null });

    expect(result).toEqual(MiscConstants.IssuedToEntityTypes.Individual);
  });
});

describe('getIssuingAgency', () => {
  it('returns null if null csvRow paramter provided ', async () => {
    const result = await CsvUtils.getIssuingAgency(null);

    expect(result).toBe(null);
  });

  it('returns null if csvRow "case_number" has no "case_number" property', async () => {
    const result = await CsvUtils.getIssuingAgency({});

    expect(result).toBe(null);
  });

  it('returns "BC Parks" if csvRow "case_number" starts with a "P-"', async () => {
    const result = await CsvUtils.getIssuingAgency({ case_number: 'P-123123' });

    expect(result).toEqual(MiscConstants.CoorsCsvIssuingAgencies.BC_Parks);
  });

  it('returns "Conservation Officer Service" if csvRow "case_number" does not start with a "P-"', async () => {
    const result = await CsvUtils.getIssuingAgency({ case_number: '123123' });

    expect(result).toEqual(MiscConstants.CoorsCsvIssuingAgencies.Conservation_Officer_Service);
  });
});
