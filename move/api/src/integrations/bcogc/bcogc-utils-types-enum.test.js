const BCOGC_UTILS_TYPES = require('./bcogc-utils-types-enum');

const mockAuthPayload = 'authPayload';
const mockCSVRow = { 
    'Title': '123',
    'author': 'AGENCY_OGC',
    'issuingAgency': 'AGENCY_OGC',
    'recordName': 'record name',
    'Date Issued': '11-07-2023',
    'Proponent': 'Proponent',
    'Filename': 'Filename',
    'File URL': 'File URL',
};

describe('BCOGC Utils Types Enum', () => {
  it('should return Order utility', () => {
    const orderUtil = BCOGC_UTILS_TYPES.Order.getUtil(mockAuthPayload, mockCSVRow);
    expect(orderUtil).toBeDefined();
    expect(orderUtil.recordType._schemaName).toBe('Order');
    expect(orderUtil.recordType.displayName).toBe('Order');
    expect(orderUtil.recordType.recordControllerName).toBe('orders');
  });

  it('should return Inspection utility', () => {
    const inspectionUtil = BCOGC_UTILS_TYPES.Inspection.getUtil(mockAuthPayload, mockCSVRow);
    expect(inspectionUtil).toBeDefined();
    expect(inspectionUtil.recordType._schemaName).toBe('Inspection');
    expect(inspectionUtil.recordType.displayName).toBe('Inspection');
    expect(inspectionUtil.recordType.recordControllerName).toBe('inspections');
  });

  it('should return AdministrativePenalty utility', () => {
    const administrativePenaltyUtil = BCOGC_UTILS_TYPES.AdministrativePenalty.getUtil(mockAuthPayload, mockCSVRow);
    expect(administrativePenaltyUtil).toBeDefined();
    expect(administrativePenaltyUtil.recordType._schemaName).toBe('AdministrativePenalty');
    expect(administrativePenaltyUtil.recordType.displayName).toBe('Administrative Penalty');
    expect(administrativePenaltyUtil.recordType.recordControllerName).toBe('administrativePenalties');
  });
  
  it('should return Warning utility', () => {
    const warningUtil = BCOGC_UTILS_TYPES.Warning.getUtil(mockAuthPayload, mockCSVRow);
    expect(warningUtil).toBeDefined();
    expect(warningUtil.recordType._schemaName).toBe('Warning');
    expect(warningUtil.recordType.displayName).toBe('Warning');
    expect(warningUtil.recordType.recordControllerName).toBe('warnings');
  });
});
