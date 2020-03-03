import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatSnackBarModule, MatSlideToggleModule } from '@angular/material';

import { OrderByPipe } from './pipes/order-by.pipe';
import { NewlinesPipe } from './pipes/newlines.pipe';
import { ObjectFilterPipe } from './pipes/object-filter.pipe';
import { LinkifyPipe } from './pipes/linkify.pipe';

@NgModule({
  imports: [BrowserModule, MatSlideToggleModule, MatSnackBarModule],
  declarations: [OrderByPipe, NewlinesPipe, ObjectFilterPipe, LinkifyPipe],
  exports: [MatSlideToggleModule, MatSnackBarModule, OrderByPipe, NewlinesPipe, LinkifyPipe]
})
export class SharedModule {}
