import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxPaginationModule } from 'ngx-pagination';
import { GlobalModule, LoadingScreenService, Utils } from 'nrpti-angular-components';
import { Mine, Link } from '../../../../../common/src/app/models/bcmi';
import { ActivatedRouteStub, TestBedHelper } from '../../../../../common/src/app/spec/spec-utils';
import { MinesAddEditComponent } from './mines-add-edit.component';

describe('MinesAddEditComponent', () => {
  const testBedHelper = new TestBedHelper<MinesAddEditComponent>(MinesAddEditComponent);

  // component constructor mocks
  const mockLocation = jasmine.createSpyObj('Location', ['go']);
  const mockRouter = jasmine.createSpyObj('Router', ['navigate']);
  const mockActivatedRoute = new ActivatedRouteStub();

  const mockLoadingScreenService = {
    isLoading: false,
    setLoadingState: () => {
      return false;
    }
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        FormsModule,
        ReactiveFormsModule,
        GlobalModule,
        NgxPaginationModule,
        NgbModule.forRoot()
      ],
      declarations: [MinesAddEditComponent],
      providers: [
        Utils,
        { provide: LoadingScreenService, useValue: mockLoadingScreenService },
        { provide: Location, useValue: mockLocation },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  it('should create', () => {
    const { component } = testBedHelper.createComponent();

    expect(component).toBeTruthy();
  });

  describe('togglePublish', () => {
    it('sets publish control to true if record meets publishing criteria', () => {
      const { component } = testBedHelper.createComponent();

      // stub component
      component.isFormValid = () => true;
      component.checkCanPublish = () => true;

      component.canPublish = true;

      component.myForm = new FormGroup({
        publish: new FormControl(false)
      });

      component.togglePublish({ checked: true });

      expect(component.myForm.get('publish').value).toEqual(true);
    });

    it('does nothing if record does not meet publishing criteria', () => {
      const { component } = testBedHelper.createComponent();

      // stub component
      component.isFormValid = () => true;
      component.checkCanPublish = () => false;

      component.canPublish = false;

      component.myForm = new FormGroup({
        publish: new FormControl(false)
      });

      component.togglePublish({ checked: true });

      expect(component.myForm.get('publish').value).toEqual(false);
    });
  });

  describe('getLinksFormGroups', () => {
    it('builds an array of form groups from the mine record links', () => {
      const { component } = testBedHelper.createComponent();

      component.mine = new Mine({
        links: [
          { title: 'titleA', url: 'urlA' },
          { title: 'titleB', url: 'urlB' }
        ]
      });

      const formGroups: FormGroup[] = component.getLinksFormGroups();

      expect(formGroups.length).toEqual(2);
      expect(formGroups[0].get('title').value).toEqual('titleA');
      expect(formGroups[0].get('url').value).toEqual('urlA');
      expect(formGroups[1].get('title').value).toEqual('titleB');
      expect(formGroups[1].get('url').value).toEqual('urlB');
    });

    it('builds an empty array when mine links are empty', () => {
      const { component } = testBedHelper.createComponent();

      component.mine = new Mine({
        links: []
      });

      const formGroups: FormGroup[] = component.getLinksFormGroups();

      expect(formGroups.length).toEqual(0);
    });

    it('builds an empty array when mine links is null', () => {
      const { component } = testBedHelper.createComponent();

      component.mine = new Mine();

      const formGroups: FormGroup[] = component.getLinksFormGroups();

      expect(formGroups.length).toEqual(0);
    });
  });

  describe('parseLinksFormGroups', () => {
    it('builds an array of links from links FormArray', () => {
      const { component } = testBedHelper.createComponent();

      // stub component
      component.isFormValid = () => true;

      component.myForm = new FormGroup({
        links: new FormArray([
          new FormGroup({
            title: new FormControl('titleA'),
            url: new FormControl('urlA')
          }),
          new FormGroup({
            title: new FormControl('titleB'),
            url: new FormControl('urlB')
          }),
          new FormGroup({
            title: new FormControl(''),
            url: new FormControl('')
          })
        ])
      });

      const links: Link[] = component.parseLinksFormGroups() as Link[];

      expect(links.length).toEqual(2);
      expect(links[0].title).toEqual('titleA');
      expect(links[0].url).toEqual('urlA');
      expect(links[1].title).toEqual('titleB');
      expect(links[1].url).toEqual('urlB');
    });

    it('builds an empty array when formArray is empty', () => {
      const { component } = testBedHelper.createComponent();

      // stub component
      component.isFormValid = () => true;

      component.myForm = new FormGroup({
        links: new FormArray([])
      });
      const links: object[] = component.parseLinksFormGroups();

      expect(links.length).toEqual(0);
    });
  });

  describe('populateTextFields', () => {
    it('sets the lastEditedSubText if dateUpdated is not null', () => {
      const { component } = testBedHelper.createComponent();

      component.mine = new Mine({ dateUpdated: new Date() });

      component.populateTextFields();

      expect(component.lastEditedSubText).toContain('Last Edited on ');
    });

    it('sets the lastEditedSubText if dateUpdated is null and dateAdded is not null', () => {
      const { component } = testBedHelper.createComponent();

      component.mine = new Mine({ dateUpdated: null, dateAdded: new Date() });

      component.populateTextFields();

      expect(component.lastEditedSubText).toContain('Added on ');
    });
  });

  describe('buildMineObject', () => {
    it('parses the dirty form controls into an object', () => {
      const { component } = testBedHelper.createComponent();

      // stub component
      component.isFormValid = () => true;
      component.checkCanPublish = () => true;

      component.mine = new Mine({ _id: '123' });
      component.canPublish = true;

      component.myForm = new FormGroup({
        description: new FormControl('descriptionA'),
        summary: new FormControl('summaryB'),
        type: new FormControl('typeC'),
        links: new FormArray([
          new FormGroup({
            title: new FormControl('title1'),
            url: new FormControl('url1')
          }),
          new FormGroup({
            title: new FormControl('title2'),
            url: new FormControl('url2')
          })
        ]),
        publish: new FormControl(true)
      });

      component.myForm.get('description').markAsDirty();
      component.myForm.get('summary').markAsDirty();
      component.myForm.get('type').markAsDirty();
      component.myForm.get('links').markAsDirty();
      component.myForm.get('publish').markAsDirty();

      const mineObject = component.buildMineObject();

      expect(mineObject['description']).toEqual('descriptionA');
      expect(mineObject['summary']).toEqual('summaryB');
      expect(mineObject['type']).toEqual('typeC');
      expect(mineObject['links']).toEqual([
        new Link({ title: 'title1', url: 'url1' }),
        new Link({ title: 'title2', url: 'url2' })
      ]);
      expect(mineObject['addRole']).toEqual('public');
    });

    it('does not allow publishing if required fields are missing', () => {
      const { component } = testBedHelper.createComponent();

      // stub component
      component.isFormValid = () => true;
      component.checkCanPublish = () => false;

      component.mine = new Mine({ _id: '123' });
      component.canPublish = false;

      component.myForm = new FormGroup({
        description: new FormControl(''),
        summary: new FormControl(''),
        type: new FormControl(''),
        links: new FormArray([
          new FormGroup({
            title: new FormControl(''),
            url: new FormControl('')
          }),
          new FormGroup({
            title: new FormControl(''),
            url: new FormControl('')
          })
        ]),
        publish: new FormControl(true)
      });

      component.myForm.get('publish').markAsDirty();

      const mineObject = component.buildMineObject();

      expect(mineObject['addRole']).not.toBeDefined();
    });
  });
});
