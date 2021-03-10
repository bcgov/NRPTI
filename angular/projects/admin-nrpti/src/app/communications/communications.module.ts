import { LngMapInfoComponent } from './lng-map-info/lng-map-info.component';
// modules
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BrowserModule } from '@angular/platform-browser';
import { EditorModule } from '@tinymce/tinymce-angular';
import { GlobalModule } from 'nrpti-angular-components';

import { CommonModule as NrptiCommonModule } from '../../../../common/src/app/common.module';
import { CommunicationsComponent } from './communications.component';
import { LngMapInfoResolver } from './lng-map-info/lng-map-info-resolver';


@NgModule({
  imports: [
    BrowserModule,
    EditorModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    GlobalModule,
    NrptiCommonModule,
    RouterModule,
    NgbModule,
  ],
  declarations: [
    CommunicationsComponent,
    LngMapInfoComponent
  ],
  providers: [
    LngMapInfoResolver
  ],
  entryComponents: [
    CommunicationsComponent
  ],
  exports: []
})
export class CommunicationsModule {}
