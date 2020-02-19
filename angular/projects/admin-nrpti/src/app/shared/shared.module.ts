import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatSnackBarModule, MatSlideToggleModule, MatAutocompleteModule } from '@angular/material';

import { DatePipe } from '@angular/common';
import { OrderByPipe } from '../pipes/order-by.pipe';
import { NewlinesPipe } from '../pipes/newlines.pipe';
import { ObjectFilterPipe } from '../pipes/object-filter.pipe';
import { LinkifyPipe } from '../pipes/linkify.pipe';

@NgModule({
  imports: [BrowserModule, MatSlideToggleModule, MatSnackBarModule, MatAutocompleteModule],
  declarations: [OrderByPipe, NewlinesPipe, ObjectFilterPipe, LinkifyPipe],
  providers: [DatePipe],
  exports: [MatSlideToggleModule, MatSnackBarModule, MatAutocompleteModule, OrderByPipe, NewlinesPipe, LinkifyPipe],
  entryComponents: []
})
export class SharedModule {}
