import { BaseApp2Page } from './app.po';

describe('lng-public App', () => {
  let page: BaseApp2Page;

  beforeEach(() => {
    page = new BaseApp2Page();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
