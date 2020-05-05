// modules
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { InlineSVGModule } from 'ng-inline-svg';

// modules
import { GlobalModule } from 'nrpti-angular-components';
import { CommonModule as NrptiCommonModule } from '../../../../common/src/app/common.module';
import { NewsRoutingModule } from './news-routing.module';
import { BrowserModule } from '@angular/platform-browser';

// news
import { NewsListComponent } from './news-list.component';
import { NewsAddEditComponent } from './news-add-edit/news-add-edit.component';
import { NewsTableRowComponent } from './news-rows/news-table-row.component';
import { NewsDetailComponent } from './news-detail/news-detail.component';

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
    NgxPaginationModule,
    NgbModule.forRoot(),
    InlineSVGModule.forRoot(),
    NewsRoutingModule
  ],
  declarations: [
    NewsListComponent,
    NewsAddEditComponent,
    NewsTableRowComponent,
    NewsDetailComponent
  ],
  providers: [],
  entryComponents: [
    NewsTableRowComponent,
    NewsDetailComponent
  ],
  exports: []
})
export class NewsModule {}
