const CsvUtils = require('./csv-utils');
const MiscConstants = require('../../../utils/constants/misc');

describe('getLegislation', () => {
  it('returns null if null csvRow paramter provided ', async () => {
    const result = await CsvUtils.getLegislation(null);

    expect(result).toBe(null);
  });

  it('returns "Forest Act 142.2" if csvRow "function" is "Revenue Management"', async () => {
    const result = await CsvUtils.getLegislation({ function: 'Revenue Management' });

    expect(result).toEqual({
      act: 'Forest Act',
      section: '142.2'
    });
  });

  it('returns "Water Sustainability Act 93 5" if csvRow "function" is "Water Management"', async () => {
    const result = await CsvUtils.getLegislation({ function: 'Water Management' });

    expect(result).toEqual({
      act: 'Water Sustainability Act',
      section: '93',
      subSection: '5'
    });
  });

  it('returns "Wildfire Act 19 3" if csvRow "function" is "Wildfire Management"', async () => {
    const result = await CsvUtils.getLegislation({ function: 'Wildfire Management' });

    expect(result).toEqual({
      act: 'Wildfire Act',
      section: '19',
      subSection: '3'
    });
  });

  it('returns "Heritage Conservation Act 15.1 3" if csvRow "function" is "Land Management" and "activity" is "Archaeology"', async () => {
    const result = await CsvUtils.getLegislation({ function: 'Land Management', activity: 'Archaeology' });

    expect(result).toEqual({
      act: 'Heritage Conservation Act',
      section: '15.1',
      subSection: '3'
    });
  });

  it('returns "Land Act 105" if csvRow "function" is "Land Management" and "activity" is "Land Occupation"', async () => {
    const result = await CsvUtils.getLegislation({ function: 'Land Management', activity: 'Land Occupation' });

    expect(result).toEqual({
      act: 'Land Act',
      section: '105'
    });
  });

  it('returns "Land Act 105" if csvRow "function" is "Land Management" and "activity" is "Land Use"', async () => {
    const result = await CsvUtils.getLegislation({ function: 'Land Management', activity: 'Land Use' });

    expect(result).toEqual({
      act: 'Land Act',
      section: '105'
    });
  });

  it('returns null if csvRow "function" is "Land Management" and "activity" is not "Archaeology", "Land Occupation" or "Land Use"', async () => {
    const result = await CsvUtils.getLegislation({ function: 'Land Management', activity: 'other activity' });

    expect(result).toEqual(null);
  });

  it('returns "Forest and Range Practices Act 59" if csvRow "function" is any other non-null value', async () => {
    const result = await CsvUtils.getLegislation({ function: 'some function value' });

    expect(result).toEqual({
      act: 'Forest and Range Practices Act',
      section: '59'
    });
  });
});

describe('getEntityType', () => {
  it('returns null if null csvRow paramter provided ', async () => {
    const result = await CsvUtils.getEntityType(null);

    expect(result).toBe(null);
  });

  it('returns "Company" if csvRow "client no" is "166165"', async () => {
    const result = await CsvUtils.getEntityType({ 'client no': '166165' });

    expect(result).toEqual(MiscConstants.IssuedToEntityTypes.Company);
  });

  it('returns "Company" if csvRow "client no" is "170181"', async () => {
    const result = await CsvUtils.getEntityType({ 'client no': '170181' });

    expect(result).toEqual(MiscConstants.IssuedToEntityTypes.Company);
  });

  it('returns "Individual" if csvRow "client no" is empty', async () => {
    const result = await CsvUtils.getEntityType({ 'client no': '' });

    expect(result).toEqual(MiscConstants.IssuedToEntityTypes.Individual);
  });

  it('returns "Individual" if csvRow "client no" is null', async () => {
    const result = await CsvUtils.getEntityType({ 'client no': null });

    expect(result).toEqual(MiscConstants.IssuedToEntityTypes.Individual);
  });
});

describe('getProjectNameAndEpicProjectId', () => {
  it('returns null if null csvRow paramter provided ', async () => {
    const result = await CsvUtils.getProjectNameAndEpicProjectId(null);

    expect(result).toBe(null);
  });

  it('returns null if csvRow "client no" is not "166165" or "170181"', async () => {
    const result = await CsvUtils.getProjectNameAndEpicProjectId({});

    expect(result).toBe(null);
  });

  it('returns "Coastal GasLink Pipeline Ltd." if csvRow "client no" is "166165"', async () => {
    const result = await CsvUtils.getProjectNameAndEpicProjectId({ 'client no': '166165' });

    expect(result).toEqual({
      projectName: 'Coastal GasLink Pipeline Ltd.',
      _epicProjectId: MiscConstants.EpicProjectIds.coastalGaslinkId
    });
  });

  it('returns "LNG Canada Development Inc." if csvRow "client no" is "170181"', async () => {
    const result = await CsvUtils.getProjectNameAndEpicProjectId({ 'client no': '170181' });

    expect(result).toEqual({ "projectName": "LNG Canada Development Inc.", _epicProjectId: MiscConstants.EpicProjectIds.lngCanadaId });
  });
});

describe('getOutcomeDescription', () => {
  it('returns null if null csvRow paramter provided ', async () => {
    const result = await CsvUtils.getOutcomeDescription(null);

    expect(result).toBe(null);
  });

  it('returns "Compliant" if csvRow "compliance status" is "Compliant"', async () => {
    const result = await CsvUtils.getOutcomeDescription({ 'compliance status': 'Compliant' });

    expect(result).toEqual('Compliant');
  });

  it('returns "Compliant Status - compliance status" if csvRow "compliance status" is not "Compliant" or "Alleged Non-Compliance"', async () => {
    const result = await CsvUtils.getOutcomeDescription({ 'compliance status': 'compliance status' });

    expect(result).toEqual('Compliant Status - compliance status');
  });

  it('returns expected contraventions if csvRow "compliance status" is "Alleged Non-Compliance"', async () => {
    const result = await CsvUtils.getOutcomeDescription({
      'compliance status': 'Alleged Non-Compliance',
      'action taken': 'Enforcement Action; No Action',
      'act or regulation': 'Forest Act; Timber Marking & Transportation Regulation (FA)',
      section: '84 (3) Fail to conspicuously timber mark, unscaled timber being stored or transported; 10 (2) Documentation requirements: Inadequate transport description'
    });

    expect(result).toEqual('Compliant Status - Enforcement Action - Forest Act 84 (3) Fail to conspicuously timber mark, unscaled timber being stored or transported; No Action - Timber Marking & Transportation Regulation 10 (2) Documentation requirements: Inadequate transport description');
  });
});
