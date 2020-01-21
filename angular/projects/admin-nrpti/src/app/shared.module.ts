import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatSnackBarModule, MatSlideToggleModule } from '@angular/material';

import { DatePipe } from '@angular/common';
import { OrderByPipe } from './pipes/order-by.pipe';
import { NewlinesPipe } from './pipes/newlines.pipe';
import { ObjectFilterPipe } from './pipes/object-filter.pipe';
import { LinkifyPipe } from './pipes/linkify.pipe';

import { FileUploadComponent } from './file-upload/file-upload.component';

@NgModule({
  imports: [BrowserModule, MatSlideToggleModule, MatSnackBarModule],
  declarations: [OrderByPipe, NewlinesPipe, ObjectFilterPipe, LinkifyPipe, FileUploadComponent],
  providers: [DatePipe],
  exports: [MatSlideToggleModule, MatSnackBarModule, OrderByPipe, NewlinesPipe, LinkifyPipe, FileUploadComponent]
})
export class SharedModule {}
