// modules
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

// modules
import { GlobalModule } from 'nrpti-angular-components';
import { CommonModule as NrptiCommonModule } from '../../../../common/src/app/common.module';
import { BrowserModule } from '@angular/platform-browser';

import { CommunicationsComponent } from './communications.component';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    GlobalModule,
    ReactiveFormsModule,
    NrptiCommonModule,
    RouterModule,
    NgbModule.forRoot(),
  ],
  declarations: [
    CommunicationsComponent
  ],
  providers: [],
  entryComponents: [
    CommunicationsComponent
  ],
  exports: []
})
export class CommunicationsModule {}
