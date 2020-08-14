import { TestBed } from '@angular/core/testing';
import { TestBedHelper } from '../../spec/spec-utils';
import { EntityDetailComponent } from './entity-detail.component';
import { MatSlideToggleModule } from '@angular/material';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

describe('EntityDetailComponent', () => {
  const testBedHelper = new TestBedHelper<EntityDetailComponent>(EntityDetailComponent);

  beforeEach((() => {
    TestBed.configureTestingModule({
      imports: [MatSlideToggleModule, NgbModule.forRoot()],
      declarations: [EntityDetailComponent]
    }).compileComponents();
  }));

  it('should create', () => {
    const { component } = testBedHelper.createComponent();
    expect(component).toBeTruthy();
  });
});
