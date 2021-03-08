import { ProjectLinkPipe } from './project-link.pipe';

describe('LinkifyPipe', () => {
  it('create an instance', () => {
    const pipe = new ProjectLinkPipe();
    expect(pipe).toBeTruthy();
  });
});
