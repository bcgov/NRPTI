import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {
  MatSnackBarModule,
  MatSlideToggleModule,
  MatAutocompleteModule,
  MatCheckboxModule,
  MatSelectModule,
  MatTooltipModule
} from '@angular/material';

import { OrderByPipe } from './pipes/order-by.pipe';
import { NewlinesPipe } from './pipes/newlines.pipe';
import { ObjectFilterPipe } from './pipes/object-filter.pipe';
import { LinkifyPipe } from './pipes/linkify.pipe';
import { ProjectLinkPipe } from './pipes/project-link.pipe';

@NgModule({
  imports: [
    BrowserModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatAutocompleteModule,
    MatCheckboxModule,
    MatSelectModule,
    MatTooltipModule
  ],
  declarations: [OrderByPipe, NewlinesPipe, ObjectFilterPipe, LinkifyPipe, ProjectLinkPipe],
  exports: [
    MatSlideToggleModule,
    MatSnackBarModule,
    MatAutocompleteModule,
    MatCheckboxModule,
    MatSelectModule,
    MatTooltipModule,
    OrderByPipe,
    NewlinesPipe,
    LinkifyPipe,
    ProjectLinkPipe
  ]
})
export class SharedModule {}
