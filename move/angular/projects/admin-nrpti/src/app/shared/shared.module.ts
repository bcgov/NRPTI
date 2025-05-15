import { NgModule } from '@angular/core';

// modules
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GlobalModule } from 'nrpti-angular-components';
import { CommonModule as NrptiCommonModule } from '../../../../common/src/app/common.module';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';

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
    MatSnackBarModule,
    MatSlideToggleModule,
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
  ]
})
export class SharedModule {}
