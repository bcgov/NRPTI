import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { OrderByPipe } from './pipes/order-by.pipe';
import { NewlinesPipe } from './pipes/newlines.pipe';
import { ObjectFilterPipe } from './pipes/object-filter.pipe';
import { LinkifyPipe } from './pipes/linkify.pipe';

// re-usable component widgets
import { ActivityComponent } from './activity/activity.component';

@NgModule({
  imports: [BrowserModule, MatProgressBarModule, MatSnackBarModule, ActivityComponent],
  declarations: [OrderByPipe, NewlinesPipe, ObjectFilterPipe, LinkifyPipe],
  exports: [
    MatProgressBarModule,
    MatSnackBarModule,
    OrderByPipe,
    NewlinesPipe,
    ObjectFilterPipe,
    LinkifyPipe,
    ActivityComponent
  ]
})
export class SharedModule {}
