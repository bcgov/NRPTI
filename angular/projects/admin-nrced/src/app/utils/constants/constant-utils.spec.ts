import { ConstantUtils, CodeType } from './constant-utils';
import { DemoCodes } from './record-constants';

describe('constantUtils', () => {
  describe('getCodeSet()', () => {
    it('returns null if undefined codeType provided', () => {
      const codeSet = ConstantUtils.getCodeSet(undefined);
      expect(codeSet).toEqual(null);
    });

    it('returns null if null codeType provided', () => {
      const codeSet = ConstantUtils.getCodeSet(null);
      expect(codeSet).toEqual(null);
    });

    it('returns DemoCodes if DEMO codeType provided', () => {
      const codeSet = ConstantUtils.getCodeSet(CodeType.DEMO);
      expect(codeSet.getCodeGroups()).toEqual(new DemoCodes().getCodeGroups());
    });
  });

  describe('getCodeGroup()', () => {
    it('returns null if undefined codeType provided', () => {
      const codeGroup = ConstantUtils.getCodeGroup(undefined, 'BUILD_COMPLETE');
      expect(codeGroup).toEqual(null);
    });

    it('returns null if null codeType provided', () => {
      const codeGroup = ConstantUtils.getCodeGroup(null, 'BUILD_COMPLETE');
      expect(codeGroup).toEqual(null);
    });

    it('returns null if undefined searchString provided', () => {
      const codeGroup = ConstantUtils.getCodeGroup(CodeType.DEMO, undefined);
      expect(codeGroup).toEqual(null);
    });

    it('returns null if null searchString provided', () => {
      const codeGroup = ConstantUtils.getCodeGroup(CodeType.DEMO, null);
      expect(codeGroup).toEqual(null);
    });

    it('returns null if empty searchString provided', () => {
      const codeGroup = ConstantUtils.getCodeGroup(CodeType.DEMO, '');
      expect(codeGroup).toEqual(null);
    });

    it('returns null if empty searchString provided', () => {
      const codeGroup = ConstantUtils.getCodeGroup(CodeType.DEMO, 'this wont match anything');
      expect(codeGroup).toEqual(null);
    });

    it('returns demo code group if status codeType and matching searchString provided', () => {
      const codeGroup = ConstantUtils.getCodeGroup(CodeType.DEMO, 'COMPLETE');
      expect(codeGroup).toEqual(DemoCodes.BUILD_COMPLETE);
    });
  });

  describe('getCode()', () => {
    it('returns null if undefined codeType provided', () => {
      const code = ConstantUtils.getCode(undefined, 'BUILD_COMPLETE');
      expect(code).toEqual(null);
    });

    it('returns null if null codeType provided', () => {
      const code = ConstantUtils.getCode(null, 'BUILD_COMPLETE');
      expect(code).toEqual(null);
    });

    it('returns null if undefined searchString provided', () => {
      const code = ConstantUtils.getCode(CodeType.DEMO, undefined);
      expect(code).toEqual(null);
    });

    it('returns null if null searchString provided', () => {
      const code = ConstantUtils.getCode(CodeType.DEMO, null);
      expect(code).toEqual(null);
    });

    it('returns null if empty searchString provided', () => {
      const code = ConstantUtils.getCode(CodeType.DEMO, '');
      expect(code).toEqual(null);
    });

    it('returns null if non-matching searchString provided', () => {
      const code = ConstantUtils.getCode(CodeType.DEMO, 'this wont match anything');
      expect(code).toEqual(null);
    });

    it('returns demo code if status codeType and matching searchString provided', () => {
      const code = ConstantUtils.getCode(CodeType.DEMO, 'COMPLETE');
      expect(code).toEqual(DemoCodes.BUILD_COMPLETE.code);
    });
  });

  describe('getParam()', () => {
    it('returns null if undefined codeType provided', () => {
      const param = ConstantUtils.getParam(undefined, 'BUILD_COMPLETE');
      expect(param).toEqual(null);
    });

    it('returns null if null codeType provided', () => {
      const param = ConstantUtils.getParam(null, 'BUILD_COMPLETE');
      expect(param).toEqual(null);
    });

    it('returns null if undefined searchString provided', () => {
      const param = ConstantUtils.getParam(CodeType.DEMO, undefined);
      expect(param).toEqual(null);
    });

    it('returns null if null searchString provided', () => {
      const param = ConstantUtils.getParam(CodeType.DEMO, null);
      expect(param).toEqual(null);
    });

    it('returns null if empty searchString provided', () => {
      const param = ConstantUtils.getParam(CodeType.DEMO, '');
      expect(param).toEqual(null);
    });

    it('returns null if non-matching searchString provided', () => {
      const param = ConstantUtils.getParam(CodeType.DEMO, 'this wont match anything');
      expect(param).toEqual(null);
    });
  });

  describe('getTextShort()', () => {
    it('returns null if undefined codeType provided', () => {
      const stringShort = ConstantUtils.getTextShort(undefined, 'BUILD_COMPLETE');
      expect(stringShort).toEqual(null);
    });

    it('returns null if null codeType provided', () => {
      const stringShort = ConstantUtils.getTextShort(null, 'BUILD_COMPLETE');
      expect(stringShort).toEqual(null);
    });

    it('returns null if undefined searchString provided', () => {
      const stringShort = ConstantUtils.getTextShort(CodeType.DEMO, undefined);
      expect(stringShort).toEqual(null);
    });

    it('returns null if null searchString provided', () => {
      const stringShort = ConstantUtils.getTextShort(CodeType.DEMO, null);
      expect(stringShort).toEqual(null);
    });

    it('returns null if empty searchString provided', () => {
      const stringShort = ConstantUtils.getTextShort(CodeType.DEMO, '');
      expect(stringShort).toEqual(null);
    });

    it('returns null if non-matching searchString provided', () => {
      const stringShort = ConstantUtils.getTextShort(CodeType.DEMO, 'this wont match anything');
      expect(stringShort).toEqual(null);
    });
  });

  describe('getTextLong()', () => {
    it('returns null if undefined codeType provided', () => {
      const stringLong = ConstantUtils.getTextLong(undefined, 'BUILD_COMPLETE');
      expect(stringLong).toEqual(null);
    });

    it('returns null if null codeType provided', () => {
      const stringLong = ConstantUtils.getTextLong(null, 'BUILD_COMPLETE');
      expect(stringLong).toEqual(null);
    });

    it('returns null if undefined searchString provided', () => {
      const stringLong = ConstantUtils.getTextLong(CodeType.DEMO, undefined);
      expect(stringLong).toEqual(null);
    });

    it('returns null if null searchString provided', () => {
      const stringLong = ConstantUtils.getTextLong(CodeType.DEMO, null);
      expect(stringLong).toEqual(null);
    });

    it('returns null if empty searchString provided', () => {
      const stringLong = ConstantUtils.getTextLong(CodeType.DEMO, '');
      expect(stringLong).toEqual(null);
    });

    it('returns null if non-matching searchString provided', () => {
      const stringLong = ConstantUtils.getTextLong(CodeType.DEMO, 'this wont match anything');
      expect(stringLong).toEqual(null);
    });
  });

  describe('getMappedCodes()', () => {
    it('returns null if undefined codeType provided', () => {
      const mappedCodes = ConstantUtils.getMappedCodes(undefined, 'BUILD_COMPLETE');
      expect(mappedCodes).toEqual(null);
    });

    it('returns null if null codeType provided', () => {
      const mappedCodes = ConstantUtils.getMappedCodes(null, 'BUILD_COMPLETE');
      expect(mappedCodes).toEqual(null);
    });

    it('returns null if undefined searchString provided', () => {
      const mappedCodes = ConstantUtils.getMappedCodes(CodeType.DEMO, undefined);
      expect(mappedCodes).toEqual(null);
    });

    it('returns null if null searchString provided', () => {
      const mappedCodes = ConstantUtils.getMappedCodes(CodeType.DEMO, null);
      expect(mappedCodes).toEqual(null);
    });

    it('returns null if empty searchString provided', () => {
      const mappedCodes = ConstantUtils.getMappedCodes(CodeType.DEMO, '');
      expect(mappedCodes).toEqual(null);
    });

    it('returns null if non-matching searchString provided', () => {
      const mappedCodes = ConstantUtils.getMappedCodes(CodeType.DEMO, 'this wont match anything');
      expect(mappedCodes).toEqual(null);
    });
  });
});
