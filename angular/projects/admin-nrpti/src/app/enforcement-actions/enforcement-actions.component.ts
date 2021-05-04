import { Component, OnInit } from '@angular/core';
import { LoadingScreenService } from 'nrpti-angular-components';

@Component({
  selector: 'app-enforcement-actions',
  templateUrl: './enforcement-actions.component.html',
  styleUrls: ['./enforcement-actions.component.css']
})
export class EnforcementActionsComponent implements OnInit {

  constructor(
    private loadingScreenService: LoadingScreenService
  ) { }

  public pageText = 'TESTTESTTESTTESTTEST';
  public pageTextDraft = '';
  public pageTextEditing = false;
  public tinyMceSettings = {
    base_url: '/tinymce',
    suffix: '.min',
    browser_spellcheck: true,
    height: 240,
    plugins: ['lists, advlist, link'],
    toolbar: ['undo redo | formatselect | ' +
      ' bold italic backcolor | alignleft aligncenter ' +
      ' alignright alignjustify | bullist numlist outdent indent |' +
      ' removeformat | help']
  };

  ngOnInit(): void {
    this.loadingScreenService.setLoadingState(false, 'body');
  }

  setEditingMode() {
    this.pageTextDraft = this.pageText;
    this.pageTextEditing = true;
  }

  cancelEditing() {
    this.pageTextEditing = false;
  }
}
