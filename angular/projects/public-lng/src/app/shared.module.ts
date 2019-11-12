import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatProgressBarModule, MatSnackBarModule } from '@angular/material';
import { NgxTextOverflowClampModule } from 'ngx-text-overflow-clamp';

import { OrderByPipe } from './pipes/order-by.pipe';
import { NewlinesPipe } from './pipes/newlines.pipe';
import { ObjectFilterPipe } from './pipes/object-filter.pipe';
import { LinkifyPipe } from './pipes/linkify.pipe';

// re-usable component widgets
import { ActivityComponent } from './activity/activity.component';

@NgModule({
  imports: [BrowserModule, MatProgressBarModule, MatSnackBarModule, NgxTextOverflowClampModule],
  declarations: [OrderByPipe, NewlinesPipe, ObjectFilterPipe, LinkifyPipe, ActivityComponent],
  exports: [
    MatProgressBarModule,
    MatSnackBarModule,
    NgxTextOverflowClampModule,
    OrderByPipe,
    NewlinesPipe,
    ObjectFilterPipe,
    LinkifyPipe,
    ActivityComponent
  ]
})
export class SharedModule {}
