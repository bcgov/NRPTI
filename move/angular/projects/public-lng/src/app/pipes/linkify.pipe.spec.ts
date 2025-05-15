/*
import { LinkifyPipe } from './linkify.pipe';

describe('LinkifyPipe', () => {
  it('create an instance', () => {
    const pipe = new LinkifyPipe();
    expect(pipe).toBeTruthy();
  });

  it('turns standard urls into anchor tags', () => {
    const pipe = new LinkifyPipe();

    const initialString = 'This is a string [google](www.google.com/some/extension/) with a url in it.';
    const expectedString =
      'This is a string <a href="http://www.google.com/some/extension/" target="_blank">google</a> with a url in it.';

    expect(pipe.transform(initialString)).toEqual(expectedString);
  });

  it('turns relative urls into anchor tags', () => {
    const pipe = new LinkifyPipe();

    const initialString = 'This is a string [relative url](/some/relative/url/) with a url in it.';
    // eslint-disable-next-line max-line-length
    const expectedStringRegex =
      /This is a string <a href="http:\/\/.+\/some\/relative\/url\/" target="_blank">relative url<\/a> with a url in it./;

    expect(pipe.transform(initialString)).toMatch(expectedStringRegex);
  });
});
*/
