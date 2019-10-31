import { DemoCodes } from './recordConstants';

describe('record constants', () => {
  describe('DemoCodes', () => {
    describe('getCodeGroups()', () => {
      it('returns 1 code groups', () => {
        const codeGroups = new DemoCodes().getCodeGroups();
        expect(codeGroups.length).toEqual(1);
        expect(codeGroups).toContain(DemoCodes.BUILD_COMPLETE);
      });
    });
  });
});
