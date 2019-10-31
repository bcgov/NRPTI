import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule } from '@angular/router';

// Modules
import { SharedModule } from 'app/shared.module';

// Components
import { DocumentsComponent } from './documents.component';
import { ExplorePanelComponent } from './explore-panel/explore-panel.component';
import { DateInputComponent } from './explore-panel/date-input/date-input.component';

@NgModule({
  imports: [CommonModule, FormsModule, NgbModule.forRoot(), RouterModule, SharedModule],
  declarations: [DocumentsComponent, ExplorePanelComponent, DateInputComponent],
  exports: [DocumentsComponent, ExplorePanelComponent]
})
export class DocumentsModule {}
