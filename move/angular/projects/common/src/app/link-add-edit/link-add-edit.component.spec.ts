import { TestBed } from '@angular/core/testing';
import { LinkAddEditComponent } from './link-add-edit.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, FormGroup, FormArray, FormControl, ReactiveFormsModule } from '@angular/forms';
import { TestBedHelper } from '../../../../common/src/app/spec/spec-utils';

describe('LinkAddEditComponent', () => {
  const testBedHelper = new TestBedHelper<LinkAddEditComponent>(LinkAddEditComponent);

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LinkAddEditComponent],
      imports: [FormsModule, ReactiveFormsModule, NgbModule]
    }).compileComponents();
  });

  it('should create', () => {
    const { component, fixture } = testBedHelper.createComponent(false);

    component.formArray = new FormArray([]);

    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  describe('addLink', () => {
    it('adds a new link to the array', () => {
      const { component, fixture } = testBedHelper.createComponent(false);

      // const defaultLinkFormGroup = new FormGroup({ title: new FormControl(), url: new FormControl() });
      const initialLinkFormGroup = new FormGroup({ title: new FormControl('titleA'), url: new FormControl('urlA') });

      component.formArray = new FormArray([initialLinkFormGroup]);

      fixture.detectChanges();

      component.addLink();

      expect(component.formArray.value.length).toEqual(2);
      expect({ ...component.formArray.value[0] }).toEqual({ title: 'titleA', url: 'urlA' });
      expect({ ...component.formArray.value[1] }).toEqual({ title: '', url: '' });
    });
  });

  describe('dropLink', () => {
    it('repositions a link item in the array', () => {
      const { component, fixture } = testBedHelper.createComponent(false);

      const linkFormGroup1 = new FormGroup({ title: new FormControl('titleA'), url: new FormControl('urlA') });
      const linkFormGroup2 = new FormGroup({ title: new FormControl('titleB'), url: new FormControl('urlB') });
      const linkFormGroup3 = new FormGroup({ title: new FormControl('titleC'), url: new FormControl('urlC') });

      component.formArray = new FormArray([linkFormGroup1, linkFormGroup2, linkFormGroup3]);

      fixture.detectChanges();

      component.dropLink({
        previousIndex: 0,
        currentIndex: 2,
        item: null,
        container: null,
        previousContainer: null,
        isPointerOverContainer: null
      });

      expect(component.formArray.value.length).toEqual(3);
      expect({ ...component.formArray.value[0] }).toEqual({ title: 'titleB', url: 'urlB' });
      expect({ ...component.formArray.value[1] }).toEqual({ title: 'titleC', url: 'urlC' });
      expect({ ...component.formArray.value[2] }).toEqual({ title: 'titleA', url: 'urlA' });
      expect(component.formArray.dirty).toEqual(true);
    });
  });

  describe('removeLink', () => {
    it('removes a link from the array', () => {
      const { component, fixture } = testBedHelper.createComponent(false);

      const linkFormGroup1 = new FormGroup({ title: new FormControl('titleA'), url: new FormControl('urlA') });
      const linkFormGroup2 = new FormGroup({ title: new FormControl('titleB'), url: new FormControl('urlB') });
      const linkFormGroup3 = new FormGroup({ title: new FormControl('titleC'), url: new FormControl('urlC') });

      component.formArray = new FormArray([linkFormGroup1, linkFormGroup2, linkFormGroup3]);

      fixture.detectChanges();

      component.removeLink(1);

      expect(component.formArray.value.length).toEqual(2);
      expect({ ...component.formArray.value[0] }).toEqual({ title: 'titleA', url: 'urlA' });
      expect({ ...component.formArray.value[1] }).toEqual({ title: 'titleC', url: 'urlC' });
    });
  });
});
