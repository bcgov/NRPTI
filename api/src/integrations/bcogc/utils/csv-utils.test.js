const CsvUtils = require('./csv-utils');
const MiscConstants = require('../../../utils/constants/misc');

describe('getProjectNameAndEpicProjectId', () => {
  it('returns null if null csvRow paramter provided ', () => {
    const result = CsvUtils.getProjectNameAndEpicProjectId(null);

    expect(result).toEqual(null);
  });

  it('returns Coastal Gaslink values if csvRow "operator" indicates Coastal Gaslink', () => {
    const result = CsvUtils.getProjectNameAndEpicProjectId({ operator: 'Coastal GasLink Pipeline Ltd.' });

    expect(result).toEqual({
      projectName: 'Coastal Gaslink',
      _epicProjectId: MiscConstants.EpicProjectIds.coastalGaslinkId
    });
  });

  it('returns LNG Canada values if csvRow "operator" indicates LNG Canada', () => {
    const result = CsvUtils.getProjectNameAndEpicProjectId({ operator: 'LNG Canada Development Inc.' });

    expect(result).toEqual({
      projectName: 'LNG Canada',
      _epicProjectId: MiscConstants.EpicProjectIds.lngCanadaId
    });
  });

  it('returns null if csvRow "operator" indicates neither LNG Canada or Coastal Gaslink', () => {
    const result = CsvUtils.getProjectNameAndEpicProjectId({ operator: 'fakeOperator' });

    expect(result).toEqual(null);
  });
});

describe('getOutcomeDescription', () => {
  it('returns null if null csvRow paramter provided ', () => {
    const result = CsvUtils.getOutcomeDescription(null);

    expect(result).toBe(null);
  });

  it('returns short description if "status" does not match specific values', () => {
    const result = CsvUtils.getOutcomeDescription({
      'activities inspected': 'activities123',
      status: 'status123'
    });

    expect(result).toEqual('Activities Inspected: activities123; Inspection Result: status123');
  });

  it('returns long description if "status" matches "Deficiencies Corrected"', () => {
    const result = CsvUtils.getOutcomeDescription({
      'activities inspected': 'activities123',
      status: 'Deficiencies Corrected',
      'regulation name': 'PR',
      'regulation number': '6789'
    });

    expect(result).toEqual(
      'Activities Inspected: activities123; Inspection Result: Deficiencies Corrected, Pipeline Regulation 6789'
    );
  });

  it('returns long description if "status" matches "Deficiencies Identified for Correction"', () => {
    const result = CsvUtils.getOutcomeDescription({
      'activities inspected': 'activities123',
      status: 'Deficiencies Identified for Correction',
      'regulation name': 'LA',
      'regulation number': '6789'
    });

    expect(result).toEqual(
      'Activities Inspected: activities123; Inspection Result: Deficiencies Identified for Correction, Land Act 6789'
    );
  });
});

describe('getRegulation', () => {
  it('returns null if null csvRow paramter provided ', () => {
    const result = CsvUtils.getRegulation(null);

    expect(result).toBe(null);
  });

  it('returns null if csvRow "regulation name" does not exist', () => {
    const result = CsvUtils.getRegulation({});

    expect(result).toBe(null);
  });

  it('returns null if csvRow "regulation name" is null', () => {
    const result = CsvUtils.getRegulation({ 'regulation name': null });

    expect(result).toBe(null);
  });

  it('returns null if csvRow "regulation name" is empty', () => {
    const result = CsvUtils.getRegulation({ 'regulation name': '' });

    expect(result).toBe(null);
  });

  it('returns matching regulation if csvRow "regulation name" is "OGAA"', () => {
    const result = CsvUtils.getRegulation({ 'regulation name': 'OGAA' });

    expect(result).toEqual('Energy Resource Activities Act');
  });

  it('returns matching regulation if csvRow "regulation name" is "D&PR"', () => {
    const result = CsvUtils.getRegulation({ 'regulation name': 'D&PR' });

    expect(result).toEqual('Drilling and Production Regulation');
  });

  it('returns matching regulation if csvRow "regulation name" is "PR"', () => {
    const result = CsvUtils.getRegulation({ 'regulation name': 'PR' });

    expect(result).toEqual('Pipeline Regulation');
  });

  it('returns matching regulation if csvRow "regulation name" is "OGRR"', () => {
    const result = CsvUtils.getRegulation({ 'regulation name': 'OGRR' });

    expect(result).toEqual('Oil and Gas Road Regulation');
  });

  it('returns matching regulation if csvRow "regulation name" is "EPMR"', () => {
    const result = CsvUtils.getRegulation({ 'regulation name': 'EPMR' });

    expect(result).toEqual('Environmental Protection and Management Regulation');
  });

  it('returns matching regulation if csvRow "regulation name" is "LA"', () => {
    const result = CsvUtils.getRegulation({ 'regulation name': 'LA' });

    expect(result).toEqual('Land Act');
  });
});
