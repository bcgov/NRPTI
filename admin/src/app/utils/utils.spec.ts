import { Utils } from './utils';

describe('Utils', () => {
  describe('convertArrayIntoPipeString', () => {
    it('given an empty array returns empty string', () => {
      const result = Utils.convertArrayIntoPipeString([]);

      expect(result).toEqual('');
    });

    it('given a valid array returns a pipe delimited string', () => {
      const result = Utils.convertArrayIntoPipeString(['dog', 'cat', 'bird', 'big lizard']);

      expect(result).toEqual('dog|cat|bird|big lizard');
    });
  });
});
