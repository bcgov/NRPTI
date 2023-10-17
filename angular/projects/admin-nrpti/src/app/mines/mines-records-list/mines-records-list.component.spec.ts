// TODO: see if test can be fixed. Using routerLink creates errors with blank paths. See bug: https://github.com/angular/angular/issues/27674

// import { TestBed } from '@angular/core/testing';
// import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { ActivatedRoute } from '@angular/router';
// import { RouterTestingModule } from '@angular/router/testing';
// import { NgxPaginationModule } from 'ngx-pagination';
// import { GlobalModule, LoadingScreenService, TableTemplateUtils, Utils } from 'nrpti-angular-components';
// import { CommonModule } from '../../../../../common/src/app/common.module';
// import { ActivatedRouteStub, TestBedHelper } from '../../../../../common/src/app/spec/spec-utils';
// import { SharedModule } from '../../shared/shared.module';
// import { MinesRecordsListComponent } from './mines-records-list.component';

// describe('MinesRecordsListComponent', () => {
//   const testBedHelper = new TestBedHelper<MinesRecordsListComponent>(MinesRecordsListComponent);

//   // component constructor mocks
//   const mockLocation = jasmine.createSpyObj('Location', ['go']);
//   mockLocation.go.and.stub();
//   const mockRouter = jasmine.createSpyObj('Router', ['navigate', 'createUrlTree']);
//   mockRouter.createUrlTree.and.returnValue('');
//   const mockActivatedRoute = new ActivatedRouteStub();

//   const mockLoadingScreenService = {
//     setLoadingState: () => {}
//   };

//   beforeEach((() => {
//     TestBed.configureTestingModule({
//       imports: [
//         RouterTestingModule,
//         CommonModule,
//         GlobalModule,
//         SharedModule,
//         NgxPaginationModule,
//         FormsModule,
//         ReactiveFormsModule
//       ],
//       declarations: [MinesRecordsListComponent],
//       providers: [
//         { provide: Location, useValue: mockLocation },
//         { provide: ActivatedRoute, useValue: mockActivatedRoute },
//         { provide: LoadingScreenService, useValue: mockLoadingScreenService },
//         TableTemplateUtils,
//         Utils
//       ]
//     }).compileComponents();
//   }));

//   it('should create', () => {
//     const { component } = testBedHelper.createComponent();

//     expect(component).toBeTruthy();
//   });
// });
