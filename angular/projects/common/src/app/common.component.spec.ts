import { TestBed, async } from '@angular/core/testing';
import { CommonComponent } from './common.component';

describe('CommonComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CommonComponent]
    }).compileComponents();
  }));

  it('should create the common', () => {
    const fixture = TestBed.createComponent(CommonComponent);
    const common = fixture.debugElement.componentInstance;
    expect(common).toBeTruthy();
  });

  it("should have as title 'common'", () => {
    const fixture = TestBed.createComponent(CommonComponent);
    const common = fixture.debugElement.componentInstance;
    expect(common.title).toEqual('common');
  });

  it('should render title in a h1 tag', () => {
    const fixture = TestBed.createComponent(CommonComponent);
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('h1').textContent).toContain('Welcome to common!');
  });
});
