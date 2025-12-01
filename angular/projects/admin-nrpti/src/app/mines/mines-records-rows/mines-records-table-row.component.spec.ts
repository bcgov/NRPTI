// TODO: see if test can be fixed. Using routerLink creates errors with blank paths. See bug: https://github.com/angular/angular/issues/27674
// TODO: see if test can be fixed. Using routerLink creates errors with blank paths. See bug: https://github.com/angular/angular/issues/27674

// import { TestBed } from '@angular/core/testing';
// import { Router } from '@angular/router';
// import { RouterTestingModule } from '@angular/router/testing';
// import { MinesRecordsTableRowComponent } from './mines-records-table-row.component';
// import { TestBedHelper } from '../../../../../common/src/app/spec/spec-utils';
// import { CommonModule } from '../../../../../common/src/app/common.module';
// import { GlobalModule } from 'nrpti-angular-components';
// import { SharedModule } from '../../shared/shared.module';

// describe('MinesRecordsTableRowComponent', () => {
//   const testBedHelper = new TestBedHelper<MinesRecordsTableRowComponent>(MinesRecordsTableRowComponent);

//   // component constructor mocks
//   const mockRouter = jasmine.createSpyObj('Router', ['navigate']);

//   beforeEach((() => {
//     TestBed.configureTestingModule({
//       imports: [RouterTestingModule, SharedModule, CommonModule, GlobalModule],
//       declarations: [MinesRecordsTableRowComponent],
//       providers: [{ provide: Router, useValue: mockRouter }]
//     }).compileComponents();
//   }));

//   it('should create', () => {
//     const { component, fixture } = testBedHelper.createComponent(false);

//     component.rowData = {};

//     fixture.detectChanges();

//     expect(component).toBeTruthy();
//   });
// });
