import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

// modules
import { GlobalModule } from 'nrpti-angular-components';
import { FileUploadComponent } from './file-upload/file-upload.component';

// components

// services

@NgModule({
  declarations: [FileUploadComponent],
  imports: [BrowserModule, GlobalModule],
  providers: [],
  exports: [FileUploadComponent]
})
export class CommonModule { }
