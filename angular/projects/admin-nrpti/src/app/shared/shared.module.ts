import { NgModule } from '@angular/core';

// modules
import { BrowserModule } from '@angular/platform-browser';
import {
  MatSnackBarModule,
  MatSlideToggleModule,
  MatAutocompleteModule,
  MatCheckboxModule,
  MatSelectModule,
  MatMenuModule
} from '@angular/material';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GlobalModule } from 'nrpti-angular-components';
import { CommonModule as NrptiCommonModule } from '../../../../common/src/app/common.module';

// pipes
import { DatePipe } from '@angular/common';
import { OrderByPipe } from '../pipes/order-by.pipe';
import { NewlinesPipe } from '../pipes/newlines.pipe';
import { ObjectFilterPipe } from '../pipes/object-filter.pipe';
import { LinkifyPipe } from '../pipes/linkify.pipe';

@NgModule({
  imports: [
    BrowserModule,
    GlobalModule,
    NrptiCommonModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatAutocompleteModule,
    MatCheckboxModule,
    MatSelectModule,
    MatMenuModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [OrderByPipe, NewlinesPipe, ObjectFilterPipe, LinkifyPipe],
  providers: [DatePipe],
  exports: [
    MatSlideToggleModule,
    MatSnackBarModule,
    MatAutocompleteModule,
    MatCheckboxModule,
    MatSelectModule,
    MatMenuModule,
    OrderByPipe,
    NewlinesPipe,
    LinkifyPipe
  ],
  entryComponents: []
})
export class SharedModule {}
