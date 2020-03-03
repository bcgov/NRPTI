import { TestBed } from '@angular/core/testing';

import { ExportService } from './export.service';

describe('ExportService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ExportService]
    });
  });

  it('should be created', () => {
    const service = TestBed.get(ExportService);

    expect(service).toBeTruthy();
  });

  describe('getExportDateFormatter', () => {
    it('returns null if property not found', () => {
      const rowFunction = ExportService.getExportDateFormatter('dateCreated');

      const result = rowFunction({ dateDeleted: new Date() });

      expect(result).toBe(null);
    });

    it('returns null if property is invalid', () => {
      const rowFunction = ExportService.getExportDateFormatter('dateCreated');

      const result = rowFunction({ dateCreated: 'invalid date' });

      expect(result).toBe(null);
    });

    it('returns the formatted date', () => {
      const rowFunction = ExportService.getExportDateFormatter('dateCreated');

      const result = rowFunction({ dateCreated: '2015-11-11' });

      expect(result).toBe('2015-11-11');
    });
  });

  describe('getExportPadFormatter', () => {
    it('returns null if property not found', () => {
      const rowFunction = ExportService.getExportPadFormatter('id', 10, '0');

      const result = rowFunction({ fileId: '123456' });

      expect(result).toBe(null);
    });

    it('returns null if property is invalid', () => {
      const rowFunction = ExportService.getExportPadFormatter('id', 10, '0');

      const result = rowFunction({ id: null });

      expect(result).toBe(null);
    });

    it('returns the start-padded string', () => {
      const rowFunction = ExportService.getExportPadFormatter('id', 10, '0');

      const result = rowFunction({ id: 123456 });

      expect(result).toBe('0000123456');
    });

    it('returns the end-padded string', () => {
      const rowFunction = ExportService.getExportPadFormatter('id', 10, '0', true);

      const result = rowFunction({ id: 123456 });

      expect(result).toBe('1234560000');
    });
  });
});
