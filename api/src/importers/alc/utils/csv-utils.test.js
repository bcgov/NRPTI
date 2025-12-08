const CsvUtils = require('./csv-utils');
const MiscConstants = require('../../../utils/constants/misc');

describe('getEntityType', () => {
  it('returns null if null csvRow paramter provided ', async () => {
    const result = await CsvUtils.getEntityType(null);

    expect(result).toBe(null);
  });

  it('returns "Company" if csvRow "Inspection Property Owner" ends with Ltd, Corp, Inc, etc', async () => {
    const result = await CsvUtils.getEntityType({ 'inspection property owner': 'test Ltd.' });

    expect(result).toEqual(MiscConstants.IssuedToEntityTypes.Company);
  });

  it('returns "Individual" if csvRow "Inspection Property Owner" is empty', async () => {
    const result = await CsvUtils.getEntityType({ 'inspection property owner': '' });

    expect(result).toEqual(MiscConstants.IssuedToEntityTypes.Individual);
  });

  it('returns "Individual" if csvRow "Inspection Property Owner', async () => {
    const result = await CsvUtils.getEntityType({ 'inspection property owner': null });

    expect(result).toEqual(MiscConstants.IssuedToEntityTypes.Individual);
  });
});

describe('getOutcomeDescription', () => {
  it('returns null if null csvRow paramter provided ', async () => {
    const result = await CsvUtils.getOutcomeDescription(null);

    expect(result).toBe(null);
  });

  it('returns expected contraventions if csvRow "compliance status" is "Alleged Non-Compliance" and section not empty', async () => {
    const result = await CsvUtils.getOutcomeDescription({
      'compliance status': 'Alleged Non-Compliance',
      'c&e actions': 'Notice of Contravention',
      section: '20 (1) Non-farm use of land without authority'
    });

    expect(result).toEqual(
      'Alleged Non-Compliance - Notice of Contravention; Alleged Contravention: 20 (1) Non-farm use of land without authority'
    );
  });

  it('returns expected contraventions if csvRow "compliance status" is not "Alleged Non-Compliance"', async () => {
    const result = await CsvUtils.getOutcomeDescription({
      'compliance status': 'Compliant',
      'c&e actions': 'No Action'
    });

    expect(result).toEqual('Compliant - No Action');
  });
});
